---
title: LangChain4j实战
createTime: 2025/08/04 13:58:45
permalink: /article/zuw6obif/
tags:
  - LangChain4j
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/639a06e3e1aef9dc0eead20503100577.jpg
---

## 官方文档
[LangChain4j接入OpenAI](https://docs.langchain4j.dev/integrations/language-models/open-ai/#spring-boot)

[SpringBoot集成](https://docs.langchain4j.dev/tutorials/spring-boot-integration)

## 引入依赖
```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j</artifactId>
    <version>1.1.0</version>
</dependency>
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai-spring-boot-starter</artifactId>
    <version>1.1.0-beta7</version>
</dependency>
```

## 配置yml
包含api-key、接口地址、模型名称、前置拦截日志、后置拦截日志，详细参数可以参考官网示例。
```yml
langchain4j:
  open-ai:
    chat-model:
      api-key: xxx
      base-url: https://api.deepseek.com
      model-name: deepseek-chat
      log-requests: true
      log-responses: true
```

## 声明式AI服务
[声明式AI服务](https://docs.langchain4j.dev/tutorials/spring-boot-integration)

创建AI服务接口，定义读取的提示词指定位置
```java
/**
 * AI服务接口
 */
interface AiCodeGenerateService {

    /**
     * 从指定位置文件中获取系统提示语，生成单个HTML代码片段
     * @param userMessage
     * @return
     */
    @SystemMessage(fromResource = "prompt/codegen-html-system-prompt.txt")
    String generateHtmlCode(String userMessage);

    /**
     * 从指定位置文件中获取系统提示语，生成多个HTML代码片段
     * @param userMessage
     * @return
     */
    @SystemMessage(fromResource = "prompt/codegen-muti-html-system-prompt.txt")
    String generateMutlHtmlCode(String userMessage);
}
```
创建工厂类，来创建AIService服务。
```java
@Configuration
public class AiCodeGeneratorServiceFactory {
    @Resource
    private ChatModel chatModel;
    @Bean
    public AiCodeGenerateService aiCodeGeneratorService() {
        return AiServices.create(AiCodeGenerateService.class, chatModel);
    }
}
```

测试
```java
@SpringBootTest
@ActiveProfiles("local")
@Slf4j
class FlyGeniusApplicationTests {
    @Resource
    private AiCodeGenerateService aiCodeGenerateService;
    @Test
    void contextLoads() {
        String generateHtmlCode = aiCodeGenerateService.generateHtmlCode("给我生成一篇博客");
        log.info(generateHtmlCode);
        String generateMutlHtmlCode = aiCodeGenerateService.generateMutlHtmlCode("给我生成一篇博客");
        log.info(generateMutlHtmlCode);
    }
}
```

通过前置拦截，我们可以看到AI请求对应的格式，包含请求地址、请求体、角色等

```curl
25-08-04.14:25:34.959 [main            ] INFO  LoggingHttpClient      - HTTP request:
- method: POST
- url: https://api.deepseek.com/chat/completions
- headers: [Authorization: Beare...33], [User-Agent: langchain4j-openai], [Content-Type: application/json]
- body: {
  "model" : "deepseek-chat",
  "messages" : [ {
    "role" : "system",
    "content" : "你是一位资深的 Web 前端开发专家，精通 HTML、CSS 和原生 JavaScript。你擅长构建响应式、美观且代码整洁的单页面网站。\r\n\r\n你的任务是根据用户提供的网站描述，生成一个完整、独立的单页面网站。你需要一步步思考，并最终将所有代码整合到一个 HTML 文件中。\r\n\r\n约束:\r\n1. 技术栈: 只能使用 HTML、CSS 和原生 JavaScript。\r\n2. 禁止外部依赖: 绝对不允许使用任何外部 CSS 框架、JS 库或字体库。所有功能必须用原生代码实现。\r\n3. 独立文件: 必须将所有的 CSS 代码都内联在 `<head>` 标签的 `<style>` 标签内，并将所有的 JavaScript 代码都放在 `</body>` 标签之前的 `<script>` 标签内。最终只输出一个 `.html` 文件，不包含任何外部文件引用。\r\n4. 响应式设计: 网站必须是响应式的，能够在桌面和移动设备上良好显示。请优先使用 Flexbox 或 Grid 进行布局。\r\n5. 内容填充: 如果用户描述中缺少具体文本或图片，请使用有意义的占位符。例如，文本可以使用 Lorem Ipsum，图片可以使用 https://picsum.photos 的服务 (例如 `<img src=\"https://picsum.photos/800/600\" alt=\"Placeholder Image\">`)。\r\n6. 代码质量: 代码必须结构清晰、有适当的注释，易于阅读和维护。\r\n7. 交互性: 如果用户描述了交互功能 (如 Tab 切换、图片轮播、表单提交提示等)，请使用原生 JavaScript 来实现。\r\n8. 安全性: 不要包含任何服务器端代码或逻辑。所有功能都是纯客户端的。\r\n9. 输出格式: 你的最终输出必须包含 HTML 代码块，可以在代码块之外添加解释、标题或总结性文字。格式如下：\r\n\r\n```html\r\n... HTML 代码 ..."
  }, {
    "role" : "user",
    "content" : "给我生成一篇博客"
  } ],
  "stream" : false
}
```

![image-20250804142905962](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250804142905962.png)



## 结构化输出

AI响应的格式有点乱，我们可以使用[结构化输出](https://docs.langchain4j.dev/tutorials/structured-outputs)来规范AI响应格式，返回指定JSON。示例如下：

可以通过Description描述来指定对应的字段给AI

```java
@Description("a person")
record Person(@Description("person's first and last name, for example: John Doe") String name,
              @Description("person's age, for example: 42") int age,
              @Description("person's height in meters, for example: 1.78") double height,
              @Description("is person married or not, for example: false") boolean married) {
}
```

我们可以根据需要的格式，编写实体类

```java
@Description("生成 HTML 代码文件的结果")
@Data
public class HtmlCodeResult {

