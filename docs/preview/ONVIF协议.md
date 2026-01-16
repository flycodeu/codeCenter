---
title: ONVIF协议
createTime: 2025/12/23 15:08:42
permalink: /article/0j8007ym/
tags:
  - MediaMTX
  - 视频
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/3e5bf05d61c2bf0f032bcf6a33568d4b.jpg
---

<ImageCard
  image="https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/3e5bf05d61c2bf0f032bcf6a33568d4b.jpg"
  href="/"
  width=400
  center=true
/>

# 基于 Java Spring Boot 的无依赖轻量级 ONVIF 协议接入技术方案
## 1. 概述
ONVIF（Open Network Video Interface Forum）标准是安防行业的通用接口协议，旨在解决不同厂商（如海康威视、大华、宇视等）IP 摄像机与视频管理系统（VMS）之间的互通性问题。

在 Java 后端开发中，传统的接入方式往往依赖于 onvif-java-lib 等第三方库。然而，这些库普遍存在维护停滞（多为 7-9 年前版本）、依赖繁重（引入大量 Axis2 或 CXF 依赖）以及对新设备兼容性差的问题。

本文档提出一种基于原生 SOAP XML 构造的轻量级接入方案。该方案仅依赖 Hutool 工具包进行 HTTP 请求与 XML 解析，具备极高的可控性与兼容性。
## 2. 协议核心与 SOAP 结构解析
ONVIF 的底层通信机制是 SOAP (Simple Object Access Protocol) over HTTP。客户端通过 HTTP POST 向设备发送 XML 格式的指令（Envelope），设备解析后返回 XML 响应。
### 2.1 SOAP 消息结构剖析
一个标准的 ONVIF 请求包结构如下：

```xml
<?xml version="1.0" encoding="utf-8"?>
<s:Envelope
    xmlns:s="http://www.w3.org/2003/05/soap-envelope"
    xmlns:tt="http://www.onvif.org/ver10/schema"
    xmlns:tds="http://www.onvif.org/ver10/device/wsdl"
    xmlns:trt="http://www.onvif.org/ver10/media/wsdl">

    <s:Header>
        <Security s:mustUnderstand="1" xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
            <UsernameToken></UsernameToken>
        </Security>
    </s:Header>

    <s:Body>
        <trt:GetProfiles />
    </s:Body>
</s:Envelope>
```
### 2.2 命名空间（Namespace）详解
XML 中的 s:、tt:、tds: 只是命名空间的前缀（Prefix），其核心定义在于 xmlns 属性指向的 URL：
- xmlns:s: 定义了 SOAP 信封的标准。
  - SOAP 1.2: http://www.w3.org/2003/05/soap-envelope (较新设备使用)
  - SOAP 1.1: http://schemas.xmlsoap.org/soap/envelope/ (兼容性更好，推荐使用)
  - 查询来源: 该结构由 W3C 组织定义，所有 SOAP 客户端必须遵循此格式。
- xmlns:tt: ONVIF Schema，定义了公共数据类型（如分辨率、PTZ 速度、网络配置）。
  - 查询来源: http://www.onvif.org/onvif/ver10/schema/onvif.xsd
- xmlns:tds: Device Service，定义设备管理相关接口（获取信息、重启、修改IP）。
- xmlns:trt: Media Service，定义媒体相关接口（获取流、截图）。

### 2.3 WS-Security 鉴权机制
ONVIF 不使用 HTTP Basic Auth，而是使用 WS-Security UsernameToken。这是接入的最大难点。服务端会对以下参数进行校验：
- Created: 请求生成的 UTC 时间。服务器时间与设备时间误差通常不能超过 5 分钟，否则返回 HTTP 400 Wsse authorized time check failed。
- Nonce: 随机生成的二进制数据（防重放攻击）。
- PasswordDigest: 密码摘要，计算公式如下：$$\text{Base64}(\text{SHA-1}(\text{Nonce}_{\text{bytes}} + \text{Created}_{\text{bytes}} + \text{Password}_{\text{bytes}}))$$

