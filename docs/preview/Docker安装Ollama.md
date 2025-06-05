---
title: Docker安装Ollama
createTime: 2025/06/05 15:13:39
permalink: /article/bl0b1bd0/
tags:
  - Docker
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250605165730.jpg

---

## Ollama 官网

访问 Ollama 官方网站 获取更多关于 Ollama 的信息和支持。

## Docker Compose 脚本

首先，我们需要创建一个 Docker Compose 文件来定义服务。打开终端并输入以下命令以创建 docker-compose-ollama.yml 文件：

```bash
vim docker-compose-ollama.yml
```

接着，在文件中添加如下内容：

```yml
version: '3'
services:
  ollama:
    image: registry.cn-hangzhou.aliyuncs.com/xfg-studio/ollama:0.5.10
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
```

### 运行 Docker Compose 文件

保存并退出编辑器后，运行以下命令启动服务：

```bash
docker-compose -f docker-compose-ollama.yml up -d
```

这将以后台模式启动 Ollama 服务。

### 检查服务是否正常运行

可以通过浏览器访问以下地址来确认 Ollama 是否已经成功运行：

http://localhost:11434/

可以在 Portainer 中查看 Ollama 的运行状态。参考以下截图示例：

![Check Status in Portainer](https://broadscope-dialogue-new.oss-cn-beijing.aliyuncs.com/output/20250605/b13109b4ce1b1e779eda99d0e05821a1.png?Expires=1780646934&OSSAccessKeyId=LTAI5tL97mBYzVcjkG1cUyin&Signature=pNe3nIuAvLnFP3ujMxxdRpDTv88%3D)

### 使用命令行进入容器

为了执行命令或者进行调试，可以使用以下命令进入 Ollama 容器的交互式 shell：

```
docker exec -it ollama /bin/bash
```

或者使用Portainer的命令行工具运行命令

![Enter Command Console](https://broadscope-dialogue-new.oss-cn-beijing.aliyuncs.com/output/20250605/9a631a85e17e768cc0a7e95a41b55fa1.png?Expires=1780646934&OSSAccessKeyId=LTAI5tL97mBYzVcjkG1cUyin&Signature=%2BFNha82iB2BFR7LFy%2FU%2BQA5xz58%3D)

### Ollama 相关命令

在容器内部或通过 API 可以使用一系列 Ollama 命令来管理模型和服务：

- **启动服务**：

  ```
  ollama serve
  ```

- **拉取模型**：

  ```
  ollama pull deepseek-r1:1.5b
  ```

- **列出所有已下载模型**：

  ```
  ollama list
  ```

- **显示特定模型的信息**：

  ```
  ollama show model_name
  ```

- **运行特定模型**：

  ```
  ollama run --gpu model_name
  ```

- **停止正在运行的模型**：

  ```
  ollama stop model_id
  ```

- **删除指定模型**：

  ```
  ollama rm model_name
  ```

可以通过查看 Ollama 的日志来帮助诊断。对于 Docker 容器，可以使用 docker logs`命令查看输出的日志信息。

```
docker logs ollama
```

![image-20250605162045266](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250605162045266.png)
