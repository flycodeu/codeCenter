---
title: logrotate日志使用
createTime: 2025/03/20 08:39:22
permalink: /article/bu68tt47/
tags:
  - Linux
---

## Logrotate简介

logrotate是Linux系统中的日志管理工具，可以通过预设规则自动对日志进行执行，避免单个日志文件过大导致磁盘空间不足或影响读写性能。
- 压缩日志：减少历史日志占用
- 切割日志：按时间、大小切割日志
- 清理日志：保留固定数量日志

一般默认集成，如果没有，可以按照如下命令安装：
```bash
# 对于Debian、Ubuntu、Raspbian等使用apt的系统
sudo apt-get install logrotate  
# 对于CentOS 7、Fedora等使用yum的系统
sudo yum install logrotate  
# 对于CentOS 8、Fedora等使用dnf的系统
sudo dnf install logrotate  
# 对于Arch Linux、Manjaro等使用pacman的系统
sudo pacman -S logrotate  
# 对于Alpine Linux使用apk的系统
sudo apk add logrotate  
```
##  配置文件位置
定义全局配置：/etc/logrotate.conf
存放自己服务的日志配置文件：/etc/logrotate.d/

## 核心配置
```bash
/var/log/*.log {
    daily               # 按天切割
    missingok           # 日志不存在时不报错
    rotate 60           # 保留60份旧日志
    compress            # 启用压缩（默认gzip）
    delaycompress       # 延迟压缩最新一份日志
    notifempty          # 空日志不轮换
    sharedscripts       # 所有日志处理完再执行脚本
    postrotate         # 切割后执行的命令  
      xxx
    endscript
    dateext             # 使用日期作为后缀格式
    dateformat -%Y%m%d  # 自定义日期格式（示例：.log-20231001）
}
```

- 切割周期：daily、weekly、monthly 或 size（如 size 100M）
- 保留数量：rotate X 指定保留旧日志的数量。
- 压缩控制：compress 立即压缩；delaycompress 延迟压缩上一个轮换文件。
- 脚本钩子：prerotate/postrotate 在切割前后执行命令（如重启服务）

## 日志使用
```bash
/etc/logrotate.d
```
可以在当前文件夹里面新建日志配置
```
vim xxx(文件名)
```
需要绑定日志地址
```bash
/ntdc/api/mylog.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

```bash
 sudo logrotate -vf /etc/logrotate.d/xxx(文件名)
```

启动成功后，配置如下

![image-20250320090824295](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250320090824295.png)



## 参考文档

[CentOS 7 日志切割实战](https://blog.csdn.net/weixin_42434700/article/details/145878377)