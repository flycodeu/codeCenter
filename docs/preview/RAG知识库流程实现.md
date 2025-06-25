---
title: RAG知识库流程实现
createTime: 2025/06/09 13:55:38
permalink: /article/ssryacqc/
tags:
  - RAG
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250611165452.jpg
---


## 技术方案

[RAG相关文档](RAG知识库.md)
[Spring AI](https://docs.spring.io/spring-ai/reference/api/vectordbs/pgvector.html)



### 方案流程

####  1. 文件上传与解析

**文件上传** : 用户上传文件（如 MD、TXT、SQL 等）。

**文件解析** : 使用 `Tika` 对上传的文件进行解析，提取出文本内容。

#### 2. 文本拆分

**文本拆分** : 使用 `TokenTextSplitter` 将解析后的文本内容拆分为更小的片段。

**拆分后的文本片段** : 每个文本片段将作为后续处理和存储的基本单元。

#### 3. 文本标记

**标记添加** : 在遍历拆分后的文本片段时，为每个片段添加标记。标记的作用是区分不同的知识库内容，例如通过标记标识文件的来源、类别或其他元数据信息。

**标记格式** : 标记可以是简单的字符串标签，也可以是结构化的 JSON 数据，具体格式根据业务需求确定。

#### 4. 向量化与存储

**向量化** : 使用 Spring AI 提供的向量模型将标记后的文本片段转换为向量表示。向量化过程将文本内容映射到高维向量空间，便于后续的相似性搜索和检索。

**存储到PostgreSQL向量库** : 将向量化后的文本片段及其标记存储到 PostgreSQL 向量库中。PostgreSQL 提供了高效的向量索引和搜索功能，能够支持大规模的文本数据存储和检索。

### 前置软件

需要配置好ollama、pgVector

### 引入依赖
- tika：解析文档
- pgvector：操作向量数据库
- ollama：操作ollama
```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-tika-document-reader</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-pgvector-store-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>3.5.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-ollama-spring-boot-starter</artifactId>
    <version>1.0.0-M6</version>
</dependency>
```

### 配置yml
- 配置pgvector
- 配置ollama

```yml
spring:
  application:
    name: fly-dev-app
  datasource:
    driver-class-name: org.postgresql.Driver
    username: postgres
    password: postgres
    url: jdbc:postgresql://localhost:5432/ai-rag-knowledge
    type: com.zaxxer.hikari.HikariDataSource
  ai:
    ollama:
      base-url: http://localhost:11434
      embedding:
        enabled: true
        options:
          num-batch: 512
        model: nomic-embed-text
```


### 配置相应的bean
[ollama-chat](https://docs.spring.io/spring-ai/reference/api/chat/ollama-chat.html)
[Tika文件读取](https://docs.spring.io/spring-ai/reference/api/etl-pipeline.html#_tika_docx_pptx_html)
[Token分词器](https://docs.spring.io/spring-ai/reference/api/etl-pipeline.html#_tokentextsplitter)
[PgVector](https://docs.spring.io/spring-ai/reference/api/vectordbs/pgvector.html)
```java
@Configuration
public class OllamaConfig {

    /**
     * 获取url
     *
     * @param baseUrl
     * @return
     */
    @Bean
    public OllamaApi ollamaApi(@Value("${spring.ai.ollama.base-url}") String baseUrl) {
        return new OllamaApi(baseUrl);
    }

    /**
     * 指定模型
     *
     * @param ollamaApi
     * @return
     */
    @Bean
    public OllamaChatModel ollamaChatModel(OllamaApi ollamaApi) {
        return OllamaChatModel.builder().ollamaApi(ollamaApi).build();
    }

    /**
     * 分词器
     *
     * @return
     */
    @Bean
    public TokenTextSplitter myTokenTextSplitter() {
        return new TokenTextSplitter(
                1000,
                200,
                10,
                5000,
                true
        );
    }

    /**
     * SimpleVectorStore
     *
     * @param ollamaEmbeddingModel
     * @return
     */
    @Bean
    public SimpleVectorStore simpleVectorStore(EmbeddingModel ollamaEmbeddingModel) {
        return SimpleVectorStore.builder(ollamaEmbeddingModel).build();
    }

    /**
     * PgVectorStore
     *
     * @param ollamaEmbeddingModel
     * @param jdbcTemplate
     * @return
     */
    @Bean
    public PgVectorStore pgVectorStore(EmbeddingModel ollamaEmbeddingModel, JdbcTemplate jdbcTemplate) {
        return PgVectorStore.builder(jdbcTemplate, ollamaEmbeddingModel).build();
    }
}
```

### 创建PGVector数据库
部分创建命令在如下文档可以查看到
[Docker安装PgVector](Docker安装PgVector.md)
```sql
 CREATE TABLE IF NOT EXISTS vector_store (
    id TEXT PRIMARY KEY,
    content TEXT,
    metadata JSONB,
    embedding VECTOR(1536)  -- 1536 是 OpenAI 向量维度，你可以根据实际情况修改
);
```



## 测试知识库

### 引入相应的bean

```java
    @Resource
    private OllamaChatModel ollamaChatModel;
    @Autowired
    private TokenTextSplitter myTokenTextSplitter;
    @Autowired
    private SimpleVectorStore simpleVectorStore;
    @Autowired
    private PgVectorStore pgVectorStore;
```

### 文件上传以及文档解析存储
具体步骤如下：
- 使用Tika从指定位置读取文件
- Token分词器提取文档
- pgvector存储文档
```java
    @Test
    public void upload() {
        // 1. 使用Tika读取指定位置文件
        TikaDocumentReader tikaDocumentReader = new TikaDocumentReader("./data/我的知识库.md");
        List<Document> documents = tikaDocumentReader.get();

        // 2. 分割器分隔文档
        List<Document> documentList = myTokenTextSplitter.apply(documents);

        // 3. 存储pgvector和simplevector向量数据库
        documentList.forEach(document -> document.getMetadata().put("knowledge", "我的知识库"));
        simpleVectorStore.accept(documentList);
        pgVectorStore.accept(documentList);
        log.info("上传文档成功");
    }
```

上传成功后，可以在当前数据库查看内容、元信息、向量

![image-20250610111929217](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250610111929217.png)

### 使用知识库

步骤如下：

- 使用pgsql查找出符合条件的知识库文档
- 整合所有的文档
- 将文档以及用户需求整合到message提交给AI
- 获取响应

```java
   @Test
    public void query() {
        // 1. 定义预设
        String query = "精灵宝可梦角色有哪些";
        String SYSTEM_PROMPT = """
                Use the information from the DOCUMENTS section to provide accurate answers but act as if you knew this information innately.
                If unsure, simply state that you don't know.
                Another thing you need to note is that your reply must be in Chinese!
                DOCUMENTS:
                    {documents}
                """;
        // 2. 设置搜索条件
        SearchRequest searchRequest =
                SearchRequest
                        .builder()
                        .query(query)
                        .topK(5)
                        .filterExpression("knowledge=='我的知识库'")
                        .build();
        // 3. 读取到指定文件内容
        List<Document> documentList = pgVectorStore.similaritySearch(searchRequest);
        log.info(documentList.toString());
        // 4. 整合搜索结果
        String documentCollectors = documentList.stream().map(Document::getText).collect(Collectors.joining());
        // 5. 设置消息
        Message message = new SystemPromptTemplate(SYSTEM_PROMPT).createMessage(Map.of("documents", documentCollectors));
        List<Message> messageList = new ArrayList<>();
        messageList.add(message);
        messageList.add(new UserMessage(query));
        // 6. 获取响应结果

        ChatResponse chatResponse = ollamaChatModel.call(new Prompt(messageList,OllamaOptions.builder().model("deepseek-r1:1.5b").build()));
        log.info(chatResponse.toString());

    }
```

### 使用效果

![image-20250610112257987](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250610112257987.png)


### 流式输出
```java
  @GetMapping(value = "/generate_stream_rag", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ChatResponse> generateAiResponseStream(
            @RequestParam String model,
            @RequestParam String prompt,
            @RequestParam(required = false) String ragTag) {

        // 1. 设置相似度阈值，过滤掉相关性太低的文档
        double similarityThreshold = 0.7; // 根据实际情况调整

        SearchRequest searchRequest = SearchRequest
                .builder()
                .query(prompt)
                .topK(5)
                .filterExpression("knowledge == '" + ragTag + "'")
                .build();

        List<Document> documents = pgVectorStore.similaritySearch(searchRequest);
        log.info("检索到的文档: {}", documents.toString());

        // 2. 过滤相似度低的文档 - 根据实际的distance字段
        List<Document> relevantDocuments = documents.stream()
                .filter(doc -> {
                    // 从日志看到使用的是distance字段，distance越小表示越相似
                    // 所以我们要过滤distance大于某个阈值的文档
                    Double distance = doc.getMetadata().get("distance") != null ?
                            Double.valueOf(doc.getMetadata().get("distance").toString()) : 1.0;
                    // distance小于0.7表示相关性较高
                    return distance <= 0.7;
                })
                .collect(Collectors.toList());

        log.info("过滤后的相关文档数量: {}", relevantDocuments.size());

        String systemPromptTemplate;
        Map<String, Object> templateVariables = new HashMap<>();

        // 3. 根据是否有相关文档来调整系统提示
        if (relevantDocuments.isEmpty()) {
            systemPromptTemplate = """
            You are a knowledge base assistant. The user asked a question, but no relevant documents were found in the knowledge base.
            
            CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:
            - You MUST NOT answer the question using your general knowledge
            - You MUST NOT make up or fabricate any information
            - You MUST NOT provide any technical advice or explanations
            - You MUST ONLY respond with: "我不清楚这个问题，知识库中没有找到相关信息。"
            - DO NOT add any additional explanations or suggestions
            
            REMEMBER: You are a knowledge base search assistant, not a general AI assistant.
            """;
            templateVariables.put("documents", "");
        } else {
            systemPromptTemplate = """
            You are a knowledge base search assistant. Here is some relevant reference material from the knowledge base:
            
            RELEVANT DOCUMENTS:
            {documents}
            
            CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:
            - You MUST ONLY use the provided documents to answer the user's question
            - You MUST NOT use any knowledge outside of these documents
            - If the documents don't contain enough information to fully answer the question, do your best with what's available
            - Answer in Chinese (中文)
            - Be helpful and comprehensive based on the document content
            - DO NOT say "根据知识库中的信息，我无法回答这个问题" unless the documents are completely irrelevant
            - Structure your answer clearly and include relevant details from the documents
            
            REMEMBER: You are here to help users by utilizing the knowledge base content effectively.
            """;

            String documentContent = relevantDocuments.stream()
                    .map(doc -> "文档内容: " + doc.getText())
                    .collect(Collectors.joining("\n\n"));
            templateVariables.put("documents", documentContent);
        }

        // 4. 创建系统消息
        Message ragMessage = new SystemPromptTemplate(systemPromptTemplate)
                .createMessage(templateVariables);

        UserMessage userMessage = new UserMessage(prompt);

        return chatClient
                .prompt()
                .messages(ragMessage, userMessage)
                .options(OllamaOptions.builder()
                        .model(model)
                        .temperature(0.1) // 稍微提高温度以获得更自然的回答
                        .topP(0.3) // 适当提高topP
                        .build())
                .stream()
                .chatResponse();
    }
```