---
title: 飞云API
createTime: 2025/03/04 09:47:40
permalink: /article/slt9y2jg/
tags:
  - 项目
---
## 1. 项目介绍

飞云API 开发者文档是飞云API接口开放平台 的一个接口调用工具包，通过flyapi-client-sdk即可将轻松、稳定、安全的集成接口到您的项目中，实现更高效的开发和调用。
帮助您实现更快速、便捷的开发和调用体验。

官网地址: [飞云API](http://39.104.23.173/)

支付包沙盒账号密码

账号：pfelyy3523@sandbox.com

密码：111111

## 2. 搭建环境

目前仅支持JAVA SDK(java 8)

## 3. 安装

引入依赖

```xml

<dependency>
    <groupId>io.github.flybase1</groupId>
    <artifactId>flyapi-client-sdk</artifactId>
    <version>1.0.0.Release</version>
</dependency>
```

## 4. 配置客户端

方法1: 主动创建客户端实例

```java
String accessKey = "你的 accessKey";
String secretKey = "你的 secretKey";
FlyApiClient flyApiClient = new FlyApiClient(accessKey, secretKey);
```

方法2：通过配置文件注入对象

```yml
flyapi:
  client:
    access-key: xxx
    secret-key: xxx
```

```java
@Resource
private FlyApiClient flyApiClient;
```

## 返回响应码

## API接口示例

网易云随机音乐
![fyapizs-0](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401141555941.png)

```java
String music = flyApiClient.wangyiyunRandomMusic();
```

## 目前不足

返回的数据是以Json形式存储的String类型的数据，如果想要拿到里面的数据，仍需要进一步进行解析

# 项目地址

后端地址： [https://github.com/flycodeu/fly-newApi-backend](https://github.com/flycodeu/fly-newApi-backend)

前端地址：[https://github.com/flycodeu/fly-newApi-fontend](https://github.com/flycodeu/fly-newApi-fontend)