    @Description("HTML代码")
    private String htmlCode;

    @Description("生成代码的描述")
    private String description;
}
```

```java
@Description("生成多个代码文件的结果")
@Data
public class MultiFileCodeResult {

    @Description("HTML代码")
    private String htmlCode;

    @Description("CSS代码")
    private String cssCode;

    @Description("JS代码")
    private String jsCode;

    @Description("生成代码的描述")
    private String description;
}

```

修改接口返回指定格式数据

```java
/**
 * AI服务接口
 */
public interface AiCodeGenerateService {

    /**
     * 从指定位置文件中获取系统提示语，生成单个HTML代码片段
     * @param userMessage
     * @return
     */
    @SystemMessage(fromResource = "prompt/codegen-html-system-prompt.txt")
    HtmlCodeResult generateHtmlCode(String userMessage);

    /**
     * 从指定位置文件中获取系统提示语，生成多个HTML代码片段
     * @param userMessage
     * @return
     */
    @SystemMessage(fromResource = "prompt/codegen-muti-html-system-prompt.txt")
    MultiFileCodeResult generateMutlHtmlCode(String userMessage);
}
```

测试

```java
@SpringBootTest
@ActiveProfiles("local")
@Slf4j
class FlyGeniusApplicationTests {
    @Resource
    private AiCodeGenerateService aiCodeGenerateService;
    @Test
    void contextLoads() {
        HtmlCodeResult generateHtmlCode = aiCodeGenerateService.generateHtmlCode("给我生成一篇博客");
        log.info("生成代码的描述：{}", generateHtmlCode.getDescription());
        log.info(generateHtmlCode.getHtmlCode());
        MultiFileCodeResult generatedMutlHtmlCode = aiCodeGenerateService.generateMutlHtmlCode("给我生成一篇博客");
        log.info("生成代码的描述：{}", generatedMutlHtmlCode.getDescription());
        log.info(generatedMutlHtmlCode.getHtmlCode());
        log.info(generatedMutlHtmlCode.getCssCode());
        log.info(generatedMutlHtmlCode.getJsCode());
    }
```

输出，可以看到实际上只是将我们的实体类注释转换到预设中。

```
25-08-04.14:40:08.112 [main            ] INFO  LoggingHttpClient      - HTTP request:
- method: POST
- url: https://api.deepseek.com/chat/completions
- headers: [Authorization: Beare...33], [User-Agent: langchain4j-openai], [Content-Type: application/json]
- body: {
  "model" : "deepseek-chat",
  "messages" : [ {
    "role" : "system",
    "content" : "你是一位资深的 Web 前端开发专家，精通 HTML、CSS 和原生 JavaScript。你擅长构建响应式、美观且代码整洁的单页面网站。\r\n\r\n你的任务是根据用户提供的网站描述，生成一个完整、独立的单页面网站。你需要一步步思考，并最终将所有代码整合到一个 HTML 文件中。\r\n\r\n约束:\r\n1. 技术栈: 只能使用 HTML、CSS 和原生 JavaScript。\r\n2. 禁止外部依赖: 绝对不允许使用任何外部 CSS 框架、JS 库或字体库。所有功能必须用原生代码实现。\r\n3. 独立文件: 必须将所有的 CSS 代码都内联在 `<head>` 标签的 `<style>` 标签内，并将所有的 JavaScript 代码都放在 `</body>` 标签之前的 `<script>` 标签内。最终只输出一个 `.html` 文件，不包含任何外部文件引用。\r\n4. 响应式设计: 网站必须是响应式的，能够在桌面和移动设备上良好显示。请优先使用 Flexbox 或 Grid 进行布局。\r\n5. 内容填充: 如果用户描述中缺少具体文本或图片，请使用有意义的占位符。例如，文本可以使用 Lorem Ipsum，图片可以使用 https://picsum.photos 的服务 (例如 `<img src=\"https://picsum.photos/800/600\" alt=\"Placeholder Image\">`)。\r\n6. 代码质量: 代码必须结构清晰、有适当的注释，易于阅读和维护。\r\n7. 交互性: 如果用户描述了交互功能 (如 Tab 切换、图片轮播、表单提交提示等)，请使用原生 JavaScript 来实现。\r\n8. 安全性: 不要包含任何服务器端代码或逻辑。所有功能都是纯客户端的。\r\n9. 输出格式: 你的最终输出必须包含 HTML 代码块，可以在代码块之外添加解释、标题或总结性文字。格式如下：\r\n\r\n```html\r\n... HTML 代码 ..."
  }, {
    "role" : "user",
    "content" : "给我生成一篇博客\nYou must answer strictly in the following JSON format: {\n\"htmlCode\": (HTML代码; type: string),\n\"description\": (生成代码的描述; type: string)\n}"
  } ],
  "stream" : false
}
```

## 门面模式-生成html代码

**为了统一管理生成和保存的逻辑,决定使用门面模式 这一设计模式。**

**门面模式通过提供一个统一的高层接口来隐藏子系统的复杂性,让客户端只需要与这个简化的接口交互,而不用了解内部
的复杂实现细节。**

编写通用枚举类用于区分单个文件和多个文件。

```java
/**
 * 代码生成类型枚举
 *
 * @author flycode
 */
@Getter
public enum CodeGenTypeEnum {
    HTML("原生Html代码", "html"),
    MULTI_FILE("多个文件代码", "multi-file");

