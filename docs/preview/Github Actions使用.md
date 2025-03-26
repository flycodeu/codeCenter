---
title: Github Actions使用
createTime: 2025/03/24 14:59:06
permalink: /article/2y9cldmw/
tags:
    - Actions
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/990667183ad3256336a04340846abae.jpg
---

[Actions指南](https://docs.github.com/zh/actions/guides)

## 简介

GitHub Actions 是一种持续集成和持续交付 (CI/CD) 平台，可用于自动执行生成、测试和部署管道。 你可以创建工作流，以便在推送更改到存储库时运行测试，或将合并的拉取请求部署到生产环境。

## Actions配置运行Java

1. 创建Actions

![image-20250324150034726](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250324150034726.png)

2. 编写main.yml

```yml
# 名称
name: Run Java Git Diff By Local

on:
  # 推送分支
  push:
    branches:         
      - master
  # 拉取分支
  pull_request:
    branches:
      - master

jobs:
  build-and-run:
  # 固定运行环境
    runs-on: ubuntu-latest
  # 执行步骤
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
        with:
          fetch-depth: 2  # 检出最后两个提交，以便可以比较 HEAD~1 和 HEAD

      - name: Set up JDK 11
        uses: actions/setup-java@v2
        with:
          distribution: 'temurin'  # 你可以选择其他发行版，如 'adopt' 或 'zulu'
          java-version: '11'

      - name: Run Java code
        run: |
          cd xxx(项目名)/src/main/java
          javac xxxx(文件路径，例如org/demo)/xxx.java
          java (文件路径，例如org.demo).xxx
```

当提交代码到master分支，就会自动触发以上命令，可以在当前界面查看执行流程

![image-20250324150807904](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250324150807904.png)

![image-20250324150729663](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250324150729663.png)



## Actions配置运行Maven项目

创建main-maven-jar.yml文件，主要指定步骤就是maven执行install、复制jar包到指定目录、运行jar包

```yml
name: Build and Run OpenAiCodeReview By Main Maven Jar
on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - master
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
        with:
          fetch-depth: 2

      - name: Set up JDK 11
        uses: actions/setup-java@v2
        with:
          distribution: 'adopt'
          java-version: '11'
      # maven构建
      - name: Build with Maven
        run: mvn clean install
      # 复制OpenAI自动评审组件jar包到Github服务器的libs目录下
      - name: Copy openai-code-review-sdk JAR
        run: mvn dependency:copy -Dartifact=icu.flycode:openai-code-review-sdk:1.0 -DoutputDirectory=./libs

      - name: Run OpenAiCodeReview
        run: java -jar ./libs/openai-code-review-sdk-1.0.jar
```

![image-20250326085937261](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250326085937261.png)
