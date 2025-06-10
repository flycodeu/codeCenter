---
title: Docker安装Redis
createTime: 2025/06/05 16:22:17
permalink: /article/c6zr8n36/
tags:
  - Docker
  - Redis
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250605165953.jpg
---

## 安装Redis

### 创建compose脚本

```bash
vim docker-compose-redis6.yml
```

```yml
version: '3'
services:
  redis:
    image: registry.cn-hangzhou.aliyuncs.com/xfg-studio/redis:6.2
    container_name: redis
    restart: always
    hostname: redis
    privileged: true
    ports:
      - 16379:6379
    volumes:
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - my-network
    healthcheck:
      test: [ "CMD", "redis-cli", "ping" ]
      interval: 10s
      timeout: 5s
      retries: 3
networks:
  my-network:
    driver: bridge                                                                 
```

### 运行compose脚本
```bash
 docker-compose -f docker-compose-redis6.yml up -d
```

### 启动Redis
```bash
docker start redis
```

### 查看运行状态

可以使用Portainer

![image-20250605163256509](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250605163256509.png)

也可以在`docker ps -ef`查看运行状态

### 进入Redis容器

```bash
docker exec -it redis /bin/bash
```

## 安装Redis-Admin

### 创建compose脚本

```bash
vim docker-compose-redis-admin.yml
```

```bash
version: '3'
services:
  redis-admin:
    image: registry.cn-hangzhou.aliyuncs.com/xfg-studio/redis-commander:0.8.0
    container_name: redis-admin
    hostname: redis-commander
    restart: always
    ports:
      - "8081:8081"
    environment:
      - REDIS_HOSTS=local:host.docker.internal:6379
      - HTTP_USER=admin
      - HTTP_PASSWORD=admin
      - LANG=C.UTF-8
      - LANGUAGE=C.UTF-8
      - LC_ALL=C.UTF-8
    networks:
      - my-network

networks:
  my-network:
    driver: bridge 
```

### 运行脚本

```bash
 docker-compose -f docker-compose-redis-admin.yml up -d
```

### 启动Redis-Admin

```bash
docker start  redis-admin
```

## 两者合并

我们可以将两个配置进行合并，减少代码量

```bash
version: '3'
services:
  ollama:
    image: registry.cn-hangzhou.aliyuncs.com/xfg-studio/ollama:0.5.10
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
  redis:
    image: registry.cn-hangzhou.aliyuncs.com/xfg-studio/redis:6.2
    container_name: redis
    restart: always
    hostname: redis
    privileged: true
    ports:
      - 16379:6379
    volumes:
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - my-network
    healthcheck:
      test: [ "CMD", "redis-cli", "ping" ]
      interval: 10s
      timeout: 5s
      retries: 3
  # RedisAdmin https://github.com/joeferner/redis-commander
  # 账密 admin/admin
  redis-admin:
    image: registry.cn-hangzhou.aliyuncs.com/xfg-studio/redis-commander:0.8.0
    container_name: redis-admin
    hostname: redis-commander
    restart: always
    ports:
      - 8081:8081
    environment:
      - REDIS_HOSTS=local:redis:6379
      - HTTP_USER=admin
      - HTTP_PASSWORD=admin
      - LANG=C.UTF-8
      - LANGUAGE=C.UTF-8
      - LC_ALL=C.UTF-8
    networks:
      - my-network
    depends_on:
      redis:
        condition: service_healthy

networks:
  my-network:
    driver: bridge
```

## 连接WSL中的Redis
详情参考[Docker 安装PgVector](Docker安装PgVector.md)