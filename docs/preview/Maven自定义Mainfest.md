---
title: Maven自定义Mainfest
createTime: 2025/03/26 08:43:19
permalink: /article/97dde51x/
tags:
   - Maven
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/d01a33e1a55ca078dc78d963e907308.jpg
---


## 简介
MANIFEST.MF 是一个在 Java 的 JAR 文件中常见的文件，位于 JAR 文件的 META-INF 目录下。它是一个纯文本文件，主要用于描述 JAR 文件的内容、元数据和配置信息。它是 JAR 文件的“清单文件”，类似于一种元数据文件，为运行时环境（如 JVM）或其他工具提供了必要的信息。

## 主要用途
- 描述JAR文件的用途：例如，是否是一个可执行的 JAR 文件。
- 指定主类：如果 JAR 文件是可执行的，MANIFEST.MF 中需要指定主类（即程序入口点）。
- 定义依赖关系：列出 JAR 文件运行所需的其他库或模块。
- 签名信息：存储数字签名信息以验证 JAR 文件的完整性和来源。
- 扩展机制：支持 Java 的扩展机制，用于加载额外的功能模块


## 文件结构
例如：
```yml
Manifest-Version: 1.0
Created-By: Apache Ant 1.5.1
Extension-Name: Struts Framework
Specification-Title: Struts Framework
Specification-Vendor: Apache Software Foundation
Specification-Version: 1.1
Implementation-Title: Struts Framework
Implementation-Vendor: Apache Software Foundation
Implementation-Vendor-Id: org.apache
Implementation-Version: 1.1
Class-Path:  commons-beanutils.jar commons-collections.jar commons-dig
 ester.jar commons-logging.jar commons-validator.jar jakarta-oro.jar s
 truts-legacy.jar
```
1. Manifest-Version
   用来定义manifest文件的版本，例如：Manifest-Version: 1.0
2. Created-By
   声明该文件的生成者，一般该属性是由jar命令行工具生成的，例如：Created-By: Apache Ant 1.5.1
3. Signature-Version
   定义jar文件的签名版本
4. Class-Path
   应用程序或者类装载器使用该值来构建内部的类搜索路径
5. Main-Class
   可执行 JAR 文件的主类（程序入口点）。JVM 使用此属性来启动应用程序。


## 自定义MANIFEST
有两种方式，第一种直接在resources里面新建META-INF/MANIFEST.MF文件，填写相关信息，第二种是在Maven里面配置相关信息
### 1. 创建MF文件

指定版本和启动路径

![image-20250326085449499](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250326085449499.png)

```mf
Manifest-Version: 1.0
Main-Class: icu.flycode.sdk.OpenAiCodeReview
```


### 2. pom.xml配置
在<build></build>里卖弄加入这个插件，需要指定mainfest的mainClass也就是主项目路径
```xml
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.2.0</version>
                <configuration>
                    <archive>
                        <manifest>
                            <addDefaultImplementationEntries>true</addDefaultImplementationEntries>
                            <mainClass>icu.flycode.sdk.OpenAiCodeReview</mainClass>
                        </manifest>
                    </archive>
                </configuration>
            </plugin>
```





## 参考文档
[MANIFEST.MF文件详解](https://www.cnblogs.com/Gandy/p/7290069.html)