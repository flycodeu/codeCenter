---
title: Zookeeper安装使用
createTime: 2025/03/04 09:28:52
permalink: /article/xf618rgv/
tags:
  - Zookeeper
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

## 一. 原生安装
### 1. 环境准备
必须要有java8以上版本

### 2. 下载Zookeeper
https://www.apache.org/dyn/closer.lua/zookeeper/zookeeper-3.5.10/apache-zookeeper-3.5.10.tar.gz

### 3. 上传Zookeeper到虚拟机

### 4. 解压缩
当前文件下创建一个目录
```shell
 mkdir zookeeper
```
移动到zookeeper包里面
```shell
mv apache-zookeeper-3.5.10.tar.gz /usr/local/src/zookeeper/
```
解压缩
```shell
  cd zookeeper
 tar -zxvf apache-zookeeper-3.5.10.tar.gz 
```

### 5. 配置
进入
```shell
 cd apache-zookeeper-3.5.10/
 cd conf/
```
原本的zoo_sample.cfg无法使用，需要创建一个zoo.cfg
```shell
# The number of milliseconds of each tick
tickTime=2000
# The number of ticks that the initial 
# synchronization phase can take
initLimit=10
# The number of ticks that can pass between 
# sending a request and getting an acknowledgement
syncLimit=5
# the directory where the snapshot is stored.
# do not use /tmp for storage, /tmp here is just 
# example sakes.
dataDir=/tmp/zookeeper
# the port at which the clients will connect
clientPort=2181
# the maximum number of client connections.
# increase this if you need to handle more clients
#maxClientCnxns=60
#
# Be sure to read the maintenance section of the 
# administrator guide before turning on autopurge.
#
# http://zookeeper.apache.org/doc/current/zookeeperAdmin.html#sc_maintenance
#
# The number of snapshots to retain in dataDir
#autopurge.snapRetainCount=3
# Purge task interval in hours
# Set to "0" to disable auto purge feature
#autopurge.purgeInterval=1
```

需要改变dataDir
在当前目录创建zkdata目录，存放数据
```shell
mkdir zkdata
```
dataDir改为/usr/local/src/zookeeper/apache-zookeeper-3.5.10/conf/zkdata
重新上传zoo.cfg

### 6. 启动zookeeper
进入zookeeper的bin
```shell
 ./zkServer.sh start
```
启动成功
```shell
[root@192 bin]# ./zkServer.sh start
/usr/bin/java
ZooKeeper JMX enabled by default
Using config: /usr/local/src/zookeeper/apache-zookeeper-3.5.10/bin/../conf/zoo.cfg
Starting zookeeper ... STARTED
```
查看状态
```shell
./zkServer.sh status
```
关闭
```shell
./zkServer.sh stop
```

## 2. Docker安装
### 1. 环境配置
java8以上，docker

### 2. 安装
查看zookeeper版本
```shell
docker search zookeeper
```
下载最新版本，可以指定版本
```shell
docker pull zookeeper:latest
```
创建挂载数据
```shell
mkdir -p /root/docker/zookeeper/data
```

### 3. 启动容器
查看zookeeper镜像
```shell
docker images
```
```shell
docker run -d -p 2181:2181 -v /root/docker/zookeeper/data:/data/ --name zookeeper --privileged 36c607e7b14d
```
参数说明
```shell
-d # 表示在一直在后台运行容器
-p 2181:2181 # 对端口进行映射，将本地2181端口映射到容器内部的2181端口
--name # 设置创建的容器名称
-v # 将本地目录挂载到容器指定目录；
--privileged  # 镜像id或者镜像名称也可以 
```
### 4. 查看启动
```shell
docker ps
```
### 5. 进入容器
```shell
docker exec -it 069a2219323c /bin/bash
```
中间id是容器id

进入bin
```shell
cd bin

```

启动
```shell
./zkCli.sh
```

