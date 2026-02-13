---
title: 服务器网卡问题
createTime: 2026/02/13 11:01:57
permalink: /article/obmqxx2y/
tags: 
  - MediaMTX
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/5f079a610d1dc90cc5a524d3414ed4ed.jpg
---
<ImageCard
image="https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/5f079a610d1dc90cc5a524d3414ed4ed.jpg"
href="/"
width=400
center=true
/>



# 服务器端 RTSP 拉流失败但本地正常：一次路由与源地址选择错误导致的 MediaMTX/FFmpeg 故障深挖与可复用排查手册

## 摘要

在一套基于 MediaMTX + FFmpeg 的视频汇聚与播放系统中，部分摄像头（大华设备）在 Windows 本地可以稳定播放 RTSP，但在服务器端却无法拉流，表现为 MediaMTX 日志持续 `timed out` / `EOF`，FFprobe 报 `Invalid data found when processing input`。最终定位为服务器对相机网段配置了错误的静态路由，导致出口网卡与源 IP 异常（走虚拟网卡 `Meta`，源地址变为 `198.18.0.1`），相机端或中间策略设备对该源地址的 RTSP 会话不返回应用层响应并主动断开。将相机网段路由改为走业务物理网卡 `ens3f0` 并使用正确源地址后，故障立刻消失。

本文给出完整可发布版复盘：现象、证据链、根因、修复方案、复查方法与长期预防建议，适用于同类“端口通但协议不通、本地可用但服务器不可用”的排障场景。

------

## 1. 系统背景

典型链路如下：

- 摄像头输出：RTSP（554/TCP）
- 服务器侧：MediaMTX 注册 RTSP 源（sourceOnDemand 或 runOnDemand + FFmpeg 回推）
- 前端播放：WebRTC/HTTP/RTSP 等由 MediaMTX 提供的分发协议

故障出现时，海康设备（`172.16.*`）可正常拉流，大华设备（`172.17.234.205`）在服务器侧失败，而 Windows 本地播放器可正常播放相同 RTSP URL。

------

## 2. 现象与错误信息

### 2.1 MediaMTX 日志（典型）

- `[RTSP source] stopped: timed out`
- `[RTSP source] EOF`
- WebRTC session 被关闭：`source of path ... has timed out`

这说明 MediaMTX 作为拉流端未能在规定时间内收到可用媒体数据，或 RTSP 会话在对端关闭后结束。

### 2.2 FFprobe 直连相机（服务器侧）

在服务器上执行（已使用 TCP 拉流）：

```
ffprobe -rtsp_transport tcp "rtsp://admin:admin12345@172.17.234.205:554/cam/realmonitor?channel=1&subtype=1"
```

错误：

```
Invalid data found when processing input
```

这一错误的关键含义是：FFprobe 没有拿到完整可解析的 RTSP 会话信息（常见是拿不到 DESCRIBE 返回的 SDP，或应用层响应异常），并非典型的“解码失败”或“码流损坏”。

------

## 3. 关键证据链：端口可通但 RTSP 应用层不通

### 3.1 路由与源地址选择异常（决定性证据）

第一条必须执行的命令：

```
ip route get 172.17.234.205
```

输出：

```
172.17.234.205 via 198.18.0.2 dev Meta src 198.18.0.1
```

含义是：访问相机 `172.17.234.205` 的流量不是从业务物理网卡出，而是走虚拟/隧道网卡 `Meta`，并且源地址变成了 `198.18.0.1`。

此时即使 TCP 能连通，也很可能因为源地址不被允许或策略设备介入导致 RTSP 会话异常。

### 3.2 路由表确认：相机网段被静态绑定到虚拟网卡

```
ip route | head -n 50
```

关键条目：

```
default via 172.16.214.254 dev ens3f0
172.16.214.0/24 dev ens3f0 src 172.16.214.240
172.17.234.0/24 via 198.18.0.2 dev Meta src 198.18.0.1
198.18.0.0/30 dev Meta src 198.18.0.1
```

