---
title: SpringBoot调用本地AI
createTime: 2025/05/06 13:32:45
permalink: /article/ag1sjqlc/
tags:
  - AI
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250506145712.jpg
---





## 1. 本地安装大模型

可以使用[Ollama](https://ollama.com/download)快速安装大模型，省去复杂配置

1. 下载安装Ollama
2. 确认是否安装成功

http://localhost:11434/  出现Ollama is running证明成功

![image-20250506133601162](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250506133601162.png)

3. 安装模型

[大模型列表](https://ollama.com/search)

选择模型后，可以在右侧复制命令到本地执行

![image-20250506133735822](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250506133735822.png)

![image-20250506133921639](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250506133921639.png)



## 2. Spring AI调用本地Ollama模型

[Spring AI Ollama](https://java2ai.com/docs/1.0.0-M6.1/models/ollama/)

1. 引入依赖

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-ollama-spring-boot-starter</artifactId>
    <version>1.0.0-M6</version>
</dependency>
```

2. 配置yml

```yml
spring:
  ai:
     ollama:
      base-url: http://localhost:11434
      chat:
        model: gemma3:1b
```

3. 代码调用

```java
@RequestMapping("/ollama")
@RestController
public class LocalAIInvokeTest {
    @Resource(name = "ollamaChatModel")
    private ChatModel chatModel;

    @GetMapping("/test")
    public String test() {
        AssistantMessage assistantMessage = chatModel.call(new Prompt("你是谁")).getResult().getOutput();
        return assistantMessage.getText();
    }
}
```

4. 流式输出
```java
chatModel.stream(new Prompt(prompt, OllamaOptions.builder().model(model).build()))
```
5. 运行截图

![image-20250506144439931](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250506144439931.png)

实现调用本地ai