    private String text;

    private String value;

    CodeGenTypeEnum(String text, String value) {
        this.text = text;
        this.value = value;
    }

    public static CodeGenTypeEnum getEnumByValue(String value) {
        if (value == null) {
            return null;
        }
        for (CodeGenTypeEnum item : CodeGenTypeEnum.values()) {
            if (item.value.equals(value)) {
                return item;
            }
        }
        return null;
    }
}
```

生成和保存代码到本地

```java
/**
 * 文件根据html生成对应文件
 *
 * @author flycode
 */
public class CodeFileSaver {
    //  保存文件的目录
    public static final String FILE_SAVE_DIR = System.getProperty("user.dir") + "/tmp/ai_code_result";

    /**
     * 根据生成类型生成文件唯一标识，使用雪花算法
     *
     * @param bizType 代码类型
     * @return 返回目录
     */
    public static String buildUniqueFileDir(String bizType) {
        String uniqueDirName = StrUtil.format("{}_{}", bizType, IdUtil.getSnowflakeNextIdStr());
        String dirPath = FILE_SAVE_DIR + File.separator + uniqueDirName;
        FileUtil.mkdir(dirPath);
        return dirPath;
    }

    /**
     * 生成文件
     *
     * @param fileName 文件名
     * @param dirPath  目录
     * @param content  内容
     * @return 文件
     */
    public static File writeContentToFile(String fileName, String dirPath, String content) {
        String filePath = dirPath + File.separator + fileName;
        return FileUtil.writeString(content, filePath, StandardCharsets.UTF_8);
    }


