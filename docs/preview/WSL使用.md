---
title: WSL使用
createTime: 2025/06/04 16:20:19
permalink: /article/ouhgxof3/
tags:
  - WSL
---

## 安装WSL

[WSL](https://learn.microsoft.com/zh-cn/windows/wsl/install)

1. 首先需要确认电脑是否开启虚拟化

![image-20250604162406351](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250604162406351.png)

2. 打开启动或关闭Windows功能，勾选如下配置，重启

![image-20250604162529259](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250604162529259.png)

3. 打开cmd或者powershell

```cmd
wsl --install
```

默认会安装ubuntu，安装完成后会有输入用户名、密码

## WSL部分命令

### 查看当前wsl安装的系统

```cmd
wsl --list -v
```

![image-20250604163420164](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250604163420164.png)

### 查看wsl支持的所有系统

```cmd
wsl --list --online
```

![image-20250604163239154](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250604163239154.png)

### 安装包含在wsl的系统

```cmd
wsl --install -d Ubuntu
```

### 设置默认系统

```cmd
 wsl --set-default CentOS7
```

### PowerShell切换系统

![image-20250604163614183](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250604163614183.png)

### WSL使用系统

```cmd
wsl -d CentOS7
```

### 安装Centos7

目前Centos7已经不进行维护，我们只能到如下地址，下载Centos7的exe运行[Centos7](https://github.com/mishamosher/CentOS-WSL/releases/tag/7.9-2211)

[详细安装教程](https://blog.csdn.net/qq_72363261/article/details/145737342)

1. 下载阿里云j

```bash
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```

2. 清理缓存和重建

```bash
yum clean all
yum makecache
```

3. 安装yum

```bash
yum install -y yum-utils
```

