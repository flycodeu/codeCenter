---
title: Docker安装PgVector
createTime: 2025/06/05 16:50:51
permalink: /article/pfatn7xa/
tags:
  - Docker
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250605165958.jpg
---

## 安装步骤

### 编写脚本

```bash
vim docker-compose-pgvector.yml
```

```yml
version: '3'
services:
  vector_db:
    image: registry.cn-hangzhou.aliyuncs.com/xfg-studio/pgvector:v0.5.0
    container_name: pgvector
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=springai
      - PGPASSWORD=postgres
    volumes:
      - ./pgdata:/var/lib/postgresql/data
      - ./pgvector/sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    logging:
      options:
        max-size: 10m
        max-file: "3"
    ports:
      - '5432:5432'
    healthcheck:
      test: "pg_isready -U postgres -d springai"
      interval: 2s
      timeout: 20s
      retries: 10
    networks:
      - my-network
networks:
  my-network:
    driver: bridge                                                                                                                                                                                 ~                       
```
### 运行脚本
```bash
docker-compose -f docker-compose-pgvector.yml up -d
```

### 启动PgVector

```bash
docker start vector_db
```

### 查看运行状态

![image-20250605165523607](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250605165523607.png)

## 连接WSL的PgVector

### 开放远程登录

保存的数据在当前compose文件的同级 pgdata里面，我们需要进入修改如下两个配置。

![image-20250610084336393](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250610084336393.png)

1. 配置PostgreSQL服务监听地址。默认只允许本地连接

```shell
vim postgresql.conf
# 添加下面配置行
listen_addresses = '*'
```

2. 配置登录方式。默认只允许本地登录

```bash
vim pg_hba.conf
# 添加下面配置行
host    all             all             0.0.0.0/0               scram-sha-256
```

### 查看当前服务器IP

```bash
hostname -I
```

会有多个，第一个是当前wsl的ip，一般使用这个



### 添加Windows入站规则

新建如下规则

![image-20250610093051870](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250610093051870.png)

### 软件连接

建议使用IDEA的数据库连接，Navicate的连接成功，但是访问数据库报错。

![image-20250610091712413](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250610091712413.png)