    /**
     * 生成单个html文件
     *
     * @param result html代码
     * @return 文件
     */
    public static File saveHtmlCode(HtmlCodeResult result) {
        String dirPath = buildUniqueFileDir(CodeGenTypeEnum.HTML.getValue());
        writeContentToFile("index.html", dirPath, result.getHtmlCode());
        return new File(dirPath);
    }

    /**
     * 生成多个文件
     *
     * @param result 多个文件代码
     * @return 文件
     */
    public static File saveMultiFileCode(MultiFileCodeResult result) {
        String dirPath = buildUniqueFileDir(CodeGenTypeEnum.MULTI_FILE.getValue());
        writeContentToFile("index.html", dirPath, result.getHtmlCode());
        writeContentToFile("style.css", dirPath, result.getCssCode());
        writeContentToFile("script.js", dirPath, result.getJsCode());
        return new File(dirPath);
    }
}

```

门面模式生成指定代码到本地

```java
@Service
public class AiCodeGeneratorFacade {
    @Resource
    private AiCodeGenerateService aiCodeGenerateService;

    public File generatorAndSaveFile(String userMessage, CodeGenTypeEnum codeGenType) {
        if (codeGenType == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        return switch (codeGenType) {
            case HTML -> generateHtmlCode(userMessage);
            case MULTI_FILE -> generateMutlHtmlCode(userMessage);
            default -> throw new BusinessException(ErrorCode.PARAMS_ERROR, "不支持的类型");
        };
    }

    /**
     * 生成多个文件代码
     *
     * @param userMessage
     * @return
     */
    private File generateMutlHtmlCode(String userMessage) {
        MultiFileCodeResult generatedMutlHtmlCode = aiCodeGenerateService.generateMutlHtmlCode(userMessage);
        return CodeFileSaver.saveMultiFileCode(generatedMutlHtmlCode);
    }

    /**
     * 生成 HTML 代码
     *
     * @param userMessage
     * @return
     */
    private File generateHtmlCode(String userMessage) {
        HtmlCodeResult generateHtmlCode = aiCodeGenerateService.generateHtmlCode(userMessage);
        return CodeFileSaver.saveHtmlCode(generateHtmlCode);
    }
}

```

![image-20250804154626319](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250804154626319.png)

## SSE
[Stream](https://docs.langchain4j.dev/tutorials/ai-services#streaming)

[Response-stream](https://docs.langchain4j.dev/tutorials/response-streaming/)

目前有两种流式输出方式，但是流式输出不支持结构化输出，但是我们可以在流式输出的过程中，拼接结果。

### Langchain4j+Reactor

引入依赖

```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-reactor</artifactId>
    <version>1.2.0-beta8</version>
</dependency>
```

```java
interface Assistant {
  Flux<String> chat(String message);
}
```

![image-20250805092223616](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250805092223616.png)

### TokenStream

```java
interface Assistant {
    TokenStream chat(String message);
}

StreamingChatModel model = OpenAiStreamingChatModel.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .modelName(GPT_4_O_MINI)
    .build();

Assistant assistant = AiServices.create(Assistant.class, model);

TokenStream tokenStream = assistant.chat("Tell me a joke");

tokenStream
    .onPartialResponse((String partialResponse) -> System.out.println(partialResponse))
    .onPartialThinking((PartialThinking partialThinking) -> System.out.println(partialThinking))
    .onRetrieved((List<Content> contents) -> System.out.println(contents))
    .onIntermediateResponse((ChatResponse intermediateResponse) -> System.out.println(intermediateResponse))
    .onToolExecuted((ToolExecution toolExecution) -> System.out.println(toolExecution))
    .onCompleteResponse((ChatResponse response) -> System.out.println(response))
    .onError((Throwable error) -> error.printStackTrace())
    .start();
```

### Reactor改造流式输出

配置yml

```yml
langchain4j:
  open-ai:
    streaming-chat-model:
      base-url: https://api.deepseek.com
      api-key: <Your API Key>
      model-name: deepseek-chat
      max-tokens: 8192
      log-requests: true
      log-responses: true
```

更改AiCodeGeneratorServiceFactory为流式输出

```java
@Configuration
public class AiCodeGeneratorServiceFactory {