结论：默认路由是正确的（ens3f0），但对 `172.17.234.0/24` 这个相机网段，存在更具体的静态路由覆盖默认路由，强制走 `Meta`。

### 3.3 tcpdump：TCP 三次握手成功，但 RTSP 没有响应

抓包观察到：

- TCP 三次握手成功；
- 服务器发送 `RTSP OPTIONS` 请求；
- 对端只 ACK 确认收到，但没有返回 `RTSP/1.0 200 OK` 或 `401 Unauthorized`；
- 随后对端发送 FIN 主动断开连接。

这一模式通常意味着：应用层请求未被对端正常处理（常见原因是访问控制、策略丢弃、链路类型不匹配、回程路径异常），而不是 FFmpeg 参数或编解码问题。若是认证问题，至少会返回 401；若是 URL 不存在，通常会返回 404；而“无任何 RTSP 响应后断开”更像策略性拒绝。

------

## 4. 根因分析

### 4.1 根因一：出口网卡与源 IP 错误

服务器对相机网段配置了静态路由：

- 目标网段：`172.17.234.0/24`
- 出口设备：`Meta`
- 源 IP：`198.18.0.1`

导致相机看到的访问者不是业务网段地址（例如 `172.16.214.240`），而是 `198.18.0.1`。在实际工程里，这会触发如下问题之一：

1. **相机/网关的访问控制**：只允许特定网段访问 RTSP；
2. **中间策略设备的 L7 处理**：对 RTSP 做识别并拒绝异常源地址；
3. **回程链路与期望不一致**：导致应用层协议交互异常。

### 4.2 根因二（潜在隐患）：172.17/16 与 Docker 默认网段冲突风险

路由表中还存在：

```
172.17.0.0/16 dev docker0 src 172.17.0.1 linkdown
```

Docker 默认使用 `172.17.0.0/16`，若业务相机网段恰好也是 172.17.*，将来 docker0 一旦启用，很容易发生路由冲突或异常选路。即使本次问题直接由 `Meta` 路由导致，172.17 段本身也属于高风险冲突段，需要长期治理。

------

## 5. 解决方案

### 5.1 在线快速修复（推荐）

目标：让 `172.17.234.0/24` 走业务网卡 `ens3f0` 并使用业务源 IP `172.16.214.240`。

使用 `ip route replace` 原子替换原有路由，避免误删导致短暂不可达：

```
sudo ip route replace 172.17.234.0/24 via 172.16.214.254 dev ens3f0 src 172.16.214.240
```

这条命令只影响一个特定网段，默认路由不变，风险相对可控。

### 5.2 立即验证

1）确认路由已经改正：

```
ip route get 172.17.234.205
```

期望看到：

- `dev ens3f0`
- `src 172.16.214.240`

2）验证 RTSP 应用层：

```
ffprobe -loglevel debug -rtsp_transport tcp \
"rtsp://admin:admin12345@172.17.234.205:554/cam/realmonitor?channel=1&subtype=1"
```

此时通常会出现 RTSP 响应与 SDP 信息，MediaMTX 的 `timed out` / `EOF` 也会随之消失。

------

## 6. 如何复查与定位：一套可复用的排障流程

本节是可直接贴到团队 Wiki 的 SOP。

### Step 0：明确问题边界

- “本地可播、服务器不可播”优先怀疑网络选路与源地址；
- “服务器某些相机可播、某些不可播”优先怀疑分网段路由、ACL 或策略设备。

### Step 1：检查路由选择与源地址（必须第一步）

```
ip route get <camera_ip>
```

关注点：

- `dev` 是否是业务物理网卡；
- `src` 是否是业务网段 IP；
- `via` 是否为正确网关；
- 若出现 tun/Meta/docker0/cni0 等虚拟网卡，需高度警惕。

### Step 2：检查路由表是否存在更具体路由覆盖默认路由

```
ip route
```

重点搜索目标网段（如 `172.17.234.0/24`）是否被静态绑定到非预期网卡。

### Step 3：端口连通性只作为必要条件

```
nc -vz <camera_ip> 554
```

端口通不代表 RTSP 正常，只能说明 TCP 可达。

