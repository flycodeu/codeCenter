---
title: Docker安装Jenkins
createTime: 2025/06/05 13:51:31
permalink: /article/oesk8ynz/
tags:
  - Docker
  - Jenkins
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250605170107.jpg
---

## Jenkins安装
### 1. 安装Java
Java安装详情参考[Centos安装Java8](Centos7安装Java8.md)
[Java官网](https://www.oracle.com/cn/java/technologies/downloads/)
指定Java的版本，如果不指定，那么就会默认使用Jenkins的17版本，但是目前Jenkins已经不支持Java8了，所以建议安装17的版本
```bash
wget https://download.oracle.com/otn/java/jdk/8u202-b08/1961070e4c9b4e26a04e7f5a083f551e/jdk-8u202-linux-x64.tar.gz
tar -zxvf jdk-8u202-linux-x64.tar.gz
```
### 2. 配置Maven镜像
```bash
/usr/local/maven/conf/settings.xml
```

### 1. 编写docker-compose-jenkins3.8.yml脚本
```yml
version: '3.8'
services:
  jenkins:
    image: jenkins/jenkins:2.439
    container_name: jenkins
    privileged: true
    user: root
    ports:
      - "9090:8080"
      - "50001:50000"
    volumes:
      - ./jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/local/bin/docker
      - ./maven/conf/settings.xml:/usr/local/maven/conf/settings.xml
    environment:
      - JAVA_OPTS=-Djenkins.install.runSetupWizard=false # 禁止安装向导「如果需要密码则不要配置」docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
    restart: unless-stopped

volumes:
  jenkins_home:
```
可以在volumes里面加入jdk配置，指定Java的版本，如果不指定，那么就会默认使用Jenkins的17版本，但是目前Jenkins已经不支持Java8了，所以建议安装17的版本
```yml
- /xxx/jdk/jdk1.8.0_202:/usr/local/jdk1.8.0_202
```
### 2. 运行脚本
```bash
docker-compose -f docker-compose-jenkins3.8.yml up -d
```