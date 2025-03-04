---
title: Centos7安装Mysql8
createTime: 2025/03/04 09:28:52
permalink: /article/5loibxw5/
tags:
  - Centos7
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

## Centos7安装Mysql8解压方式
[Centos7安装Mysql8解压方式](https://blog.51cto.com/YangPC/12789472)

### 开放3306端口
如果想要在外网方法，需要开放3306端口
#### 检查Firewalld服务状态
确认firewalld服务是否正在运行
```Bash
sudo systemctl status firewalld
```
如果firewalld没有运行，可以启动它并设置为开机自启：
```bash
sudo systemctl start firewalld
sudo systemctl enable firewalld
```

#### 添加3306端口到防火墙规则
使用firewall-cmd命令来添加3306端口到当前活动的区域（通常为public）。
临时添加（不需要重启firewalld，但会在重启后失效）：
```Bash
sudo firewall-cmd --zone=public --add-port=3306/tcp
```
永久添加（需要重启firewalld才能生效，但在重启后仍然有效）：
```Bash
sudo firewall-cmd --zone=public --add-port=3306/tcp --permanent
```
#### 重新加载防火墙规则（使永久规则立即生效，无需重启firewalld）：
```Bash
sudo firewall-cmd --reload
```
#### 验证端口已打开
```Bash
sudo firewall-cmd --zone=public --list-ports
```
#### 配置MySQL/MariaDB监听所有IP地址
默认情况下，MySQL/MariaDB可能会配置为仅监听本地连接（即127.0.0.1）。如果希望能够接受来自网络中其他计算机的连接，需要修改MySQL/MariaDB的配置文件以让它监听所有IP地址。

编辑/etc/my.cnf或/etc/mysql/my.cnf文件，找到[mysqld]部分，并确保有以下行：

```Ini
[mysqld]
bind-address = 0.0.0.0
```
保存更改后，重启MySQL/MariaDB服务以应用新的配置：

```Bash
sudo systemctl restart mysqld
```
或者如果是MariaDB：
```Bash
sudo systemctl restart mariadb
```