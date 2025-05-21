---
title: SpringAI Tools
createTime: 2025/05/20 14:36:27
permalink: /article/wb3rh8gx/
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250521154058.jpg
---



## [Tool Calling](https://docs.spring.io/spring-ai/reference/api/tools.html)

执行流程

![image-20250520150735912](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250520150735912.png)



Methods模式：使用@Tools以及@ToolParam绑定工具

```java
public class WeatherTools {
    @Tool(description = "Get current weather by city name")
    public String getWeather(@ToolParam(description = "The city name") String cityName) {
        return "Current weather in " + cityName + ": sunny,30℃";
    }
}

// 调用方式
 ChatClient.create(chatModel).prompt("获取北京的天气信息").tools(new WeatherTools()).call();
```

Functions模式：使用@Bean注解

```java
@Configuration
public class ToolConfig {
    @Bean
    @Description("Get current weather for a location")
    public Function<WeatherRequest, WeatherResponse> weatherFunction() {
        return request -> new WeatherResponse("Weather in " + request.getCity() + ": Sunny, 25°C");
    }
}

// 使用方式
ChatClient.create(chatModel)
    .prompt("What's the weather in Beijing?")
    .functions("weatherFunction")
    .call();
```

### 定义工具

#### 注解式

使用@Tools

```java
public class WeatherTools {
    @Tool(description = "Get current weather by city name")
    public String getWeather(@ToolParam(description = "The city name") String cityName) {
        return "Current weather in " + cityName + ": sunny,30℃";
    }
}
```

#### 编程式

首先需要定义好工具类

```java
class WeatherTools {
    @Tool(description = "获取指定城市的当前天气情况")
    String getWeather(@ToolParam(description = "城市名称") String city) {
        return "北京今天晴朗，气温30°C";
    }
}
```

将工具类转换为ToolCallBack工具定义类

```java
Method method = ReflectionUtils.findMethod(WeatherTools.class, "getWeather", String.class);
ToolCallback toolCallback = MethodToolCallback.builder()
    .toolDefinition(ToolDefinition.builder(method)
            .description("获取指定城市的当前天气情况")
            .build())
    .toolMethod(method)
    .toolObject(new WeatherTools())
    .build();
```

### 使用工具

1. 按需使用

```java
String response = ChatClient.create(chatModel)
    .prompt("北京今天天气怎么样？")
    .tools(new WeatherTools())  // 在这次对话中提供天气工具
    .call()
    .content();
```

2. 全局使用

```java
ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultTools(new WeatherTools(), new TimeTools())  // 注册默认工具
    .build();
```

3. 底层调用，绑定ChatModel

```java
// 先得到工具对象
ToolCallback[] weatherTools = ToolCallbacks.from(new WeatherTools());
// 绑定工具到对话
ChatOptions chatOptions = ToolCallingChatOptions.builder()
    .toolCallbacks(weatherTools)
    .build();
// 构造 Prompt 时指定对话选项
Prompt prompt = new Prompt("北京今天天气怎么样？", chatOptions);
chatModel.call(prompt);
```

4. 动态解析

ToolCallbackResolver使用适合工具需要根据上下文动态确定的场景





### 工具生态

