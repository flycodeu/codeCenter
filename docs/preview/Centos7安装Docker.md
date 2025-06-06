---
title: Centos7安装Docker
createTime: 2025/06/05 09:50:20
permalink: /article/5fqygf47/
tags:
  - Centos7
  - Docker
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250606090917.jpg
---



------
> 官网：：https://www.docker.com
## 一、安装前准备

### 1. 检查系统内核

Docker 要求系统为 64 位 Linux 内核版本 3.10 或以上：

```bash
uname -r
```

如果显示 `x86_64` 表示是 64 位系统，可以继续安装。

### 2. 更新 Yum 包索引

```bash
sudo yum update -y
```

------

## 二、安装 Docker 引擎

### 1. 安装依赖包

```bash
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```

### 2. 添加 Docker 官方仓库（推荐阿里云镜像加速）

```bash
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

### 3. 查看可用的 Docker 版本（可选）

```bash
yum list docker-ce --showduplicates | sort -r
```

### 4. 安装最新版 Docker CE

```bash
sudo yum install -y docker-ce docker-ce-cli containerd.io
```

如需指定版本安装：

```bash
sudo yum install -y docker-ce-<VERSION_STRING>
```

------

## 三、启动 Docker 引擎

### 1. 启动 Docker（仅限物理机 / 虚拟机）

如果使用的是 **物理机或虚拟机**，可以使用 `systemctl`：

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 在 WSL 中启动 Docker（不支持 systemd）

由于 **CentOS 7 WSL 不支持 `systemd`**，不能使用 `systemctl`。需要手动启动 Docker 引擎：

```bash
sudo dockerd > /tmp/docker.log 2>&1 &
```

#### 停止 Docker 进程（WSL 环境）

由于没有 `systemd`，只能通过以下方式终止：

##### 方法一：查找并 kill 进程

```bash
ps aux | grep dockerd
sudo kill <PID>
```

##### 方法二：一次性杀死所有 dockerd 进程

```bash
sudo pkill dockerd
```

##### 方法三：结束后台任务（适用于使用 `&` 启动的情况）

```bash
jobs
fg %1
Ctrl + C
```

------

## 四、安装 Docker Compose

### 方法一：从官方下载（推荐）

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.1/docker-compose-$(uname -s)-$(uname -m)" \
-o /usr/local/bin/docker-compose
```

### 方法二：使用国内镜像源（Gitee）

```bash
sudo curl -L "https://gitee.com/fustack/docker-compose/releases/download/v2.24.1/docker-compose-linux-x86_64" \
-o /usr/local/bin/docker-compose
```

### 设置执行权限并验证版本

```bash
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

------

## 五、Docker 常用命令速查表

| 功能             | 命令                                                         |
| ---------------- | ------------------------------------------------------------ |
| 查看 Docker 版本 | `docker --version`                                           |
| 查看运行中的容器 | `docker ps`                                                  |
| 查看所有容器     | `docker ps -a`                                               |
| 查看本地镜像     | `docker images`                                              |
| 拉取镜像         | `docker pull <image>`                                        |
| 运行容器         | `docker run --name <name> -p <host-port>:<container-port> -d <image>` |
| 删除容器         | `docker rm <container-id>`                                   |
| 删除镜像         | `docker rmi <image>`                                         |
| 查看帮助文档     | `docker --help`                                              |

------

## 六、卸载 Docker（可选）

```bash
sudo yum remove docker \
docker-client \
docker-client-latest \
docker-common \
docker-latest \
docker-latest-logrotate \
docker-logrotate \
docker-selinux \
docker-engine-selinux \
docker-engine
```

------

## 七、设置镜像源
[国内Docker镜像加速](https://status.1panel.top/status/docker)

[阿里云镜像源](https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors)

``bash
vim /etc/docker/daemon.json
``

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["xxx"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```
在wsl只需要输入到daemon这个文件
```bash
{
  "registry-mirrors": ["xxx"]
}
```
然后运行以下命令，读取配置文件
```bash
sudo dockerd --config-file=/etc/docker/daemon.json > /tmp/docker.log 2>&1 &
```