## 3. 核心代码实现以下代码基于 JDK 8+ 和 Hutool 实现。
### 3.1 鉴权工具类 (OnvifUtils)
该类负责构建符合 SOAP 1.1/1.2 标准的 XML 信封，并生成正确的密码摘要
```Java
package com.hmifo.modules.camera.onvif;

import cn.hutool.core.codec.Base64;
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.XmlUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import lombok.extern.slf4j.Slf4j;
import org.w3c.dom.Document;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

@Slf4j
public class OnvifUtils {

    /**
     * 发送 SOAP 请求
     * @param url 服务地址 (如 http://192.168.1.100:80/onvif/device_service)
     * @param soapBody 业务 XML 片段
     */
    public static Document sendSoapRequest(String url, String username, String password, String soapBody) {
        String soapXml = buildSoapEnvelope(username, password, soapBody);
        try {
            HttpResponse response = HttpRequest.post(url)
                    .body(soapXml)
                    // Action 字段置空，兼容大部分 NVR
                    .header("Content-Type", "application/soap+xml; charset=utf-8; action=\"\"")
                    .timeout(5000)
                    .execute();

            if (!response.isOk()) {
                log.error("ONVIF请求失败: Code={} Body={}", response.getStatus(), response.body());
                throw new RuntimeException("ONVIF请求响应异常: " + response.getStatus());
            }
            return XmlUtil.readXML(response.body());
        } catch (Exception e) {
            throw new RuntimeException("ONVIF通信异常: " + e.getMessage(), e);
        }
    }

    /**
     * 构建 SOAP 信封 (含 WS-Security)
     * 关键点：强制使用 UTC 时间，修正 xmlns 地址以兼容 SOAP 1.1
     */
    private static String buildSoapEnvelope(String username, String password, String bodyContent) {
        // 1. 生成 UTC 时间戳 (关键：解决 authorized time check failed)
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        String created = sdf.format(new Date());

        // 2. 生成随机 Nonce
        String nonce = RandomUtil.randomString(16);
        String nonceBase64 = Base64.encode(nonce.getBytes(StandardCharsets.UTF_8));
        
        // 3. 计算摘要
        String passwordDigest = generatePasswordDigest(nonce, created, password);

        // 4. 拼接 XML (使用 SOAP 1.1 命名空间以获得最大兼容性)
        return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
                "<s:Envelope xmlns:s=\"http://www.w3.org/2003/05/soap-envelope\" " +
                "xmlns:tt=\"http://www.onvif.org/ver10/schema\" " +
                "xmlns:tds=\"http://www.onvif.org/ver10/device/wsdl\" " +
                "xmlns:trt=\"http://www.onvif.org/ver10/media/wsdl\">\n" +
                "  <s:Header>\n" +
                "    <Security s:mustUnderstand=\"1\" xmlns=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd\">\n" +
                "      <UsernameToken>\n" +
                "        <Username>" + username + "</Username>\n" +
                "        <Password Type=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest\">" + passwordDigest + "</Password>\n" +
                "        <Nonce EncodingType=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary\">" + nonceBase64 + "</Nonce>\n" +
                "        <Created xmlns=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd\">" + created + "</Created>\n" +
                "      </UsernameToken>\n" +
                "    </Security>\n" +
                "  </s:Header>\n" +
                "  <s:Body>\n" +
                "    " + bodyContent + "\n" +
                "  </s:Body>\n" +
                "</s:Envelope>";
    }

    private static String generatePasswordDigest(String nonce, String created, String password) {
        try {
            // 注意：必须使用原始字节进行拼接，不能先转 Base64 再拼接
            byte[] bNonce = nonce.getBytes(StandardCharsets.UTF_8);
            byte[] bCreated = created.getBytes(StandardCharsets.UTF_8);
            byte[] bPassword = password.getBytes(StandardCharsets.UTF_8);

            byte[] combined = new byte[bNonce.length + bCreated.length + bPassword.length];
            System.arraycopy(bNonce, 0, combined, 0, bNonce.length);
            System.arraycopy(bCreated, 0, combined, bNonce.length, bCreated.length);
            System.arraycopy(bPassword, 0, combined, bNonce.length + bCreated.length, bPassword.length);

            MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
            return Base64.encode(sha1.digest(combined));
        } catch (Exception e) {
            throw new RuntimeException("摘要生成失败", e);
        }
    }
}
```
### 3.2 业务管理器 (OnvifManager)
该类封装具体的业务逻辑：服务地址发现、Profile 解析、多通道处理。关键逻辑说明：
- 动态端口：不硬编码端口 80，支持传入 port 参数（大华 SDK 端口为 37777，HTTP 端口通常为 80）。
- 动态 Media 地址：先调用 GetCapabilities 获取媒体服务地址，因为部分 NVR 的媒体服务在不同端口或路径下。
- 通道区分：解析 VideoSourceConfiguration 中的 SourceToken，用于区分多目相机或 NVR 的不同通道。