[Spring AI Alibaba](https://java2ai.com/docs/1.0.0-M6.1/integrations/tools/)但是里面只提供了一个，可以再官方代码仓库查看其它工具[官方仓库地址](https://github.com/alibaba/spring-ai-alibaba/tree/main/community/tool-calls)

## 工具开发

### 文件操作

```java
/**
 * 文件读写工具类
 */
public class FileOperationTool {
    private final String FILE_DIR = FileConstant.tempDir + "/file";

    @Tool(description = "Read content from a file")
    public String readFile(@ToolParam(description = "Name of the file to read") String fileName) {
        String filePath = FILE_DIR + "/" + fileName;
        try {
            return FileUtil.readUtf8String(filePath);
        } catch (Exception e) {
            return "Error reading file: " + e.getMessage();
        }
    }

    @Tool(description = "Write content to a file")
    public String writeFile(@ToolParam(description = "Name of the file to write") String fileName, @ToolParam(description = "the content to write to the file") String content) {
        String filePath = FILE_DIR + "/" + fileName;
        try {
            FileUtil.mkdir(FILE_DIR);
            FileUtil.writeUtf8String(content, filePath);
            return "File written successfully: " + filePath;
        } catch (Exception e) {
            return "Error writing file: " + e.getMessage();
        }
    }
}
```

测试

```java
@SpringBootTest
@ActiveProfiles("local")
public class ToolsTest {

    @Test
    public void writeFile() {
        FileOperationTool tool = new FileOperationTool();
        String fileName = "智能体AI.txt";
        String content = " 我是测试文件内容";
        String res = tool.writeFile(fileName, content);
        System.out.println(res);
    }

    @Test

    public void readFile(){
        FileOperationTool tool = new FileOperationTool();
        String fileName = "智能体AI.txt";
        String s = tool.readFile(fileName);
        System.out.println(s);
    }
}
```



### 联网搜索

可以使用[Search API](https://www.searchapi.io/baidu)等专业网页搜索API实现多个网站获取内容，也可以通过爬虫等方式爬取搜索引擎等相关信息。

![image-20250521104647479](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250521104647479.png)

```java

/**
 * 联网搜索
 */
public class WebOperationTool {
    public static final String WEB_URL = "https://www.searchapi.io/api/v1/search";
    private final String apiKey;

    public WebOperationTool(String apiKey) {
        this.apiKey = apiKey;
    }

    @Tool(description = "Search for information from Baidu Search Engine")
    public String getWebContent(@ToolParam(description = "Search key word") String query) {
        // 1. 构造请求参数
        Map<String, Object> param = new HashMap<>();
        param.put("engine", "baidu");
        param.put("q", query);
        param.put("api_key", apiKey);
        // 2. 发送请求
        try {
            String response = HttpUtil.get(WEB_URL, param);
            JSONObject jsonObject = JSONUtil.parseObj(response);
            JSONArray organicResults = jsonObject.getJSONArray("organic_results");
            // 前5条
            List<Object> objects = organicResults.subList(0, 5);
            String result = objects.stream().map(obj -> {
                JSONObject jsonObject1 = (JSONObject) obj;
                return jsonObject1.toString();
            }).collect(Collectors.joining(","));
            return result;
        } catch (Exception e) {
            return "Error search baidu: " + e.getMessage();
        }
    }
}
```

测试调用

```java

    @Value("${search.api-key}")
    private String apikey;

    @Test
    public void searchOnLine() {
        WebOperationTool tool = new WebOperationTool(apikey);
        String content = tool.getWebContent("大熊猫");
        System.out.println(content);
    }
```

![image-20250521104518472](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250521104518472.png)

后续只需要过滤出符合我们需求的数据即可。

### 网页抓取

可以使用jsoup抓取网页。

1. 引入依赖

```xml
<dependency>
    <groupId>org.jsoup</groupId>
    <artifactId>jsoup</artifactId>
    <version>1.19.1</version>
</dependency>
```

2. 简单获取网页html内容

```java
/**
 * 网页抓取工具类
 */
public class WebScrapingTool {

    @Tool(description = "Scrape the content of  a web page")
    public String scrapeWebPage(@ToolParam(description = "url of the web to scrape") String url) {
        try {
            Document document = Jsoup.connect(url).get();
            return document.html();
        } catch (Exception e) {
            return "Error scrape web: " + e.getMessage();
        }
    }
}
```

目前只会返回对应的网页html信息，可以获取更加详细信息，详情可以参考[在线抓取图片](在线抓取图片)

3. 测试

```java
    @Test
    public void searchOnLine() {
        WebOperationTool tool = new WebOperationTool(apikey);
        String content = tool.getWebContent("大熊猫");
        System.out.println(content);
    }
```

![image-20250521105934547](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250521105934547.png)

### 终端操作

可以使用ProcessBuilder，在windows和linux不同环境，需要使用不同的Process方式。

```java
public class TerminalOperationTool {

    @Tool(description = "Execute a terminal command and return the output")
    public String executeTerminalCommand(@ToolParam(description = "Execute command") String command) {
        StringBuilder stringBuilder = new StringBuilder();
        try {
            ProcessBuilder builder = new ProcessBuilder("cmd.exe", "/c", command);
            // Process process = Runtime.getRuntime().exec(command);
            Process process = builder.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(),"GBK"))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    stringBuilder.append(line).append("\n");
                }
                int exitCode = process.waitFor();
                if (exitCode != 0) {
                    throw new RuntimeException("Terminal command failed with exit code " + exitCode);
                }
                process.destroy();
            }
        } catch (Exception e) {
            return "Error executing terminal command: " + e.getMessage();
        }

        return stringBuilder.toString();
    }
}
```

```java
    @Test
    public void executeTerminalCommand() {
        String command = "dir";
        TerminalOperationTool tool = new TerminalOperationTool();
        String res = tool.executeTerminalCommand(command);
        System.out.println(res);
    }
```

![image-20250521134347720](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250521134347720.png)

### 资源下载

通过指定URL下载文件到本地

```java
public class ResourceDownloadTool {

    @Tool(description = "Download file from url")
    public String downloadResource(
            @ToolParam(description = "URL of the resource to download")
            String url,
            @ToolParam(description = "Name of the file to save the download resource")
            String fileName) {
        // 设置下载地址
        String fileDir = FileConstant.tempDir + "/download";
        String filePath = fileDir + "/" + fileName;
        // 下载文件
        try {
            File dir = FileUtil.mkdir(fileDir);
            HttpUtil.downloadFile(url, filePath);
            return "download file: " + fileName + " success";
        } catch (Exception e) {
            return "Error download file " + e.getMessage();
        }
    }
}
```

```java
@Test
public void download() {
    String url = "https://www.codefather.cn/logo.png";
    String fileName = "logo.png";
    ResourceDownloadTool tool = new ResourceDownloadTool();
    String res = tool.downloadResource(url, fileName);
    System.out.println(res);
}
```

### PDF生成

可以使用[itext-java](https://github.com/itext/itext-java)这个工具生成PDF文件

[官方文档](https://kb.itextpdf.com/itext/installing-itext-for-java)

引入依赖

```xml
<!-- https://mvnrepository.com/artifact/com.itextpdf/itext-core -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext-core</artifactId>
    <version>9.1.0</version>
    <type>pom</type>
</dependency>
<!-- https://mvnrepository.com/artifact/com.itextpdf/font-asian -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>font-asian</artifactId>
    <version>9.1.0</version>
    <scope>test</scope>
</dependency>
```

生成PDF工具类

```java
public class PDFGenerateTool {
    @Tool(description = "Generate a PDF with given content")
    public String generatePDF(
            @ToolParam(description = "Name of the file to save the generated PDF")
            String fileName,
            @ToolParam(description = "Content to be written in the PDF")
            String content) {
        // 设置下载地址
        String fileDir = FileConstant.tempDir + "/pdf";
        String filePath = fileDir + "/" + fileName ;

        try {
            FileUtil.mkdir(fileDir);
            try (PdfWriter pdfWriter = new PdfWriter(filePath);
                 PdfDocument pdfDocument = new PdfDocument(pdfWriter);
                 Document document = new Document(pdfDocument)) {
                // 使用内置中文
                PdfFont pdfFont = PdfFontFactory.createFont("STSong-Light", "UniGB-UCS2-H");
                document.setFont(pdfFont);

                // 创建段落
                Paragraph paragraph = new Paragraph(content);
                document.add(paragraph);
            }
            return "PDF Generated Successfully to " + filePath;
        } catch (Exception e) {
            return "Error PDF Generated file: " + e.getMessage();
        }
    }
}
```

### 集中注册

```java
@Configuration
public class ToolRegistration {

    @Value("${search.api-key}")
    private String apiKey;

    @Bean
    public ToolCallback[] allTools() {
        FileOperationTool fileOperationTool = new FileOperationTool();
        PDFGenerateTool pdfGenerateTool = new PDFGenerateTool();
        ResourceDownloadTool resourceDownloadTool = new ResourceDownloadTool();
        TerminalOperationTool terminalOperationTool = new TerminalOperationTool();
        WebOperationTool webOperationTool = new WebOperationTool(apiKey);
        WebScrapingTool webScrapingTool = new WebScrapingTool();
        return ToolCallbacks.from(
                fileOperationTool,
                pdfGenerateTool,
                resourceDownloadTool,
                terminalOperationTool,
                webOperationTool,
                webScrapingTool
        );
    }
}
```

1. 工厂模式：allTools()方法作为一个工厂方法,负责创建和配置多个工具实例,然后将它们包装成统一的数组返回。这符合工厂模式的核心思想-集中创建对象并隐藏创建细节。
2. 依赖注入模式：通过 @value 注解注入配置值,以及将创建好的工具通过Spring容器注入到需要它们的组件中。
3. 注册模式：该类作为一个中央注册点,集中管理和注册所有可用的工具,使它们能够被系统其他部分统一访问。
4. 适配器模式的应用：ToolCallbacks.from 方法可以看作是一种适配器,它将各种不同的工具类转换为统一的ToolCallback数组,使系统能够以一致的方式处理它们。

### 测试集中注册

```java
    @Resource
    private ToolCallback[] allTools;

    private final ChatClient chatClient;
    @Resource
    private VectorStore loveAppVectorStore;

    public LoveApp(ChatModel dashscopeChatModel, VectorStore loveAppVectorStore) {
        this.loveAppVectorStore = loveAppVectorStore;
        // 初始化基于内存的对话记忆
        ChatMemory chatMemory = new LocalMemory(baseDir);
        //SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(systemResource.toString());
        chatClient = ChatClient.builder(dashscopeChatModel)
                .defaultSystem(SYSTEM_PROMPT)
                .defaultAdvisors(
                        new MessageChatMemoryAdvisor(chatMemory),
                        new WordAdvisors()
                )
                .build();
    }

    public String doChatWithTools(String message, String chatId) {
        ChatResponse chatResponse = chatClient
                .prompt()
                .user(message)
                .system(SYSTEM_PROMPT)
                .advisors(spec -> spec.param(CHAT_MEMORY_CONVERSATION_ID_KEY, chatId)
                        .param(CHAT_MEMORY_RETRIEVE_SIZE_KEY, 10))
                .advisors(new MyAdvisors())
                .tools(allTools)
                .call()
                .chatResponse();
        String content = chatResponse.getResult().getOutput().getText();
        log.info(content);
        return content;
    }
```

```java
    @Test
    void doChatWithTools() {
        String chatId = UUID.randomUUID().toString();
        String message = "给我生成北京的旅游景点PDF，包含时间、计划和费用，生成10条信息";
        loveApp.doChatWithTools(message, chatId);
    }
```

![image-20250521145113156](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250521145113156.png)



