---
title: WSL使用
createTime: 2025/06/04 16:20:19
permalink: /article/ouhgxof3/
tags:
  - WSL
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250606090922.jpg
---

## 一、安装 WSL

微软官方文档地址：[WSL 安装指南](https://learn.microsoft.com/zh-cn/windows/wsl/install)

### 1. 确认是否开启虚拟化支持

在 BIOS 或系统信息中确认是否已启用虚拟化技术。

![image-20250604162406351](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250604162406351.png)

### 2. 启用 WSL 功能

打开“控制面板” → “程序” → “启用或关闭 Windows 功能”，勾选以下选项：

- 适用于 Linux 的 Windows 子系统
- 虚拟机平台（推荐）

然后重启电脑。



![image-20250604162529259](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250604162529259.png)



### 3. 安装 WSL

打开 PowerShell 或 CMD，输入以下命令：

```cmd
wsl --install
```

默认会安装 Ubuntu 发行版。安装完成后需要设置用户名和密码。

------

## 二、常用 WSL 命令

### 查看当前已安装的 WSL 系统

```bash
wsl --list -v
```

![image-20250604163420164](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250604163420164.png)

### 查看 WSL 支持的所有系统

```bash
wsl --list --online
```

![image-20250604163239154](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250604163239154.png)

### 安装指定系统（如 Ubuntu）

```cmd
wsl --install -d Ubuntu
```

### 设置默认运行的系统

```cmd
wsl --set-default CentOS7
```

### 注销某个系统（删除）

```cmd
wsl --unregister CentOS7
```

### 导出系统为 tar 包

```cmd
wsl --export CentOS7 D:\WSLFile\CentOS7\CentOS7.tar
```

### 导入系统

```cmd
wsl --import CentOS7 D:\WSLFile\CentOS7 D:\WSLFile\CentOS7\CentOS7.tar --version 2
```

### 在 PowerShell 中切换到指定系统

```cmd
wsl -d CentOS7
```

------

## 三、安装 CentOS 7（非官方支持）

由于 CentOS 7 已停止维护，官方不再提供直接安装方式。你可以通过第三方项目进行安装。

GitHub 地址：[CentOS 7 for WSL](https://github.com/mishamosher/CentOS-WSL/releases/tag/7.9-2211)

详细安装教程可参考：[CSDN 教程](https://blog.csdn.net/qq_72363261/article/details/145737342)

⚠️ **注意**：此方法存在系统损坏风险，例如重启后可能出现异常。建议在安装完成后立即执行导出备份，并通过重新导入使用。

### 替换为阿里云 YUM 源（加速下载）

```bash
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```

### 清理缓存并重建

```bash
yum clean all
yum makecache
```

### 安装 yum-utils 工具包

```bash
yum install -y yum-utils
```

