---
title: MCP新版实现
createTime: 2025/06/26 15:43:40
permalink: /article/9sx7h8xh/
tags:
  - MCP
  - AI
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/bg04.jpg
---
## 🖥️ 基于 Spring AI 的本地与在线 MCP 客户端接入实战

Spring AI 支持本地与在线模型的统一封装调用，结合 MCP（Model Context Protocol）协议，可实现 AI 与文件系统交互、自动生成文件等强大能力。

本文将分别介绍：

- ✅ 基于 **本地 Ollama + Qwen3** 模型实现文件操作
- ✅ 基于 **ZhiPu AI 在线模型** 实现远程工具调用

------

## 🚀 本地 Ollama + Qwen3 模型接入 MCP 实践

[Srping AI](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-client-boot-starter-docs.html)

### ✅ 推荐模型：Qwen3

使用 [Qwen3 模型](https://ollama.com/library/qwen3)，原因如下：

- ✅ 支持 MCP 工具调用
- 🚫 其他模型（如 deepseek）当前不支持 MCP 工具

------

### 1️⃣ 引入依赖

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-ollama-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-mcp-server-spring-boot-starter</artifactId>
</dependency>
```

------

### 2️⃣ 配置 `application.yml`

```ym;
spring:  
  ai:
    ollama:
      base-url: http://172.26.37.0:11434
      embedding:
        enabled: true
        model: nomic-embed-text
        options:
          num-batch: 512
    mcp:
      client:
        stdio:
          servers-configuration: classpath:config/mcp-servers.json
```

------

### 3️⃣ MCP 工具配置 `mcp-servers.json`

在不使用本地服务的情况下，你也可以接入以下 **云端托管的 MCP Server**：

- 🔗 [Smithery AI MCP 服务](https://smithery.ai/)
- 🔗 [Glama MCP 服务](https://glama.ai/mcp/servers)

它们支持通过浏览器接入标准 MCP 工具链，适合快速接入和调试。

------

#### 🖥️ 本地文件操作：server-filesystem 模式

若使用 `server-filesystem` 工具运行在本地环境，可实现如下能力：

- 📂 **读取 / 写入 / 删除本地文件**
- 📁 **操作指定目录下的文件结构**
- ✅ **完整支持 MCP 文件类工具接口**

但需注意以下前提条件：

- 本地需安装好 **Node.js 和 npm**
- 全局安装或通过 `npx` 调用 [`@modelcontextprotocol/server-filesystem`](https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem)

示例启动命令配置如下：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx.cmd",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\flycode\\Desktop\\temp"
      ]
    }
  }
}
```

📌 配置说明：

- MCP 工具将操作 `C:\\Users\\flycode\\Desktop\\temp` 目录
- 可通过 Ollama 实现 AI 与文件系统的交互

------

### 4️⃣ Spring Bean 配置

```java
@Configuration
public class OllamaConfig {
    @Bean
    public ChatClient.Builder ollamaChatClientBuilder(OllamaChatModel ollamaChatModel) {
        return new DefaultChatClientBuilder(
            ollamaChatModel, 
            ObservationRegistry.NOOP, 
            (ChatClientObservationConvention) null
        );
    }
}
```

------

### 5️⃣ 调用测试：生成本地文件

```java
@Resource
private ToolCallbackProvider toolCallback;
@Resource
private ChatClient.Builder ollamaChatClientBuilder;

@Test
public void makeNewText() {
    String prompt = "帮我生成一个测试.txt文件到C:\\Users\\flycode\\Desktop\\temp位置，并且内容是测试xxxx";
    
    String text = ollamaChatClientBuilder
        .defaultTools(toolCallback)
        .build()
        .prompt(new Prompt(prompt, OllamaOptions.builder().model("qwen3:latest").build()))
        .call()
        .chatResponse()
        .getResult()
        .getOutput()
        .getText();

    log.info(text);
}
```

------

### ✅ 实际效果

📂 本地文件已自动创建：

![生成本地文件效果图](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250626154816601.png)

------

## ☁️ 使用 ZhiPu AI 在线模型调用 MCP 工具

[ZhiPu AI](https://www.bigmodel.cn/dev/api/normal-model/glm-4)

本地模型速度较慢？可以切换到 **智谱 AI 在线模型**，实现远程文件管理。

📌 注意：

- 仅智谱 API 支持 MCP 工具协议（国内支持最完善）
- 调用将消耗较多 Token，按需使用

------

### 1️⃣ 引入依赖

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-zhipuai-spring-boot-starter</artifactId>
</dependency>
```

------

### 2️⃣ 配置 `application.yml`

```yml
spring:
  ai:
    zhipuai:
      api-key: xxxxxx  # 请替换为你的真实密钥
      chat:
        options:
          model: glm-4-plus
      base-url: https://open.bigmodel.cn/api/paas/
    mcp:
      client:
        stdio:
          servers-configuration: classpath:config/mcp-servers.json
```

------

### 3️⃣ 配置 Bean

```java
@Configuration
public class ZhipuConfig {

    @Bean
    public ZhiPuAiApi zhiPuAiApi(@Value("${spring.ai.zhipuai.base-url}") String baseUrl,
                                  @Value("${spring.ai.zhipuai.api-key}") String apiKey) {
        return new ZhiPuAiApi(baseUrl, apiKey);
    }

    @Bean
    public ChatClient.Builder zhipuChatClientBuilder(ZhiPuAiChatModel zhipuChatModel) {
        return new DefaultChatClientBuilder(
            zhipuChatModel, 
            ObservationRegistry.NOOP, 
            (ChatClientObservationConvention) null
        );
    }
}
```

------

### 4️⃣ 测试 MCP 工具能力

```java
@Resource
private ToolCallbackProvider toolCallback;
@Resource
private ChatClient.Builder zhipuChatClientBuilder;

@Test
public void test2() {
    String res = zhipuChatClientBuilder
        .defaultTools(toolCallback)
        .build()
        .prompt("当前有哪些工具可用")
        .call()
        .chatResponse()
        .getResult()
        .getOutput()
        .getText();

    log.info(res);
}
```

------

### ✅ 效果展示

✨ 可用 MCP 工具一览（自动返回）：

![ZhiPu AI 工具调用效果](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250626155456657.png)

------

## 🔚 总结

| 项目     | Ollama 本地模型    | 智谱 AI 在线模型    |
| -------- | ------------------ | ------------------- |
| 速度     | 较慢               | 快速                |
| 支持模型 | Qwen3（MCP支持）   | GLM 系列（MCP支持） |
| 调用成本 | 免费，需本地资源   | 收费，需 API Token  |
| 推荐用途 | 本地开发、私有部署 | 云端调用、便捷测试  |



------

