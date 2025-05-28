---
title: MCP
createTime: 2025/05/23 09:55:42
permalink: /article/qv9hyd29/
tags:
  - AI
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250528101622.jpg

---



## MCP概念

### 什么是MCP

MCP（Model Context Protocol 模型上下文协议）是一种开放标准，目的是增强AI与外部系统交互的能力。MCP为AI提供了与外部工具、资源和服务交互的标准方式，让AI能够访问最新数据、执行复杂操作，并与现有系统集成。

[MCP官网](https://modelcontextprotocol.io/introduction)

[MCP中文官网](https://mcp-docs.cn/docs/concepts/resources) MCP 是一个开放协议，它为应用程序向 LLM 提供上下文的方式进行了标准化。你可以将 MCP 想象成 AI 应用程序的 USB-C 接口。就像 USB-C 为设备连接各种外设和配件提供了标准化的方式一样，MCP 为 AI 模型连接各种数据源和工具提供了标准化的接口。

MCP三大作用：

- 增强AI能力
- 统一标准
- 打造服务生态

### MCP架构

#### 整体架构

采用客户端-服务器架构，客户端主机应用（MCP服务的程序）可以连接多个服务器

![image-20250527111609217](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527111609217.png)



#### SDK三层架构

![image-20250527111910062](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527111910062.png)

- 客户端/服务层：McpClient处理客户端操作，McpServer处理服务端操作，使用Session进行通信管理
- 会话层：通过DefaultSession实现通信模式和状态
- 传输层：处理JSON-RPC消息序列化和反序列化，支持多种传输实现，比如Stdio标准IO和Http SSE远程传输

![image-20250527135952732](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527135952732.png)



#### MCP客户端

负责与MCP 服务器建立连接并且通信。能够自动匹配服务器的协议版本、确认可用功能、负责数据传输和JSON-RPC交互，此外还可以使用各种工具、管理资源、和提示词系统进行交互

两种传输方式：

- Stdio：标准输入输出，适合本地调用
- 基于Java的HttpClient和WebFlux的SSE传输：适合远程调用

![image-20250527140845639](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527140845639.png)

#### MCP服务端

为客户端提供各种工具、资源和功能支持。负责处理客户端的请求，包括解析协议、提供工具、管理资源以及各种交互信息。支持Stdio标准输入输出，基于Servlet/WebFlux的SSE传输，满足不同的应用场景。

![image-20250527140757277](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527140757277.png)

这种设计让客户端和服务端解耦。

### MCP核心概念

1. Resources资源：让服务端向客户端提供各种数据，比如文件内容、数据库记录等数据
2. Prompts提示词：服务端可以定义可复用的提示词模板和工作流，供客户端和用户直接使用。提供一种强大的方式来标准化和共享常见的 LLM 交互模式，简化交互流程。
3. Tools工具：服务端可以返回的客户端调用的函数，使得AI可以执行计算、查询信息等功能，扩展AI能力
4. Sampling采样：允许服务端通过客户端向大模型发送生成的内容。使得MCP可以实现更加复杂的智能代理行为，同时保持用户对整个过程的控制已经隐私保护。
5. Roots根目录：定义了服务器可以访问的文件目录，限制访问范围。
6. Transport传输：定义客户端和服务端的通信方式，Stdio和SSE。

但是目前大部分模型只支持Tools工具调用。



## MCP的使用

MCP服务市场：

- [MCP.so](https://mcp.so/)
- [GitHub Awesome MCP Server](https://github.com/punkpeye/awesome-mcp-servers):开源的MCP服务集合
- [阿里云百炼平台](https://bailian.console.aliyun.com/?tab=mcp#/mcp-market)
- [Spring Ai alibaba](https://java2ai.com/mcp/)



### 阿里云百炼MCP

以高德地图为例，我们只需要按照官方提供的方式，先开通服务，再在智能体里面添加MCP服务

![image-20250527143139370](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527143139370.png)

![image-20250527143526580](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527143526580.png)

![image-20250527143557628](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527143557628.png)

可以看到，提问的时候调用了高德的工具，使用到了maps_text_search这个工具



### Cursor使用MCP

![image-20250527143852866](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527143852866.png)

在Cursor的Settings里面可以添加MCP服务，点击后发现是这样的格式，此时我们并不知道如何编写格式数据。

```xml
{
  "mcpServers": {}
}
```

我们可以到[MCP.so](https://mcp.so/)或者其他MCP集合网站搜索Amap

![image-20250527144114181](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527144114181.png)

里面已经定义好了服务的配置格式，我们只需要复制下来，填写自己的API_key即可调用。我们首先需要到[高德地图控制台](https://console.amap.com/dev/key/app)添加新的key，配置完成效果如下

![image-20250527144415745](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527144415745.png)

开始提问：可以看到调用了MCP的工具，但是测试中，发现AI不一定能够执行正确结果，它会推理，如果不满足用户的提问，会继续重新构造请求调用工具。

![image-20250527145144788](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527145144788.png)

### 本地调用MCP

参考[Spring AI alibaba](https://java2ai.com/docs/1.0.0-M6.1/tutorials/mcp/?#31-%E5%9F%BA%E4%BA%8Estdio%E7%9A%84mcp%E5%AE%A2%E6%88%B7%E7%AB%AF%E5%AE%9E%E7%8E%B0)

1. 引入依赖

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-mcp-client-spring-boot-starter</artifactId>
    <version>1.0.0-M6</version>
</dependency>
```

2. 配置yml

```yml
spring:
  ai:
    dashscope:
      # 配置通义千问API密钥
      api-key: ${DASH_SCOPE_API_KEY}
    mcp:
      client:
        stdio:
          # 指定MCP服务器配置文件路径（推荐）
          servers-configuration: classpath:mcp-servers-config.json
          # 直接配置示例，和上边的配制二选一
          # connections:
          #   server1:
          #     command: java
          #     args:
          #       - -jar
          #       - /path/to/your/mcp-server.jar
```

3. 创建配置文件，放在resources目录下，这里的command在windows使用npx.cmd，Linux或者其他环境可以直接使用npx

```json
{
  "mcpServers": {
    "amap-maps": {
      "command": "npx.cmd",
      "args": [
        "-y",
        "@amap/amap-maps-mcp-server"
      ],
      "env": {
        "AMAP_MAPS_API_KEY": "xxxx"
      }
    }
  }
}
```

4. 使用工具

```java
    @Resource
    private ToolCallbackProvider[] toolCallbackProviders;
    public String doChatWithMCP(String message, String chatId) {
        ChatResponse chatResponse = chatClient
                .prompt()
                .user(message)
                .system(SYSTEM_PROMPT)
                .advisors(spec -> spec.param(CHAT_MEMORY_CONVERSATION_ID_KEY, chatId)
                        .param(CHAT_MEMORY_RETRIEVE_SIZE_KEY, 10))
                .advisors(new MyAdvisors())
                .tools(toolCallbackProviders)
                .call()
                .chatResponse();
        String content = chatResponse.getResult().getOutput().getText();
        log.info(content);
        return content;
    }
```

测试中，我们可以看到系统已经调用了高德地图提供的工具。

![image-20250527150916033](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527150916033.png)



## MCP开发

### MCP客户端开发

[Spring AI MCP Client Boot Starters](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-client-boot-starter-docs.html)

官方提供了两种方式MCP Client和WebFlux Client，区别在于响应式和非响应式，具体步骤参照官网



### MCP服务端开发

[Spring AI MCP Server Boot Starters](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html)

Spring Al提供了3种MCP服务端SDK,分别支持非响应式和响应式编程

- spring-ai-starter-mcp-server:提供stdio传输支持,不需要额外的web依赖
- spring-ai-starter-mcp-server-webmvc:提供基于Spring MVC的SSE传输和可选的stdio传输(一般建议引入这
  个)
- spring-ai-starter-mcp-server-webflux:提供基于Spring WebFlux的响应式 SSE 传输和可选的stdio传输



### 辅助MCP开发的工具

[Spring AI MCP Helper	](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-helpers.html)



## MCP开发实战-图片搜索服务

### 服务端开发

1. 创建新模块

![image-20250527161040768](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527161040768.png)

2. Pexels图片资源网站API

[Pexels](https://www.pexels.com/api/documentation/#photos-search)

登录之后，创建图片和视频的API密钥

![image-20250527161613115](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250527161613115.png)

[图片搜索文档](https://www.pexels.com/zh-cn/api/documentation/#photos-search)

3. 引入Stdio标准输入输出依赖

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-mcp-server-webmvc-spring-boot-starter</artifactId>
    <version>1.0.0-M6</version>
</dependency>
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-all</artifactId>
    <version>5.8.37</version>
</dependency>
```

4. 编写配置文件

application-stdio.yml指定为stdio模式

```yml
spring:
  ai:
    mcp:
      server:
        name: fly-image-search-mcp-server
        version: 0.0.1
        type: SYNC
        # stdio
        stdio: true
  # stdio
  main:
    web-application-type: none
    banner-mode: off
```

application-sse.yml指定为SSE模式

```yml
spring:
  ai:
    mcp:
      server:
        name: fly-image-search-mcp-server
        version: 0.0.1
        type: SYNC
        # sse
        stdio: false
```

application.yml指定启动的配置环境

```yml
spring:
  application:
    name: fly-image-search-mcp-server
  profiles:
    active: stdio
server:
  port: 8127
```

5. 搜索图片工具编写

请求格式如下

```bash
curl -H "Authorization: YOUR_API_KEY" \
  "https://api.pexels.com/v1/search?query=nature&per_page=1"
```

```java
@Service
public class ImageSearchTool {

    private String API_KEY = "xxx";

    private static final String URL = "https://api.pexels.com/v1/search";

    @Tool(description = "search image from web")
    public String searchImage(@ToolParam(description = "search query keyword") String query) {
        try {
            return String.join(",", searchImageByKeyword(query));
        } catch (Exception e) {
            return "Error search image: " + e.getMessage();
        }
    }

    /**
     *
     * @param query
     * @return
     */
    public List<String> searchImageByKeyword(String query) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", API_KEY);
        Map<String, Object> params = new HashMap<>();
        params.put("query", query);
        String response = HttpUtil.createGet(URL)
                .addHeaders(headers)
                .form(params)
                .execute()
                .body();
        return JSONUtil.parseObj(response)
                .getJSONArray("photos")
                .stream()
                .map(photoObj -> (JSONObject) photoObj)
                .map(photoObj -> photoObj.getJSONObject("src"))
                .map(photoObj -> photoObj.getStr("medium"))
                .filter(StrUtil::isNotBlank)
                .collect(Collectors.toList());
    }
}
```

6. 接口测试

```java
@SpringBootTest
class FlyImageSearchMcpServerApplicationTests {
    @Resource
    private ImageSearchTool imageSearchTool;
    @Test
    void contextLoads() {
        String res = imageSearchTool.searchImage("computer");
        System.out.println(res);
    }
}
```

7. 注册工具

```java
@SpringBootApplication
public class FlyImageSearchMcpServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(FlyImageSearchMcpServerApplication.class, args);
    }

    @Bean
    public ToolCallbackProvider weatherTools(ImageSearchTool imageSearchTool) {
        return MethodToolCallbackProvider.builder().toolObjects(imageSearchTool).build();
    }
}
```

8. 本地打包

### 客户端开发

1. 引入依赖

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-mcp-client-spring-boot-starter</artifactId>
    <version>1.0.0-M6</version>
</dependency>
```

2. 配置MCP Server

```java
{
  "mcpServers": {
    "fly-image-search-mcp-server": {
      "command": "java",
      "args": [
        "-Dspring.ai.mcp.server.stdio=true",
        "-Dspring.main.web-application-type=none",
        "-Dlogging.pattern.console=",
        "-jar",
        "fly-image-search-mcp-server/target/fly-image-search-mcp-server-0.0.1-SNAPSHOT.jar"
      ],
      "env": {}
    }
  }
}
```

我们可以在env里面设置环境变量，比如

```json
 "env": {
    "perPage": "7"
  }
```

对应的服务端可以通过System.getenv("perPage")获取

3. 测试运行

```java
String chatId = UUID.randomUUID().toString();
String message = "computer image";
loveApp.doChatWithMCP(message, chatId);
```

![image-20250528092158742](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250528092158742.png)

可以看到是调用了这个服务端的工具



### SSE调用

配置服务端yml

```yml
spring:
  application:
    name: fly-image-search-mcp-server
  profiles:
    active: sse
server:
  port: 8127
```

启动服务端

配置客户端yml

```yml
spring:
  ai:
    mcp:
      client:
        sse:
          connections:
            server1:
              url: http://localhost:8127
```

可以正常运行



## MCP使用注意

1. 慎用MCP：MCP本质上就是一个标准，不是一定需要使用，如果在单一场景，没必要使用MCP
2. 传输模式选择：Stdio适用于本地运行，无须网络传输，适合小型项目，SSE适用于独立的服务器部署，可以多人共享使用
3. 明确描述：@Tool和@ToolParam描述需要准确，没有歧义，便于AI的理解和调用
4. 注意容错：AI生成的内容每次都不相同，可能多次都无法获取成功结果，需要捕获所有可能的异常，返回对应的结果给客户端
5. 性能优化：AI工具调用执行的时间可能过长，影响后续的调用，可以使用异步方式调用，或者设置超时时间，超过时间就不继续调用工具
6. 安全问题：我们一般不会关注MCP对应工具的源码，我们只能在调用的时候知道是调用的什么工具，返回了什么结果，不清楚具体的执行逻辑，开发者可能会在MCP服务里面埋坑，MCP缺乏严格的版本通知和更新通知机制，缺乏权限验证
