---
title: SpringBoot调用本地AI
createTime: 2025/05/06 13:32:45
permalink: /article/ag1sjqlc/
tags:
  - AI
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250506145712.jpg
---



# 🚀 Spring Boot + 本地大模型：5 分钟打造自己的 ChatGPT 对话系统

> 本文将手把手教你如何用 Spring Boot + Ollama + Spring AI 快速搭建一个支持**流式输出**的本地 AI 对话系统，**无需联网、支持私有部署**，还能扩展接入 OpenAI、DeepSeek 等模型。

------

## 🧠 第一步：安装 Ollama，开启本地大模型

Ollama 是一个简洁好用的本地大模型运行工具，你可以在自己的电脑上直接部署和运行 LLM。

### ✅ 安装 Ollama

访问官网下载安装（支持 Windows/Mac/Linux）：

👉 https://ollama.com/download

### ✅ 启动并验证是否成功

打开终端，运行：

```bash
ollama run gemma3:1b
```

浏览器访问：http://localhost:11434/，看到如下页面代表 Ollama 已运行：

![Ollama运行成功](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250506133601162.png)

------

## 🧩 第二步：Spring Boot 调用本地模型

[Spring AI](https://docs.spring.io/spring-ai/reference/index.html) 是由 Spring 团队推出的 AI 接口库，集成后调用本地模型就像调用数据库一样简单。目前已经推出1.0正式版。

我们需要创建一个SpringBoot项目，进行如下配置

### 🧱 添加依赖（Maven）

```xml
<dependency>
  <groupId>org.springframework.ai</groupId>
  <artifactId>spring-ai-ollama-spring-boot-starter</artifactId>
  <version>1.0.0-M6</version>
</dependency>
```

### ⚙️ 配置 application.yml

```yml
spring:
  ai:
    ollama:
      base-url: http://localhost:11434
      chat:
        model: gemma3:1b
```

> ✅ 模型名需和你本地运行的一致！

------

### ✨ 创建一个简单的对话接口

```java
@RequestMapping("/ollama")
@RestController
public class LocalAIInvokeTest {
    @Resource
    private OllamaChatModel ollamaChatModel;

    /**
     * 根据用户提问输出回答
     *
     * @param prompt
     * @return
     */
    @GetMapping("/test")
    public String testChat(String prompt) {
        ChatResponse chatResponse = ollamaChatModel
                .call(new Prompt(prompt,
                        OllamaOptions.builder()
                                .model("gemma3:1b")
                                .build()));
        return chatResponse.getResult().getOutput().getText();
    }
}
```

效果示例：

http://localhost:8080/test?prompt=你好

🖼️ 接口返回效果：

![普通输出效果](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250625134809668.png)

------

## 💬 第三步：实现流式对话（像 ChatGPT 一样输出）

相比普通一次性输出，流式输出体验更丝滑，可以边生成边展示内容。

Spring Boot 使用 `Flux + TEXT_EVENT_STREAM_VALUE` 即可实现：

```java
@GetMapping(value = "/testStream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ChatResponse> testChatStream(String prompt) {
    return ollamaChatModel.stream(
        new Prompt(prompt, OllamaOptions.builder().model("gemma3:1b").build()));
}
```

📸 效果图：

![流式输出效果](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250625141037247.png)

------

## 💻 第四步：用原生 HTML 打造可交互前端

无需 Vue/React，只用 HTML + JS 实现一个支持**实时流式展示**的聊天界面👇

👉 功能包含：

- 自动滚动
- 支持 Markdown 渲染
- 支持 Enter 发送、Shift+Enter 换行
- 自动伸缩输入框

🔧 代码如下

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>本地 AI 对话系统</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js"></script>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: "Helvetica Neue", Arial, sans-serif;
      background: #f4f4f4;
      margin: 0;
      padding: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .chat-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 1200px;
      height: 100%;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
    }

    .message {
      max-width: 70%;
      padding: 12px 16px;
      margin: 8px 0;
      border-radius: 16px;
      word-break: break-word;
      line-height: 1.5;
    }

    .user {
      align-self: flex-end;
      background-color: #dcfce7;
      color: #0f5132;
      border: 1px solid #badbcc;
    }

    .ai {
      align-self: flex-start;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
    }

    .input-bar {
      display: flex;
      padding: 16px 24px;
      border-top: 1px solid #ddd;
      background-color: #ffffff;
    }

    #promptInput {
      flex: 1;
      padding: 12px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 8px;
      resize: none;
      height: 48px;
      line-height: 1.5;
    }

    #sendBtn {
      margin-left: 12px;
      padding: 12px 20px;
      font-size: 16px;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    #sendBtn:hover {
      background-color: #45a049;
    }

    pre code {
      background: #f6f8fa;
      padding: 8px;
      border-radius: 6px;
      display: block;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="chat-wrapper">
    <div class="chat-container" id="chatContainer"></div>
    <div class="input-bar">
      <textarea id="promptInput" placeholder="请输入你的问题..." rows="3"></textarea>
      <button id="sendBtn">发送</button>
    </div>
  </div>

  <script>
    const chatContainer = document.getElementById('chatContainer');
    const input = document.getElementById('promptInput');
    const button = document.getElementById('sendBtn');

    function appendMessage(className) {
      const div = document.createElement('div');
      div.className = `message ${className}`;
      chatContainer.appendChild(div);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      return div;
    }

    function sendMessage() {
      const prompt = input.value.trim();
      if (!prompt) return;

      const userDiv = document.createElement('div');
      userDiv.className = 'message user';
      userDiv.textContent = prompt;
      chatContainer.appendChild(userDiv);

      input.value = '';
      input.style.height = '48px'; // 重置高度

      const aiDiv = appendMessage('ai');
      let markdownBuffer = '';

      const eventSource = new EventSource(`http://localhost:8090/ollama/testStream?prompt=${encodeURIComponent(prompt)}`);

      eventSource.onmessage = (event) => {
        const json = JSON.parse(event.data);
        const text = json.result.output.text;
        markdownBuffer += text;
        aiDiv.innerHTML = DOMPurify.sanitize(marked.parse(markdownBuffer));
        chatContainer.scrollTop = chatContainer.scrollHeight;
      };

      eventSource.onerror = () => {
        eventSource.close();
      };
    }

    // 点击发送按钮
    button.onclick = sendMessage;

    // 按回车键发送（Shift+Enter换行）
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // 自动调整 textarea 高度
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    });
  </script>
</body>
</html>

```

页面效果如下：

![页面效果展示](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250625144432562.png)

------

## 🌐 第五步：接入 OpenAI、DeepSeek 等云模型（可选）

如需调用云端大模型（如 GPT-4、DeepSeek），只需：

### ✅ 申请对应的key

### ✅ 引入依赖

```xml
<dependency>
  <groupId>org.springframework.ai</groupId>
  <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
</dependency>
```

### ✅ 配置 API Key

```yml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
```

> 若使用国产模型（如通义千问），推荐使用阿里封装的SpringAI [Spring AI Alibaba](https://java2ai.com/docs/1.0.0-M6.1/overview/?spm=4347728f.6476bf87.0.0.a3c1556bHVEtNK)。

------

## 📌 小结

通过本文你已经掌握：

✅ 如何安装并运行本地大模型
 ✅ 如何用 Spring Boot + Spring AI 调用模型
 ✅ 如何实现 ChatGPT 式流式输出接口
 ✅ 如何构建一个轻量前端聊天系统
