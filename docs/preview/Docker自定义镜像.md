---
title: 自定义Docker镜像
createTime: 2025/07/08 09:18:24
permalink: /article/nixsinl0/
tags:
  - Docker
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/bg06.jpg
---
## 1. 创建阿里云镜像仓库

![image-20250708092316129](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250708092316129.png)

![image-20250708092428726](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250708092428726.png)

![image-20250708092722947](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250708092722947.png)

## 2. 编写推送脚本push.sh

```sh
#!/bin/bash


# Ensure the script exits if any command fails
set -e

# Define variables for the registry and image
ALIYUN_REGISTRY="crpi-aon3rlrrtizhy79e.cn-hangzhou.personal.cr.aliyuncs.com/flycode/flycode"
NAMESPACE="flycode"
IMAGE_NAME="mcp-server-csdn"
IMAGE_TAG="1.0"

# 读取本地配置文件
if [ -f ".local-config" ]; then
  source .local-config
else
  echo ".local-config 文件不存在，请创建并填写 ALIYUN_USERNAME 和 ALIYUN_PASSWORD"
  exit 1
fi

# Login to Aliyun Docker Registry
echo "Logging into Aliyun Docker Registry..."
docker login --username="${ALIYUN_USERNAME}" --password="${ALIYUN_PASSWORD}" $ALIYUN_REGISTRY

# Tag the Docker image
echo "Tagging the Docker image..."
docker tag ${NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} ${ALIYUN_REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}

# Push the Docker image to Aliyun
echo "Pushing the Docker image to Aliyun..."
docker push ${ALIYUN_REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}

echo "Docker image pushed successfully! "

echo "检出地址：docker pull ${ALIYUN_REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}"
echo "标签设置：docker tag ${ALIYUN_REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} ${NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}"

# Logout from Aliyun Docker Registry
echo "Logging out from Aliyun Docker Registry..."
docker logout $ALIYUN_REGISTRY
```

其中登录的账号密码写在当前同级目录.local-config中

```
ALIYUN_USERNAME=xxxx
ALIYUN_PASSWORD=xxxxx
```

## 3. 编写Dockerfile

```bash
# 基础镜像，可以先执行 docker pull openjdk:17-jdk-slim
FROM openjdk:17-jdk-slim

# 作者
MAINTAINER flycode

# 配置
ENV PARAMS=""

# 时区
ENV TZ=PRC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 添加应用
ADD target/mcp-server-csdn-app.jar /mcp-server-csdn-app.jar

ENTRYPOINT ["sh","-c","java -jar $JAVA_OPTS /mcp-server-csdn-app.jar $PARAMS"]
```

## 4. 编写构建运行脚本build.sh

```bash
# 普通镜像构建，随系统版本构建 amd/arm ./build.sh
docker build -t flycode/mcp-server-csdn-app:1.0 -f ./Dockerfile .
```

## 5. Linux环境运行build脚本

需要安装Docker环境

![image-20250708095928784](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250708095928784.png)

## 6. 运行push脚本

![image-20250708100510199](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250708100510199.png)

返回了对应的地址

检出地址：docker pull crpi-aon3rlrrtizhy79e.cn-hangzhou.personal.cr.aliyuncs.com/flycode/ai-mcp-server-csdn:1.0
标签设置：docker tag crpi-aon3rlrrtizhy79e.cn-hangzhou.personal.cr.aliyuncs.com/flycode/ai-mcp-server-csdn:1.0 flycode/ai-mcp-server-csdn:1.0

## 7. 查看镜像

可以看到阿里云镜像多了我们自定义的ai-mcp-server-csdn，推送完成

![image-20250708100625210](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250708100625210.png)

## 8. 编写docker-compose脚本
按照自己的需求编写启动项目脚本
```yml
version: '3.8'
services:
  ai-mcp-knowledge-app:
    image: crpi-aon3rlrrtizhy79e.cn-hangzhou.personal.cr.aliyuncs.com/flycode/ai-mcp-knowledge-app:1.0
    container_name: ai-mcp-knowledge-app
    restart: always
    ports:
      - "8090:8090"
    volumes:
      - ./log:/data/log
      - ./mcp/config:/mnt/d/myprojects/Konwledge/ai-mcp-knowledge/ai-mcp-knowledge/ai-mcp-knowledge-app/docs/tags/mcp/config
      - ./mcp/jar:/mnt/d/myprojects/Konwledge/ai-mcp-knowledge/ai-mcp-knowledge/ai-mcp-knowledge-app/docs/tags/mcp/jar
    environment:
      - TZ=PRC
      - SERVER_PORT=8090
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=postgres
      - SPRING_DATASOURCE_URL=jdbc:postgresql://172.26.37.0:5432/ai-rag-knowledge
      - SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
      - SPRING_AI_OLLAMA_BASE_URL=http://172.26.37.0:11434
      - SPRING_AI_OLLAMA_EMBEDDING_OPTIONS_NUM_BATCH=512
      - SPRING_AI_OLLAMA_MODEL=nomic-embed-text
      - SPRING_AI_ZHIPUAI_BASE_URL=https://open.bigmodel.cn/api/paas/
      - SPRING_AI_ZHIPUAI_API_KEY=a9445ac34f0841a899b13699b19c7fb3.NCGDN8fQmcWmMoTd
      - SPRING_AI_OPENAI_EMBEDDING_MODEL=text-embedding-ada-002
      - SPRING_AI_RAG_EMBED=nomic-embed-text
      - SPRING_AI_MCP_CLIENT_STDIO_SERVERS_CONFIGURATION=file:/mnt/d/myprojects/Konwledge/ai-mcp-knowledge/ai-mcp-knowledge/ai-mcp-knowledge-app/docs/tags/mcp/config/mcp-servers-config.json
      - REDIS_SDK_CONFIG_HOST=redis
      - REDIS_SDK_CONFIG_PORT=6379
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - my-network

networks:
  my-network:
    driver: bridge
```

运行脚本
```bash
docker-compose -f docker-compose-app up -d
```

![image-20250708141712794](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250708141712794.png)