    @Resource
    private ChatModel chatModel;

    @Resource
    private StreamingChatModel streamingChatModel;

    /**
     * 流式输出
     *
     * @return
     */
    @Bean
    public AiCodeGenerateService aiCodeGeneratorService() {
        return AiServices.builder(AiCodeGenerateService.class)
                .chatModel(chatModel)
                .streamingChatModel(streamingChatModel)
                .build();
    }
}
```

修改AiCodeGenerateService接口，增加流式输出

```java

/**
 * 从指定位置文件中获取系统提示语，生成单个HTML代码片段，流式输出
 * @param userMessage
 * @return
 */
@SystemMessage(fromResource = "prompt/codegen-html-system-prompt.txt")
Flux<String> generateHtmlCodeStream(String userMessage);

/**
 * 从指定位置文件中获取系统提示语，生成多个HTML代码片段,流式输出
 * @param userMessage
 * @return
 */
@SystemMessage(fromResource = "prompt/codegen-muti-html-system-prompt.txt")
Flux<String> generateMutlHtmlCodeStream(String userMessage);
```

解析代码，因为AI返回的是字符串数据，我们需要进行切割，将描述信息和代码片段进行分隔。直接让AI生成就行。

```java
/**
 * 代码解析器
 * 提供静态方法解析不同类型的代码内容
 *
 * @author flycode
 */
public class CodeParser {

