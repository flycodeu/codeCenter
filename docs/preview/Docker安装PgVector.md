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


## 安装扩展
### 1. 创建数据库
```bash
docker exec -it pgvector psql -U postgres -d ai-rag-knowledge
```
确保数据库 ai-rag-knowledge 已存在。如果没有，可以手动创建：
```bash
docker exec -it pgvector psql -U postgres -c "CREATE DATABASE \"ai-rag-knowledge\";"
```
### 2. 安装 pgvector 插件（在该数据库里）
连接成功后，执行：
```bash
CREATE EXTENSION IF NOT EXISTS vector;
```
成功会输出：

```bash
CREATE EXTENSION
```
### 3. 创建 vector_store 表（带有 vector 类型字段）
执行下面的 SQL（建议手动先创建）：
```bash
CREATE TABLE IF NOT EXISTS vector_store (
id TEXT PRIMARY KEY,
content TEXT,
metadata JSONB,
embedding VECTOR(1536)  -- 1536 是 OpenAI 向量维度，你可以根据实际情况修改
);
```

如果你之前建表失败，需要重建
可以先删除旧表再重建（注意数据清空）：
```bash
DROP TABLE IF EXISTS vector_store;
```
然后再执行上面的 CREATE TABLE 语句。

### 4.验证是否成功
执行：
```bash
\d+ vector_store
```
你应当看到类似输出：
```
ai-rag-knowledge=# \d+ vector_store
                                           Table "public.vector_store"
  Column   |     Type     | Collation | Nullable | Default | Storage  | Compression | Stats target | Description
-----------+--------------+-----------+----------+---------+----------+-------------+--------------+-------------
 id        | text         |           | not null |         | extended |             |              |
 content   | text         |           |          |         | extended |             |              |
 metadata  | jsonb        |           |          |         | extended |             |              |
 embedding | vector(1536) |           |          |         | extended |             |              |
Indexes:
    "vector_store_pkey" PRIMARY KEY, btree (id)
Access method: heap
```
