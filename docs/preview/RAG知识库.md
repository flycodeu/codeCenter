---
title: RAG知识库
createTime: 2025/05/12 09:23:44
permalink: /article/2hl965ic/
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250512165933.jpg
tags:
- AI
---

# AI知识问答场景
- 教育场景：AI 针对学生的薄弱环节提供个性化辅导和学习资源推荐。
- 电商场景：AI 根据用户购物历史和偏好推荐适合的商品，并提供智能客服支持。
- 法律咨询：AI 能解答法律疑问，提供相关法规信息，节省律师时间和成本。
- 金融场景：AI 为客户提供个性化理财建议，风险评估和投资组合优化方案。

目前知识获取有两个方面

- 互联网
- 知识库

但是AI可能回复错误内容、不按照指定内容回复，所以我们读取自己的知识库，让AI根据已有的知识库回复，而不回复其余内容。可以使用AI主流技术：RAG知识库。



# RAG概念

RAG(Retrieval-Augmented Generation 检索增强生成)，这是一种结合了信息检索（Information Retrieval, IR）与文本生成（Text Generation）的混合方法，旨在提高生成模型输出的相关性和准确性。

![image-20250512094656772](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512094656772.png)

## RAG工作流程

- 文档收集和切割
- 向量转换和存储
- 文档过滤和检索
- 查询增强和关联

### 1. 文档收集和切割

文档收集：从各种来源收集原始文档

文档预处理：清洗、标准化文档结构

文档切割：将长文档分割成适当大小的片段（chunks）

- 基于固定大小（如512token）
- 基于语义边界（段落）
- 基于递归分隔策略

常用的方式是：根据段落和回车分隔

![image-20250512101837942](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512101837942.png)



### 2. 向量转换和存储

向量转换：使用Embedding模型将文本转换为高维向量表示，可以捕获到文本的语义特征

向量存储：将生成的向量和对应文本存储到向量数据库，支持高效的相似性处理。

![image-20250512102506199](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512102506199.png)



### 3. 文档过滤和检索

查询处理：将用户的问题也转换为向量表示

过滤机制：根据元数据、关键词、定义规则进行过滤

相似度搜索：在向量数据库中查找与问题向量最相似的文档块（余弦相似度、欧氏距离）

上下文组装：根据检索到的多个文档块组成连贯的上下文

![image-20250512103845423](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512103845423.png)



### 4. 查询增强与关联

提示词组装：将检索到的文档和用户的问题进行增强组合

上下文融合：大模型增强提示生成回答

源引用：在回答中添加信息引用来源

后处理：格式化、摘要或其他处理优化最终输出

![image-20250512104518004](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512104518004.png)



结合

![image-20250512104547907](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512104547907.png)



## RAG相关技术

### Embedding

Embedding 嵌入是将高维离散数据(如文字、图片)转换为低维连续向量的过程。这些向量能在数学空间中表示原始数
据的语义特征,使计算机能够理解数据间的相似性。

Embedding模型是执行这种转换算法的机器学习模型,如Word2Vec(文本)、ResNet(图像)等。不同的Embedding
模型产生的向量表示和维度数不同,一般维度越高表达能力更强,可以捕获更丰富的语义信息和更细微的差别,但同样占
用更多存储空间。

![image-20250512111255920](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512111255920.png)

### 向量数据库

专门存储和检索数据的数据库系统。通过高效索引算法实现快速相似性搜索。

![image-20250512111626804](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512111626804.png)

![向量数据库分类](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512111655169.png)

### 召回

召回是信息检索的第一阶段，目的是从大规模数据中筛选出可能相关的候选项子集，强调的是**速度和广度**，而不是精确度。



### 精排和Rank模型

精排这是信息检索的最后阶段，使用计算复杂度更高的算法，考虑更多的特征和业务规则，对于候选项进行更复杂、精细的排序。

![image-20250512112156560](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512112156560.png)

Rank模型负责对召回阶段筛选出的数据进行精确排序，考虑多种特征评估相关性





### 混合检索策略

结合多种检索方法，提高搜索效率。常见关键词、语义、知识图谱。