    private static final Pattern HTML_CODE_PATTERN = Pattern.compile("```html\\s*\\n([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);
    private static final Pattern CSS_CODE_PATTERN = Pattern.compile("```css\\s*\\n([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);
    private static final Pattern JS_CODE_PATTERN = Pattern.compile("```(?:js|javascript)\\s*\\n([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);

    /**
     * 解析 HTML 单文件代码
     */
    public static HtmlCodeResult parseHtmlCode(String codeContent) {
        HtmlCodeResult result = new HtmlCodeResult();
        // 提取 HTML 代码
        String htmlCode = extractHtmlCode(codeContent);
        if (htmlCode != null && !htmlCode.trim().isEmpty()) {
            result.setHtmlCode(htmlCode.trim());
        } else {
            // 如果没有找到代码块，将整个内容作为HTML
            result.setHtmlCode(codeContent.trim());
        }
        return result;
    }

    /**
     * 解析多文件代码（HTML + CSS + JS）
     */
    public static MultiFileCodeResult parseMultiFileCode(String codeContent) {
        MultiFileCodeResult result = new MultiFileCodeResult();
        // 提取各类代码
        String htmlCode = extractCodeByPattern(codeContent, HTML_CODE_PATTERN);
        String cssCode = extractCodeByPattern(codeContent, CSS_CODE_PATTERN);
        String jsCode = extractCodeByPattern(codeContent, JS_CODE_PATTERN);
        // 设置HTML代码
        if (htmlCode != null && !htmlCode.trim().isEmpty()) {
            result.setHtmlCode(htmlCode.trim());
        }
        // 设置CSS代码
        if (cssCode != null && !cssCode.trim().isEmpty()) {
            result.setCssCode(cssCode.trim());
        }
        // 设置JS代码
        if (jsCode != null && !jsCode.trim().isEmpty()) {
            result.setJsCode(jsCode.trim());
        }
        return result;
    }

    /**
     * 提取HTML代码内容
     *
     * @param content 原始内容
     * @return HTML代码
     */
    private static String extractHtmlCode(String content) {
        Matcher matcher = HTML_CODE_PATTERN.matcher(content);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    /**
     * 根据正则模式提取代码
     *
     * @param content 原始内容
     * @param pattern 正则模式
     * @return 提取的代码
     */
    private static String extractCodeByPattern(String content, Pattern pattern) {
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}

```

在之前的门面模式AiCodeGeneratorFacade中，修改流式输出

```java
	    @Resource
    private AiCodeGenerateService aiCodeGenerateService;

    /**
     * 生成多个文件代码，完成流式输出后，保存到本地
     *
     * @param userMessage
     * @return
     */
    private Flux<String> generateMutlHtmlCodeStream(String userMessage) {
        Flux<String> result = aiCodeGenerateService.generateMutlHtmlCodeStream(userMessage);
        StringBuilder codeBuilder = new StringBuilder();
        return result.doOnNext(chunk -> {
                    codeBuilder.append(chunk);
                })
                .doOnComplete(() -> {
                    try {
                        String res = codeBuilder.toString();
                        MultiFileCodeResult multiFileCodeResult = CodeParser.parseMultiFileCode(res);
                        File file = CodeFileSaver.saveMultiFileCode(multiFileCodeResult);
                        log.info("生成代码成功：{}", file.getAbsolutePath());
                    } catch (Exception e) {
                        log.error("生成代码失败", e);
                    }
                });
    }

    /**
     * 生成 HTML 代码
     *
     * @param userMessage
     * @return
     */
    private Flux<String> generateHtmlCodeStream(String userMessage) {
        Flux<String> result = aiCodeGenerateService.generateHtmlCodeStream(userMessage);
        StringBuilder codeBuilder = new StringBuilder();
        return result.doOnNext(chunk -> {
            codeBuilder.append(chunk);
        }).doOnComplete(() -> {
                    try {
                        String res = codeBuilder.toString();
                        HtmlCodeResult htmlCodeResult = CodeParser.parseHtmlCode(res);
                        File file = CodeFileSaver.saveHtmlCode(htmlCodeResult);
                        log.info("生成代码成功：{}", file.getAbsolutePath());
                    } catch (Exception e) {
                        log.error("生成代码失败", e);
                    }
                }
        );
    }

    /**
     * 流式输出和保存文件
     *
     * @param userMessage
     * @param codeGenType
     * @return
     */
    public Flux<String> generatorAndSaveFileStream(String userMessage, CodeGenTypeEnum codeGenType) {
        if (codeGenType == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        return switch (codeGenType) {
            case HTML -> generateHtmlCodeStream(userMessage);
            case MULTI_FILE -> generateMutlHtmlCodeStream(userMessage);
            default -> throw new BusinessException(ErrorCode.PARAMS_ERROR, "不支持的类型");
        };
    }
```

测试

```java
    @Test
    public void testSaveFileStream() {
        String userMessage = "请生成登录界面，代码简短，需要20行内";
        Flux<String> fileStream = aiCodeGeneratorFacade.generatorAndSaveFileStream(userMessage, CodeGenTypeEnum.MULTI_FILE);
        List<String> block = fileStream.collectList().block();
        log.info("fileStream: {}", block);
    }
```

![image-20250805095258273](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250805095258273.png)



## 设计模式

### 策略模式

定义了一系列算法或行为，并将每个算法封装起来，使它们可以相互替换。

![image-20250805105759690](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250805105759690.png)



### 模板设计模式

在父类中定义了操作的流程标准，具体实现步骤让子类实现。

![image-20250805105931853](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250805105931853.png)

### 执行器模式

提供统一的执行入口来协调处理不同的模板和策略的调用，适合处理参数不同，但是业务相同的场景。

![image-20250805110054937](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250805110054937.png)

### 混合模式

执行器模式：提供统一的执行入口，根据不同的类型执行不同的操作。

策略模式：每种模式对应的解析策略作为一个单独的类维护。

模板方法生成：抽象类定一个算法的骨架，具体实现在子类中

![image-20250805110323610](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250805110323610.png)

