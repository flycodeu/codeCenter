---
title: SpringBoot调用AI
createTime: 2025/05/06 09:53:34
permalink: /article/fa626qwt/
tags:
 - AI
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250506145726.jpg

---

有如下四种方式便于我们在代码中调用AI

- 调用官方SDK
- 发送Http请求调用模型
- Spring AI框架
- LangChain4j专注于构建LLM应用的Java框架

## 接入方式

### SDK接入

[阿里云百炼文档](https://help.aliyun.com/zh/model-studio/install-sdk/)

1. 创建API Key
[创建API Key](https://bailian.console.aliyun.com/?tab=model#/api-key)


2. 引入依赖
```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>dashscope-sdk-java</artifactId>
    <version>2.19.5</version>
</dependency>
```

3. 模型调用
[模型调用官方代码](https://bailian.console.aliyun.com/?tab=api#/api/?type=model&url=https%3A%2F%2Fhelp.aliyun.com%2Fdocument_detail%2F2712576.html&renderType=iframe)

![image-20250506101214746](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250506101214746.png)

```java
// 建议dashscope SDK的版本 >= 2.12.0
import java.util.Arrays;
import java.lang.System;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.utils.JsonUtils;

public class Main {
    public static GenerationResult callWithMessage() throws ApiException, NoApiKeyException, InputRequiredException {
        Generation gen = new Generation();
        Message systemMsg = Message.builder()
                .role(Role.SYSTEM.getValue())
                .content("You are a helpful assistant.")
                .build();
        Message userMsg = Message.builder()
                .role(Role.USER.getValue())
                .content("你是谁？")
                .build();
        GenerationParam param = GenerationParam.builder()
                // 若没有配置环境变量，请用百炼API Key将下行替换为：.apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                // 此处以qwen-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
                .model("qwen-plus")
                .messages(Arrays.asList(systemMsg, userMsg))
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .build();
        return gen.call(param);
    }
    public static void main(String[] args) {
        try {
            GenerationResult result = callWithMessage();
            System.out.println(JsonUtils.toJson(result));
        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            // 使用日志框架记录异常信息
            System.err.println("An error occurred while calling the generation service: " + e.getMessage());
        }
        System.exit(0);
    }
}
```

4. 返回数据

![image-20250506101248537](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250506101248537.png)



### Http接入

使用Curl

```curl
curl --location "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation" \
--header "Authorization: Bearer $DASHSCOPE_API_KEY" \
--header "Content-Type: application/json" \
--data '{
    "model": "qwen-plus",
    "input":{
        "messages":[      
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": "你是谁？"
            }
        ]
    },
    "parameters": {
        "result_format": "message"
    }
}'
```

```java
    public static void main(String[] args) {
        // 1. url
        String url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
        String key = TestApiKey.API_KEY;

        // 2. 系统消息 Json格式
        JSONObject systemMessages = new JSONObject();
        systemMessages.set("role", "system");
        systemMessages.set("content", "你是一个代码生成助手");

        // 3. 用户消息 json格式
        JSONObject userMessages = new JSONObject();
        userMessages.set("role", "user");
        userMessages.set("content", "你是谁");

        // 4. 整合两个消息
        JSONObject messages = new JSONObject();
        messages.set("messages", JSONUtil.createArray().set(systemMessages).set(userMessages));

        // 5. 构建参数
        JSONObject parameters = new JSONObject();
        parameters.set("result_format", "message");

        // 6. 整合data
        JSONObject data = new JSONObject();
        data.set("model", "qwen-plus");
        data.set("input", messages);
        data.set("parameters", parameters);

        // 7. 发送请求
        String result = HttpRequest.post(url)
                .header("Authorization", "Bearer " + key)
                .header("Content-Type", "application/json")
                .body(JSONUtil.toJsonStr(data))
                .execute()
                .body();

        System.out.println(result);

    }
```

输出结果

![image-20250506102820845](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250506102820845.png)



### Spring AI

[Spring AI文档](https://docs.spring.io/spring-ai/reference/)

Spring AI简化包含人工智能功能的应用程序的开发，而不会产生不必要的复杂性。

![image-20250506105155026](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250506105155026.png)

但是并不能支持所有的AI

[Spring AI支持模型](https://docs.spring.io/spring-ai/reference/api/chat/comparison.html)

我们可以使用阿里封装的SpringAI [Spring AI Alibaba](https://java2ai.com/docs/1.0.0-M6.1/overview/?spm=4347728f.6476bf87.0.0.a3c1556bHVEtNK)

1. 引入依赖

```xml
<dependency>
  <groupId>com.alibaba.cloud.ai</groupId>
  <artifactId>spring-ai-alibaba-starter</artifactId>
  <version>1.0.0-M5.1</version>
</dependency>
```

2. ai配置

```yml
spring:
  application:
    name: yu-ai-agent
  ai:
    dashscope:
      api-key: xxx
      chat:
        options:
          model: qwen-plus
```

3. 代码调用

```java
@RestController
@RequestMapping("/test")
public class HelloworldController {

    @Resource
    private ChatModel dashScopeChatModel;
    @GetMapping("/dashRes")
    public String getDashRes() {
        AssistantMessage assistantMessage = dashScopeChatModel.call(new Prompt("你是谁")).getResult().getOutput();
        System.out.println(assistantMessage.getText());
        return assistantMessage.toString();
    }
}
```

![image-20250506112645922](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250506112645922.png)



### LangChain4j

和Spring Al作用一样，[LangChain4j](https://docs.langchain4j.dev/)是一个专注于构建基于大语言模型(LLM)应用的Java框架，作为知名AI框架Lan
gChain的Java版本，它提供了丰富的工具和抽象层，简化了与LLM的交互和应用开发。

LangChain 官方是没有支持阿里系大模型的,只能用社区版本的整合大模型包。可以在官方文档中查询支持的模型列表:
[LangChain4j模型集成](https://docs.langchain4j.dev/integrations/language-models/)

[dashscope使用](https://docs.langchain4j.dev/integrations/language-models/dashscope/)

1. 引入依赖

```xml
<!-- https://mvnrepository.com/artifact/dev.langchain4j/langchain4j-community-dashscope -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-community-dashscope</artifactId>
    <version>1.0.0-beta2</version>
</dependency>
```

2. 代码调用

```java
import dev.langchain4j.community.model.dashscope.QwenChatModel;
import dev.langchain4j.model.chat.ChatLanguageModel;
public class LangChainAiInvoke {
    public static void main(String[] args) {
        ChatLanguageModel qwenModel = QwenChatModel.builder()
                .apiKey(TestApiKey.API_KEY)
                .modelName("qwen-plus")
                .build();
        String answer = qwenModel.chat("你是谁");
        System.out.println(answer);
    }
}
```



### 调用方式对比



| 接入方式    | 优点                                                         | 缺点                                                   | 适用场景                                            |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------ | --------------------------------------------------- |
| SDK接入     | - 类型安全<br>- 编译时检查<br>- 完善的错误处理<br>- 详细文档<br>- 性能优化好 | - 依赖特定版本<br>- 增加项目体积<br>- 语言限制         | - 需深度集成<br>- 单一模型提供商<br>- 高性能要求    |
| HTTP接入    | - 无语言限制<br>- 不增加额外依赖<br>- 灵活性高               | - 手动处理错误<br>- 序列化/反序列化复杂<br>- 代码冗长  | - SDK不支持的语言<br>- 简单原型验证<br>- 临时性集成 |
| Spring AI   | - 统一抽象接口<br>- 易切换模型提供商<br>- 与Spring生态融合<br>- 提供高级功能 | - 增加抽象层<br>- 可能不支持特定特性<br>- 版本快速迭代 | - Spring应用<br>- 支持多种模型<br>- 高级AI功能需求  |
| LangChain4j | - 完整AI工具链<br>- 支持复杂工作流<br>- 丰富组件和工具<br>- 适合构建AI代理 | - 学习曲线陡峭<br>- 文档较少<br>- 抽象可能影响性能     | - 复杂AI应用<br>- 需要链式操作<br>- RAG应用开发     |

推荐使用Spring AI，简单易用



## SpringAI

### 多轮对话

#### [ChatClient](https://docs.spring.io/spring-ai/reference/api/chatclient.html)

用于与 AI 模型通信。 它支持同步和流式编程模型。 具有构建 [Prompt](https://docs.spring.io/spring-ai/reference/api/prompt.html#_prompt) 的组成部分的方法，这些部分作为输入传递给 AI 模型。包含指导 AI 模型的输出和行为的说明文本。

#### [Advisors](https://docs.spring.io/spring-ai/reference/api/advisors.html)

Advisors API 提供了一种灵活而强大的方法来拦截、修改和增强 Spring 应用程序中的 AI 驱动的交互。 通过利用 Advisors API，开发人员可以创建更复杂、可重用和可维护的 AI 组件。主要优势包括封装重复的生成式 AI 模式、转换发送到大型语言模型 （LLM） 和从大型语言模型 （LLM） 发送的数据，以及提供跨各种模型和用例的可移植性。

![Advisor API 类](https://docs.spring.io/spring-ai/reference/_images/advisors-api-classes.jpg)

![image-20250508092005874](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250508092005874.png)

#### ChatMemoryAdvisor

我们可以使用这个Advisor实现上下文的关联对话

MessageChatMemoryAdvisor:从记忆中检索历史对话,并将其作为消息集合添加到提示词中

PromptChatMemoryAdvisor:从记忆中检索历史对话,并将其添加到提示词的系统文本中

VectorStoreChatMemoryAdvisor: 可以用向量数据库来存储检索历史对话

以上的都依赖于ChatMemory进行构造，ChatMemory负责历史对话的存储，定义了消息的保存、查询、删除操作。

![image-20250508093018134](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250508093018134.png)

里面包含如下存储，可以将对话存储到不同的数据源中

- InMemoryChatMemory:内存存储
-  CassandraChatMemory:在Cassandra 中带有过期时间的持久化存储
-  Neo4jChatMemory:在Neo4j中没有过期时间限制的持久化存储
-  JdbcChatMemory:在JDBC中没有过期时间限制的持久化存储



AI 模型处理两种主要类型的消息：用户消息（来自用户的直接输入）和系统消息（由系统生成以指导对话）。

https://docs.spring.io/spring-ai/reference/api/chatclient.html

```java
@Component
@Slf4j
public class TalkApp {
	
    private final ChatClient chatClient;
	// 预设
    private static final String SYSTEM_PROMPT = "xxx";

    public LoveApp(ChatModel dashscopeChatModel) {
        // 初始化基于内存的对话记忆
        ChatMemory chatMemory = new InMemoryChatMemory();
        chatClient = ChatClient.builder(dashscopeChatModel)
                .defaultSystem(SYSTEM_PROMPT)
                .defaultAdvisors(
                        new MessageChatMemoryAdvisor(chatMemory)
                )
                .build();
    }

    public String doChat(String message, String chatId) {
        ChatResponse response = chatClient
                .prompt()
                .user(message)
                .advisors(spec -> spec.param(CHAT_MEMORY_CONVERSATION_ID_KEY, chatId)
                        .param(CHAT_MEMORY_RETRIEVE_SIZE_KEY, 10))
                .call()
                .chatResponse();
        String content = response.getResult().getOutput().getText();
        log.info("content: {}", content);
        return content;
    }
}
```



### 自定义Advisors

[自定义Advisors](https://docs.spring.io/spring-ai/reference/api/advisors.html#_implementing_an_advisor)

通过官网我们可以了解到有两种方式实现，StreamAroundAdvisor和CallAroundAdvisor，两者区别在于一个是流式请求，另一个是同步处理请求，一般是两个都实现。

自定义日期拦截器

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.advisor.api.*;
import org.springframework.ai.chat.model.MessageAggregator;
import reactor.core.publisher.Flux;
@Slf4j
public class MyAdvisors implements StreamAroundAdvisor, CallAroundAdvisor {
    @Override
    public Flux<AdvisedResponse> aroundStream(AdvisedRequest advisedRequest, StreamAroundAdvisorChain chain) {
        advisedRequest = before(advisedRequest);
        Flux<AdvisedResponse> advisedResponses = chain.nextAroundStream(advisedRequest);
        return new MessageAggregator().aggregateAdvisedResponse(advisedResponses, this::aroundAfter);
    }
    @Override
    public String getName() {
        return this.getClass().getSimpleName();
    }
    @Override
    public int getOrder() {
        return 0;
    }
    @Override
    public AdvisedResponse aroundCall(AdvisedRequest advisedRequest, CallAroundAdvisorChain chain) {
        advisedRequest = before(advisedRequest);
        AdvisedResponse advisedResponse = chain.nextAroundCall(advisedRequest);
        advisedResponse = aroundAfter(advisedResponse);
        return advisedResponse;
    }
    /**
     * 后置处理
     *
     * @param advisedResponse
     * @return
     */
    private AdvisedResponse aroundAfter(AdvisedResponse advisedResponse) {
        log.info("AI response: {}", advisedResponse.response().getResult().getOutput().getText());
        return advisedResponse;
    }
    /**
     * 前置处理
     *
     * @param advisedRequest
     * @return
     */
    private AdvisedRequest before(AdvisedRequest advisedRequest) {
        log.info("AI Request: {}", advisedRequest.userText());
        return advisedRequest;
    }
}
```

只需要在使用中加入拦截器

```java
      .defaultAdvisors(
                        new MessageChatMemoryAdvisor(chatMemory),
                        new MyAdvisors()
                )
```

### 自定义Re-Reading Advisors

https://docs.spring.io/spring-ai/reference/api/advisors.html#_re_reading_re2_advisor

本质上就是让模型重新阅读来提高推理能力[参考文献](https://arxiv.org/pdf/2309.06275)

这种策略受到了人类在学习和解决问题时常常重复阅读问题以增强理解过程的启发。尽管LLMs在编码一个词元时由于其单向视角无法看到后续的词元，但通过模仿人类重复阅读的行为，可以实现对问题的“双向”理解。

具体来说，文中提到的研究者们通过对LLaMA-2模型进行初步实验，将问题重复两次作为输入，并使用GSM8K数据集来验证这一方法的效果。结果表明，这种重读策略使得LLaMA-2能够获得对问题的“双向”理解，进而有望进一步提升推理性能。

此外，研究还展示了RE2方法相较于传统方法的优势：

1. 模仿了人类解决问题的策略；
2. 重复提问允许LLMs分配更多的计算资源给输入编码；
3. 强调了输入阶段的理解，使其与大多数关注输出阶段的思维激发提示方法兼容。



### 最佳实践

1. 保持单一职责:每个Advisor应专注于一项特定任务

2. 注意执行顺序:合理设置 getOrder()值确保 Advisor按正确顺序执行

3. 同时支持流式和非流式:尽可能同时实现两种接口以提高灵活性

4. 高效处理请求:避免在Advisor中执行耗时操作

5. 测试边界情况:确保Advisor能够优雅处理异常和边界情况

6. 对于需要更复杂处理的流式场景,可以使用Reactor的操作符
7. 可以使用aviseContext在Advisor链中共享状态

```java
// 更新上下文
advisedRequest = advisedRequest.updateContext(context -> {
    context.put("key", "value");
    return context;
});

// 读取上下文
Object value = advisedResponse.adviseContext().get("key");
```

### 结构化输出

https://docs.spring.io/spring-ai/reference/api/structured-output-converter.html

LLM 生成结构化输出的能力对于依赖可靠解析输出值的下游应用程序非常重要。开发人员希望将 AI 模型的结果快速转换为数据类型，例如 JSON、XML 或 Java 类，这些数据类型可以传递给其他应用程序函数和方法。

![Structured Output Converter Architecture](https://docs.spring.io/spring-ai/reference/_images/structured-output-architecture.jpg)



- Bean Output Converter Bean 输出转换器：转换AI输出为自定义java类
- Map Output Converter  贴图输出转换器：转为数字列表的map
- List Output Converter  列出输出转换器：转换为List



```java
    // java14新特性
    record LoveReport(String title, List<String> suggestions) {

    }

    public LoveReport doChatWithReport(String message, String chatId) {
        LoveReport loveReport = chatClient
                .prompt()
                .user(message)
                .system(SYSTEM_PROMPT + "每次对话都要生成恋爱结果，标题为{用户名}，内容为下拉列表")
                .advisors(spec -> spec.param(CHAT_MEMORY_CONVERSATION_ID_KEY, chatId)
                        .param(CHAT_MEMORY_RETRIEVE_SIZE_KEY, 10))
                .call()
                .entity(LoveReport.class);
        return loveReport;
    }
```

在上下文调试中，可以看到里面已经设置好ai响应格式

![image-20250508134709448](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250508134709448.png)

### 对话持久性

[ChatMemory](https://docs.spring.io/spring-ai/reference/api/chatclient.html#_chat_memory)

建议自己实现。

本文以存储消息到本地文件为例。我们在保存消息时,要将消息从Message对象转为文件内的文本;读取消息时,要将文件内的文本转换为Message对象。也就是对象的序列化和反序列化。

我们本能地会想到通过JSON进行序列化,但实际操作中,我们发现这并不容易。原因是:

1.要持久化的Message是一个接口,有很多种不同的子类实现(比如UserMessage、SystemMessage等)
2.每种子类所拥有的字段都不一样,结构不统一
3.子类没有无参构造函数,而且没有实现Serializable 序列化接口

![image-20250508144527613](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250508144527613.png)

1. 引入kryo依赖

```xml
<dependency>
    <groupId>com.esotericsoftware</groupId>
    <artifactId>kryo</artifactId>
    <version>5.6.2</version>
</dependency>
```

2. 自定义memory接口存储对话到本地

```java
package com.flycode.flyaiagent.Memory;

import com.esotericsoftware.kryo.Kryo;
import com.esotericsoftware.kryo.io.Input;
import com.esotericsoftware.kryo.io.Output;
import org.objenesis.strategy.StdInstantiatorStrategy;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.Message;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class LocalMemory implements ChatMemory {

    private final String BASE_DIR;

    private static final Kryo kryo = new Kryo();

    static {
        kryo.setRegistrationRequired(false);
        kryo.setInstantiatorStrategy(new StdInstantiatorStrategy());
    }

    // 文件保存指定位置
    public LocalMemory(String baseDir) {
        this.BASE_DIR = baseDir;
        File file = new File(baseDir);
        if (!file.exists()) {
            file.mkdirs();
        }
    }


    @Override
    public void add(String conversationId, List<Message> messages) {
        List<Message> conversation = getOrCreateConversation(conversationId);
        conversation.addAll(messages);
        saveConversationFile(conversationId, conversation);
    }

    @Override
    public List<Message> get(String conversationId, int lastN) {
        List<Message> messageList = getOrCreateConversation(conversationId);
        return messageList.stream().skip(Math.max(0, messageList.size() - lastN)).collect(Collectors.toList());
    }

    @Override
    public void clear(String conversationId) {
        File file = getConversationFile(conversationId);
        if (file.exists()) {
            file.delete();
        }
    }

    /**
     * 保存消息到指定文件
     *
     * @param conversationId
     * @param messages
     */
    private void saveConversationFile(String conversationId, List<Message> messages) {
        File file = getConversationFile(conversationId);
        try (Output output = new Output(new FileOutputStream(file))) {
            kryo.writeObject(output, messages);
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 获取指定会话的文件
     *
     * @param conversationId
     * @return
     */
    public List<Message> getOrCreateConversation(String conversationId) {
        File file = getConversationFile(conversationId);
        List<Message> messages = new ArrayList<>();
        if (file.exists()) {
            try (Input input = new Input(new FileInputStream(file))) {
                messages = kryo.readObject(input, ArrayList.class);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return messages;
    }

    /**
     * 获取指定会话的文件路径
     *
     * @param conversationId
     * @return
     */
    private File getConversationFile(String conversationId) {
        return new File(BASE_DIR , conversationId+".kyro");
    }
}
```



### PromptTemplate模板

[PromptTemplate](https://docs.spring.io/spring-ai/reference/api/prompt.html#_prompttemplate)

类似占位符，可以更加结构化管理ai提示词

```java
// 定义带有变量的模板
String template = "你好，{name}。今天是{day}，天气{weather}。";

// 创建模板对象
PromptTemplate promptTemplate = new PromptTemplate(template);

// 准备变量映射
Map<String, Object> variables = new HashMap<>();
variables.put("name", "xx");
variables.put("day", "xx");
variables.put("weather", "xx");

// 生成最终提示文本
String prompt = promptTemplate.render(variables);
// 结果: "你好，x。今天是xx，天气xx。"
```

![image-20250508151600926](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250508151600926.png)

PromptTemplate底层使用了OSS StringTemplate 引擎,这是一个强大的模板引擎,专注于文本生成。在Spring Al中,P
romptTemplate 类实现了以下接口:

```java
public class PromptTemplate implements PromptTemplateActions, PromptTemplateMessageActions {

}
```

这些接口提供了不同类型的模板操作功能,使其既能生成普通文本,也能生成结构化的消息。

有如下实现接口：

![image-20250508152051103](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250508152051103.png)

主要优点：可以从本地读取模板

```java
// 从类路径资源加载系统提示模板
@Value("classpath:/prompts/system-message.st")
private Resource systemResource;

// 直接使用资源创建模板
SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(systemResource);
```



### 多模态

能够同时理解和处理图像、文本、视频等结构数据。

[Spring多模态](https://docs.spring.io/spring-ai/reference/api/multimodality.html)

[阿里多模态](https://help.aliyun.com/zh/model-studio/use-qwen-by-calling-api#d0e30636ad3s3)