![image-20250512134615888](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512134615888.png)





## RAG开发

[Spring AI RAG](https://docs.spring.io/spring-ai/reference/api/etl-pipeline.html)

首先需要引入Spring AI相关组件，详情参考[SpringBoot调用AI](SpringBoot调用AI.md)

### 1. 文档准备

自行准备文档

### 2. 文档读取

提取、转换和加载 （ETL） 框架是检索增强生成 （RAG） 用例中数据处理的主干。

ETL三个主要组件

- DocumentReader：读取文档，得到文档列表
- DocumentTransformer：转换文档，得到处理后的文档列表
- DocumentWriter：将文档列表保存到存出中

![image-20250512152548126](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512152548126.png)



1. 引入依赖

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-markdown-document-reader</artifactId>
    <version>1.0.0-M6</version>
</dependency>
```

2. 读取文件

```java
/**
 * 读取指定位置文档到知识库
 */
@Component
@Slf4j
public class LoveAppMarkdownLoader {
    private final ResourcePatternResolver resourcePatternResolver;
    public LoveAppMarkdownLoader(ResourcePatternResolver resourcePatternResolver) {
        this.resourcePatternResolver = resourcePatternResolver;
    }
    List<Document> loadMarkdown() throws IOException {
        List<Document> allDocuments = new ArrayList<>();
        try {
            // 1. 读取本地文件
            Resource[] resources = resourcePatternResolver.getResources("classpath:documents/**.md");
            for (Resource resource : resources) {
                // 2. 编写配置
                MarkdownDocumentReaderConfig config = MarkdownDocumentReaderConfig.builder()
                        .withHorizontalRuleCreateDocument(true)
                        .withIncludeCodeBlock(false)
                        .withIncludeBlockquote(false)
                        .withAdditionalMetadata("filename", resource.getFilename())
                        .build();
                MarkdownDocumentReader reader = new MarkdownDocumentReader(resource, config);
                // 3. 存储文档列表
                allDocuments.addAll(reader.get());
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return allDocuments;
    }
}
```



### 3. 向量转换和存储

可以使用[SimpleVector](https://docs.spring.io/spring-ai/reference/api/vectordbs.html)实现初始化向量数据库并且保存文档,以下是添加方法。

```java
	@Override
	public void doAdd(List<Document> documents) {
		Objects.requireNonNull(documents, "Documents list cannot be null");
		if (documents.isEmpty()) {
			throw new IllegalArgumentException("Documents list cannot be empty");
		}

		for (Document document : documents) {
			logger.info("Calling EmbeddingModel for document id = {}", document.getId());
			float[] embedding = this.embeddingModel.embed(document);
			SimpleVectorStoreContent storeContent = new SimpleVectorStoreContent(document.getId(), document.getText(),
					document.getMetadata(), embedding);
			this.store.put(document.getId(), storeContent);
		}
	}
```

SimpleVectorStore可以输入如下参数，每个重载方法里面都需要加入embedding，是从embeddingModel转换出来的向量。

![image-20250512155343729](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512155343729.png)

```java
/**
 * VectorStore实现初始化向量数据库
 */
@Configuration
public class LoveAppVectorConfig {

    @Resource
    private LoveAppMarkdownLoader loveAppMarkdownLoader;

    @Bean
    VectorStore loveAppVectorStore(EmbeddingModel dashscopeEmbeddingModel) throws IOException {
        //初始化
        SimpleVectorStore simpleVectorStore = SimpleVectorStore.builder(dashscopeEmbeddingModel).build();
        // 加载Markdown文件并添加到向量存储中
        List<Document> documents = loveAppMarkdownLoader.loadMarkdown();
        simpleVectorStore.doAdd(documents);
        return simpleVectorStore;
    }
}
```



### 4. 查询增强

Spring AI 通过Advisor特性提供了开箱即用的RAG功能。主要是QuestionAnswerAdvisor 问答拦截器和 RetrievalAugme
ntationAdvisor检索增强拦截器,前者更简单易用、后者更灵活强大。

查询增强的原理其实很简单。向量数据库存储着AI模型本身不知道的数据,当用户问题发送给AI模型时,QuestionAns
werAdvisor 会查询向量数据库,获取与用户问题相关的文档。然后从向量数据库返回的响应会被附加到用户文本中,为模型提供上下文,帮助其生成回答。

![image-20250512160226094](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512160226094.png)



```java
 	@Resource
    private  VectorStore loveAppVectorStore;

    public String doChatWithRAG(String message, String chatId) {
        ChatResponse chatResponse = chatClient
                .prompt()
                .user(message)
                .system(SYSTEM_PROMPT)
                .advisors(spec -> spec.param(CHAT_MEMORY_CONVERSATION_ID_KEY, chatId)
                        .param(CHAT_MEMORY_RETRIEVE_SIZE_KEY, 10))
                .advisors(new MyAdvisors())
                .advisors(new QuestionAnswerAdvisor(loveAppVectorStore))
                .call()
                .chatResponse();
        String content = chatResponse.getResult().getOutput().getText();
        log.info(content);
        return content;
    }
```

![image-20250512162241807](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512162241807.png)

通过打断点方式我们可以看到每个文档块生成了多个向量集合，通过这些向量可以匹配出当前数据库符合用户提问的结果。

在读取Doucements时候，我们可以看到一篇文章被Spring AI切割成10个文档块，每个文档块有自己的向量集合。

![image-20250512162812210](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512162812210.png)



## 阿里云RAG

### 录入数据库

选择阿里的原因是有Spring AI Alibaba兼容Spring AI，比较适用于java开发。 

https://bailian.console.aliyun.com/?tab=app#/data-center

我们可以在官网看到阿里的知识库。

![image-20250512163319558](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512163319558.png)

![image-20250512163656956](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512163656956.png)

![image-20250512163907837](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250512163907837.png)

可以给不同的文档添加不同的标签，每个文档都可以创建对应的标签，在搜索的时候优先根据标签筛选出结果

前置数据库已经准备完成，后面可以阅读[Spring AI Alibaba](https://java2ai.com/docs/1.0.0-M6.1/tutorials/retriever/#%E7%A4%BA%E4%BE%8B%E7%94%A8%E6%B3%95)实现RAG数据库

### RAG开发



```java
var dashScopeApi = new DashScopeApi(System.getenv("DASHSCOPE_API_KEY"));
DocumentRetriever retriever = new DashScopeDocumentRetriever(dashScopeApi,
        DashScopeDocumentRetrieverOptions.builder()
                .withIndexName("spring-ai知识库")
                .build());

List<Document> documentList = retriever.retrieve(new Query("What's spring ai"));
```

官方示例只能进行简单的查询，我们可以使用Spring AI的[Retrieval Augmented Generation(检索增强顾问)](https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html#_retrievalaugmentationadvisor_incubating)这就需要使用Spring AI提供的RAG Advisor ，可以绑定文档检索器、查询转换器和查询增强器，更灵活地构造查询。

```java
Advisor retrievalAugmentationAdvisor = RetrievalAugmentationAdvisor.builder()
        .documentRetriever(VectorStoreDocumentRetriever.builder()
                .similarityThreshold(0.50)
                .vectorStore(vectorStore)
                .build())
        .build();

String answer = chatClient.prompt()
        .advisors(retrievalAugmentationAdvisor)
        .user(question)
        .call()
        .content();
```

```java
@Configuration
@Slf4j
public class LoveAppAdvisorConfig {
    @Value("${spring.ai.dashscope.api-key}")
    private String dashScopeKey;

    @Bean
    public Advisor loveAppRagAdvisor() {
        DashScopeApi dashScopeApi = new DashScopeApi(dashScopeKey);
        DocumentRetriever documentRetriever = new DashScopeDocumentRetriever(dashScopeApi,
                DashScopeDocumentRetrieverOptions.builder()
                        .withIndexName("xxx(阿里配置的知识库名称)")
                        .build()
        );

        Advisor retrievalAugmentationAdvisor = RetrievalAugmentationAdvisor.builder()
                .documentRetriever(documentRetriever)
                .build();

        return retrievalAugmentationAdvisor;
    }
}
```

即可在应用程序中加入Advisor



