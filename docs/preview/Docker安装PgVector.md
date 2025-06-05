---
title: Docker安装PgVector
createTime: 2025/06/05 16:50:51
permalink: /article/pfatn7xa/
tags:
  - Docker
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250605165958.jpg
---

### 编写脚本

```bash
vim docker-compose-pgvector.yml
```

```yml
version: '3'
services:
  vector_db:
    image: registry.cn-hangzhou.aliyuncs.com/xfg-studio/pgvector:v0.5.0
    container_name: vector_db
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=springai
      - PGPASSWORD=postgres
    volumes:
      - ./pgvector/sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    logging:
      options:
        max-size: 10m
        max-file: "3"
    ports:
      - '5432:5432'
    healthcheck:
      test: "pg_isready -U postgres -d vector_store"
      interval: 2s
      timeout: 20s
      retries: 10
    networks:
      - my-network
networks:
  my-network:
    driver: bridge
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