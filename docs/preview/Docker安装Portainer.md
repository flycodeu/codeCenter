---
title: Docker安装Portainer
createTime: 2025/06/05 11:03:30
permalink: /article/hum6yb9x/
tags:
  - Docker
cover: 
---
> 官网：https://www.portainer.io/
介绍：在任何数据中心、云、网络边缘或 IIOT 设备的 Kubernetes、Docker、Swarm 和 Nomad 上，在几分钟内部署、配置、故障排除和保护容器。
## 基础安装
### 1. 拉取最新的Portainer
```bash
docker pull portainer/portainer
```

### 2.Docker运行Portainer
```bash
docker run -d --restart=always --name portainer -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer
```


### 3. 访问Portainer
http://ip:9000
首次登录需要设置用户名、密码

![image-20250605133049002](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250605133049002.png)

可以在当前界面看到运行的docker程序

![image-20250605133309668](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250605133309668.png)