```Java
package com.hmifo.modules.camera.onvif;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import java.util.*;

@Component
@Slf4j
public class OnvifManager {

    /**
     * 业务 1: 获取设备 Profiles (含分辨率、Token、通道号)
     */
    public List<OnvifProfile> getProfiles(String ip, int port, String user, String password) {
        // 1. 动态获取 Media 服务地址
        String mediaUrl = getMediaServiceUrl(ip, port, user, password);
        String body = "<trt:GetProfiles />";

        try {
            Document doc = OnvifUtils.sendSoapRequest(mediaUrl, user, password, body);
            List<OnvifProfile> list = new ArrayList<>();
            NodeList profiles = doc.getElementsByTagNameNS("*", "Profiles");

            for (int i = 0; i < profiles.getLength(); i++) {
                Element p = (Element) profiles.item(i);
                String token = p.getAttribute("token");
                String name = getTagValue(p, "Name");
                int width = 0, height = 0;
                String channel = "1";

                // 解析分辨率
                NodeList vEncConfigs = p.getElementsByTagNameNS("*", "VideoEncoderConfiguration");
                if (vEncConfigs.getLength() > 0) {
                    Element vec = (Element) vEncConfigs.item(0);
                    Element res = (Element) vec.getElementsByTagNameNS("*", "Resolution").item(0);
                    if (res != null) {
                        try {
                            width = Integer.parseInt(getTagValue(res, "Width"));
                            height = Integer.parseInt(getTagValue(res, "Height"));
                        } catch (NumberFormatException ignore) {}
                    }
                }

                // 解析通道号 (SourceToken)
                NodeList vSrcConfigs = p.getElementsByTagNameNS("*", "VideoSourceConfiguration");
                if (vSrcConfigs.getLength() > 0) {
                    Element vsc = (Element) vSrcConfigs.item(0);
                    // 典型值：VideoSource_0, VideoSourceToken001
                    String srcToken = getTagValue(vsc, "SourceToken");
                    channel = extractChannelNumber(srcToken);
                }

                list.add(new OnvifProfile(token, name, width, height, channel));
            }
            return list;
        } catch (Exception e) {
            log.error("获取Profile失败: {}:{}", ip, port, e);
            throw new RuntimeException("ONVIF获取配置失败");
        }
    }

    /**
     * 业务 2: 获取 RTSP 流地址
     */
    public String getStreamUri(String ip, int port, String user, String password, String profileToken) {
        String url = getMediaServiceUrl(ip, port, user, password);
        String body = "<trt:GetStreamUri>\n" +
                "  <trt:StreamSetup>\n" +
                "    <tt:Stream>RTP-Unicast</tt:Stream>\n" +
                "    <tt:Transport><tt:Protocol>RTSP</tt:Protocol></tt:Transport>\n" +
                "  </trt:StreamSetup>\n" +
                "  <trt:ProfileToken>" + profileToken + "</trt:ProfileToken>\n" +
                "</trt:GetStreamUri>";
        
        // 解析 <tt:Uri> 标签
        return extractUri(url, user, password, body);
    }

    /**
     * 内部方法：先询问 Device Service 获取 Media Service 的真实地址
     */
    private String getMediaServiceUrl(String ip, int port, String user, String password) {
        String deviceUrl = "http://" + ip + ":" + port + "/onvif/device_service";
        String body = "<tds:GetCapabilities xmlns:tds=\"http://www.onvif.org/ver10/device/wsdl\">" +
                "<tds:Category>Media</tds:Category>" +
                "</tds:GetCapabilities>";
        try {
            Document doc = OnvifUtils.sendSoapRequest(deviceUrl, user, password, body);
            NodeList mediaNodes = doc.getElementsByTagNameNS("*", "Media");
            if (mediaNodes.getLength() > 0) {
                Element media = (Element) mediaNodes.item(0);
                NodeList xAddrs = media.getElementsByTagNameNS("*", "XAddr");
                if (xAddrs.getLength() > 0) {
                    return xAddrs.item(0).getTextContent();
                }
            }
        } catch (Exception e) {
            log.warn("获取Capabilities失败，降级使用默认Media地址");
        }
        return deviceUrl;
    }

    // 提取纯数字通道号工具
    private String extractChannelNumber(String token) {
        if (token == null) return "1";
        String num = token.replaceAll("[^0-9]", "");
        return num.isEmpty() ? "1" : num;
    }
    
    // ... 其他 XML 解析辅助方法 ...
    
    @Data
    public static class OnvifProfile {
        private String token;
        private String name;
        private int width;
        private int height;
        private String channel;
        public OnvifProfile(String t, String n, int w, int h, String ch) {
            this.token = t; this.name = n; this.width = w; this.height = h; this.channel = ch;
        }
    }
}
```
## 4. 常见问题与平台差异
### 4.1 大华 (Dahua) 设备
- 端口问题：大华设备通常开放两个端口，80 (HTTP/ONVIF) 和 37777 (私有TCP)。必须使用 80 端口进行 ONVIF 连接，使用 37777 会导致 Read timed out。
- 通道编码：大华的 SourceToken 可能是 VideoSource_0 (对应通道1) 或 VideoSource_1。需要代码做归一化处理。
- H.265 问题：大华主码流默认 H.265。Web 端播放需转码或在相机后台改为 H.264。
### 4.2 海康 (Hikvision)
- 设备鉴权严格：海康对时间同步要求极高，且必须使用 Digest 认证。
- 用户权限：需在“系统-安全-系统服务”中显式开启 “启用 ONVIF” 并创建专门的 ONVIF 用户（独立于 Web 登录用户）。
