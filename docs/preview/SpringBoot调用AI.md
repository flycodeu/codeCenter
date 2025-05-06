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

## SDK接入
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



## Http接入

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



## Spring AI

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



## LangChain4j

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



## 调用方式对比



| 接入方式    | 优点                                                         | 缺点                                                   | 适用场景                                            |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------ | --------------------------------------------------- |
| SDK接入     | - 类型安全<br>- 编译时检查<br>- 完善的错误处理<br>- 详细文档<br>- 性能优化好 | - 依赖特定版本<br>- 增加项目体积<br>- 语言限制         | - 需深度集成<br>- 单一模型提供商<br>- 高性能要求    |
| HTTP接入    | - 无语言限制<br>- 不增加额外依赖<br>- 灵活性高               | - 手动处理错误<br>- 序列化/反序列化复杂<br>- 代码冗长  | - SDK不支持的语言<br>- 简单原型验证<br>- 临时性集成 |
| Spring AI   | - 统一抽象接口<br>- 易切换模型提供商<br>- 与Spring生态融合<br>- 提供高级功能 | - 增加抽象层<br>- 可能不支持特定特性<br>- 版本快速迭代 | - Spring应用<br>- 支持多种模型<br>- 高级AI功能需求  |
| LangChain4j | - 完整AI工具链<br>- 支持复杂工作流<br>- 丰富组件和工具<br>- 适合构建AI代理 | - 学习曲线陡峭<br>- 文档较少<br>- 抽象可能影响性能     | - 复杂AI应用<br>- 需要链式操作<br>- RAG应用开发     |

推荐使用Spring AI，简单易用