### Step 4：服务器原地直连验证（绕过 MediaMTX）

```
ffprobe -loglevel debug -rtsp_transport tcp "<rtsp_url>"
```

若此处失败，问题不在 MediaMTX。

### Step 5：抓包定性“协议没有响应”还是“媒体没数据”

```
sudo tcpdump -i any host <camera_ip> and port 554 -nn -s 0 -vv
```

- 如果能看到 `RTSP/1.0 200` / `401` / `404`，说明应用层有响应；
- 如果只看到请求、ACK、随后 FIN/RST，没有任何 RTSP 响应，优先怀疑源地址/策略/回程路径；
- 如果 RTSP 正常但后续无 RTP 数据，再看 UDP/TCP interleaved、端口范围、防火墙、媒体转发参数。

------

## 7. 长期治理与预防措施

### 7.1 将“路由与源地址自检”纳入上线与告警

对每台服务器/节点，定期对相机列表做轻量探测：

- `ip route get <camera_ip>` 记录 dev/src/via；
- `ffprobe` 在超时阈值内能拿到 SDP 即判定“RTSP 会话健康”。

一旦 dev/src 发生变化（例如从 ens3f0 变为 Meta/docker0），立即告警。此类告警比 MediaMTX 的超时更早、更可解释。

### 7.2 避免业务网段与容器默认网段冲突

若业务存在 172.17.* 摄像头网段，建议调整 Docker 默认地址池到不冲突范围（示例为 172.31.0.0/16）。示例配置：

`/etc/docker/daemon.json`：

```
{
  "bip": "172.31.0.1/16",
  "default-address-pools": [
    {"base":"172.31.0.0/16","size":24}
  ]
}
```

重启 Docker 后需要评估现有容器网络重建影响。

### 7.3 固化路由配置，避免重启丢失

`ip route replace` 属于运行时配置，重启可能丢失。建议将最终路由写入系统网络配置（不同发行版方式不同）：

- Ubuntu / Debian（systemd-networkd / netplan）
- NetworkManager
- 或在启动脚本中持久化（需谨慎、确保幂等）

实践建议：用系统原生网络配置方式持久化，避免脚本“覆盖式”改路由导致不可控。

------

## 8. 常见误区与经验总结

1. **“端口通就不是网络问题”是错误的**
    TCP 可达不代表 RTSP 应用层可达，更不代表媒体数据可达。
2. **先怀疑转码/编码会浪费时间**
    本案例中 ffprobe 在最早的 RTSP 握手阶段就失败，尚未进入解码与转码流程。
3. **最有效的一条命令是 `ip route get`**
    它直接告诉你“系统实际上怎么走”，避免在逻辑上猜测网络路径。
4. **抓包可以把问题从“可能”变成“确定”**
    是否存在 RTSP 响应（200/401/404）是关键分界线。

------

## 9. 结语

这次故障的本质不是 MediaMTX、不是 FFmpeg，也不是大华设备协议兼容，而是服务器对特定相机网段的出口网卡与源地址选择错误。通过 `ip route get` 与抓包建立证据链后，修复方案非常直接：将网段路由切回业务物理网卡并使用正确源 IP。该方法同样适用于多网卡、多隧道、容器网络与跨网段视频汇聚场景。

------

## 附录：本案例关键命令清单（可直接复制）

### 查看选路与源地址

```
ip route get 172.17.234.205
```

### 查看路由表与网卡地址

```
ip route | head -n 50
ip -4 addr
```

### 在线修复（将相机网段走 ens3f0 默认网关并指定源地址）

```
sudo ip route replace 172.17.234.0/24 via 172.16.214.254 dev ens3f0 src 172.16.214.240
```

### 修复后验证

```
ip route get 172.17.234.205
ffprobe -loglevel debug -rtsp_transport tcp \
"rtsp://admin:admin12345@172.17.234.205:554/cam/realmonitor?channel=1&subtype=1"
```

### 抓包观察 RTSP 是否有响应

```
sudo tcpdump -i any host 172.17.234.205 and port 554 -nn -s 0 -vv
```