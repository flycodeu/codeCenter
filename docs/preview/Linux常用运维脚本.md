---
title: Linux常用运维脚本
createTime: 2025/03/04 09:28:52
permalink: /article/rd6vk0lr/
---

> 本文作者：运维网工
>
> 转自地址：[https://mp.weixin.qq.com/s/_mqjaxvWibfXzpNbqHM0XQ](https://mp.weixin.qq.com/s/_mqjaxvWibfXzpNbqHM0XQ)



## 一键安装Apache服务器

自动化安装并启动Apache服务器。

```bash
#!/bin/bash
sudo apt-get update
sudo apt-get install -y apache2
sudo systemctl start apache2
sudo systemctl enable apache2
echo "Apache服务器已安装并启动"
```

## 一键安装MySQL数据库

自动化安装MySQL数据库，并提示进行安全配置。

```bash
#!/bin/bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo mysql_secure_installation
sudo systemctl start mysql
sudo systemctl enable mysql
echo "MySQL数据库已安装并启动"
```

## 一键备份MySQL数据库

备份指定的MySQL数据库到指定目录。

```bash
#!/bin/bash
USER="your_mysql_user"
PASSWORD="your_mysql_password"
DB_NAME="your_database_name"
BACKUP_DIR="/path/to/backup"
DATE=$(date +"%Y-%m-%d")
mysqldump -u $USER -p$PASSWORD $DB_NAME > $BACKUP_DIR/$DB_NAME-$DATE.sql
echo "数据库已备份到 $BACKUP_DIR"
```

## 一键安装Nginx

自动化安装并启动Nginx服务器。

```bash
#!/bin/bash
sudo apt-get update
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
echo "Nginx服务器已安装并启动"
```

## 一键配置防火墙

配置防火墙以允许Nginx和SSH服务

```bash
#!/bin/bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 'OpenSSH'
sudo ufw enable
sudo ufw status
echo "防火墙已配置并启用"
```

## 一键更新系统

更新系统软件包，并重启系统以应用更改。

```BASH
#!/bin/bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get dist-upgrade -y
sudo reboot
echo "系统已更新并重启"
```

## 一键安装Docker

自动化安装Docker，并将当前用户添加到docker组。

```BASH
#!/bin/bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
echo "Docker已安装并启动，用户已添加到docker组"
```

## 一键清理系统日志

```bash
#!/bin/bash
sudo find /var/log/ -type f -name "*.log" -exec truncate -s 0 {} \;
echo "系统日志已清理"
```

## 一键安装PHP

```bash
#!/bin/bash
sudo apt-get update
sudo apt-get install -y php libapache2-mod-php php-mysql
sudo systemctl restart apache2
echo "PHP已安装并配置为Apache模块"
```

##  **一键监控CPU和内存使用率**

```bash
#!/bin/bash
watch -n 1 'free -m && top -bn1 | grep "Cpu(s)"'
```

## 一键查找大文件

查找系统中大于100MB的文件。

```bash
#!/bin/bash
sudo find / -type f -size +100M -exec ls -lh {} \; | awk '{ print $9 ": " $5 }'
```

## 一键安装Git

自动化安装指定版本的Node.js。

```bash
#!/bin/bash
sudo apt-get update
### 13. **一键安装Node.js**
```bash
#!/bin/bash
VERSION="node_14.x" # 可以根据需要更改版本
DISTRO=$(lsb_release -s -c)
echo "deb https://deb.nodesource.com/$VERSION $DISTRO main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt-get update
sudo apt-get install -y nodejs
echo "Node.js已安装"
```

## 一键安装Redis

自动化安装并启动Redis服务器

```bash
#!/bin/bash
sudo apt-get update
sudo apt-get install -y redis-server
sudo systemctl start redis
sudo systemctl enable redis
echo "Redis已安装并启动"
```

## 一键安装MongoDB

自动化安装并启动MongoDB数据库

```bash
#!/bin/bash
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -sc)/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
echo "MongoDB已安装并启动"
```

## 一键配置SSH无密码登录

将本地SSH密钥复制到远程主机，实现无密码登录

```bash
#!/bin/bash
read -p "请输入要配置的SSH密钥文件路径: " KEY_PATH
ssh-copy-id -i $KEY_PATH user@remote_host # 替换user和remote_host为实际值
echo "SSH无密码登录已配置"
```

## 一键安装Python虚拟环境

```bash
#!/bin/bash
PYTHON_VERSION="3.8" # 可以根据需要更改版本
sudo apt-get update
sudo apt-get install -y python3-$PYTHON_VERSION python3-venv
echo "Python虚拟环境工具已安装"
```

## 一键压缩目录

压缩指定目录为tar.gz格式文件

```bash
#!/bin/bash
read -p "请输入要压缩的目录路径: " DIR_PATH
read -p "请输入压缩文件的名称: " ARCHIVE_NAME
tar -czvf $ARCHIVE_NAME.tar.gz -C $(dirname $DIR_PATH) $(basename $DIR_PATH)
echo "目录已压缩为 $ARCHIVE_NAME.tar.gz"
```

##  **一键安装Java**

安装OpenJDK 11

```bash
#!/bin/bash
sudo apt-get update
sudo apt-get install -y openjdk-11-jdk
echo "Java已安装"
```

## 一键检查磁盘空间

检查并显示系统中各磁盘分区的使用情况，排除临时文件系统、光盘等

```bash
#!/bin/bash
df -h | grep -Ev '^Filesystem|tmpfs|cdrom'
```

