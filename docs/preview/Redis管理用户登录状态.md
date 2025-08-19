---
title: Redis管理用户登录状态
createTime: 2025/08/19 09:26:27
permalink: /article/zs1pl0m4/
tags:
  - Redis
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/496a940d9a8095dd63d22e97dd8a2a34.jpg
---
<ImageCard
image="https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/496a940d9a8095dd63d22e97dd8a2a34.jpg"
href="/"
width=400
center=true
/>

## 1. 引入依赖
```xml
<!-- Spring Session + Redis -->
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

## 2. 配置redis
```yml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      database: 0
      ttl: 3600
  # session 配置
  session:
    store-type: redis
    # session 30 天过期
    timeout: 2592000
server:
  port: 8123
  servlet:
    context-path: /api
    # cookie 30 天过期
    session:
      cookie:
        max-age: 2592000

```

## 存储到Redis
使用Redis存储session数据，session数据存储在Redis中，sessionId作为key，session数据作为value。
```
spring:session:sessions:2ebeebfb-5377-48cf-b0db-f1a2e33051ea
```