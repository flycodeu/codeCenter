---
title: Logback日志框架使用
createTime: 2025/07/25 09:38:54
permalink: /article/01nansv0/
tags:
  - 日志
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250725103647244.png
---
# 🚀 深入解读 Logback 日志配置，优化你的 Java 应用性能！

在 Java 开发中，日志从来不只是“打印调试信息”的工具，它是性能优化、问题定位、系统稳定运行的基石。

本文将带你从实战配置出发，深入了解 Logback 背后的工作机制，帮助你打造一个高性能、可维护、可扩展的日志体系！

👇赶紧收藏这篇文章，提升你的日志系统设计水平！

---

## 🧠 什么是 Logback？

Logback 是一个广泛使用的日志框架，通常与 SLF4J 一起使用，用于替代 Java 的原生日志框架（如 java.util.logging）和 Log4j。
核心优势：

| 特性       | 说明                                  |
| -------- | ----------------------------------- |
| 🧩 性能强劲  | 支持异步写入，极大降低日志对主业务线程的性能影响            |
| 📦 配置灵活  | 支持 XML、Groovy、JSON 多种方式配置           |
| 🎯 精准分级  | 提供 TRACE \~ FATAL 六种日志级别，控制更细       |
| 📤 多通道输出 | 控制台、文件、数据库、远程服务等                    |
| 🔄 支持热加载 | 可自动检测配置文件变更                         |
| 🔌 插件丰富  | 如 logstash-logback-encoder 方便接入 ELK |
| 🤝 框架兼容好 | 与 Spring、Hibernate、JUnit 等无缝集成      |

## 🔍 配置结构总览

本篇文章解析的 Logback 配置文件包括以下几个模块：

1. 基础配置（扫描/上下文）
2. 控制台输出
3. 文件输出（INFO/WARN/ERROR）
4. 异步日志加速
5. 不同环境下的日志策略
6. 日志格式与美化
7. Root Logger 总控输出

---

## 配置总览
Logback 的配置文件（默认读取 logback-spring.xml 或 logback.xml）一般包含以下结构
```xml
<configuration>
  <property/>       <!-- 定义变量 -->
  <appender/>       <!-- 定义日志输出目标 -->
  <logger/>         <!-- 针对包或类设置日志级别 -->
  <root/>           <!-- 根日志配置 -->
</configuration>
```

## ✳️ 基础配置说明

```xml
<configuration scan="true" scanPeriod="10 seconds">
</configuration>
```
- scan="true"：开启配置热更新，适合开发调试
- scanPeriod="10 seconds"：每10秒扫描一次配置文件变更

## 🔧 上下文变量定义
```xml
<springProperty scope="context" name="log.path" source="logging.path"/>
```
- 支持从 Spring 配置文件读取 logging.path，用于动态控制日志目录

## 🎨 彩色日志格式设置
```xml
<conversionRule conversionWord="clr" converterClass="...ColorConverter"/>
```
- clr 是颜色转换规则的关键字，使控制台日志更加易读。

## 🖥️ 控制台输出配置
```xml
<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
  <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
    <level>info</level>
  </filter>
  <encoder>
    <pattern>%d{yy-MM-dd.HH:mm:ss.SSS} [%-16t] %-5p %-22c{0}%X{ServiceId} -%X{trace-id} %m%n</pattern>
    <charset>UTF-8</charset>
  </encoder>
</appender>
```
- 仅输出 INFO 及以上日志
- 含线程、类名、trace-id，利于链路追踪


## 📁 文件输出（INFO 级别）
```xml
    <appender name="INFO_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <!-- 正在记录的日志文件的路径及文件名 -->
    <file>./logData/log/log_info.log</file>
    <!--日志文件输出格式-->
    <encoder>
        <pattern>%d{yy-MM-dd.HH:mm:ss.SSS} [%-16t] %-5p %-22c{0}%X{ServiceId} -%X{trace-id} %m%n</pattern>
        <charset>UTF-8</charset>
    </encoder>
    <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <!-- 每天日志归档路径以及格式 -->
        <fileNamePattern>./logData/log/log-info-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
        <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
            <maxFileSize>100MB</maxFileSize>
        </timeBasedFileNamingAndTriggeringPolicy>
        <!--日志文件保留天数-->
        <maxHistory>15</maxHistory>
        <totalSizeCap>10GB</totalSizeCap>
    </rollingPolicy>
</appender>
```
- 滚动策略为：按天 + 按大小；
- 控制日志文件不超过 100MB，最多保留 15 天、10GB；
- 输出路径使用 ${log.path} 支持环境注入。

## 文件输出（WARN/ERROR）
```xml
    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <!-- 正在记录的日志文件的路径及文件名 -->
    <file>./logData/log/log_error.log</file>
    <!--日志文件输出格式-->
    <encoder>
        <pattern>%d{yy-MM-dd.HH:mm:ss.SSS} [%-16t] %-5p %-22c{0}%X{ServiceId} -%X{trace-id} %m%n</pattern>
        <charset>UTF-8</charset>
    </encoder>
    <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>./logData/log/log-error-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
        <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
            <maxFileSize>100MB</maxFileSize>
        </timeBasedFileNamingAndTriggeringPolicy>
        <!-- 日志文件保留天数【根据服务器预留，可自行调整】 -->
        <maxHistory>7</maxHistory>
        <totalSizeCap>5GB</totalSizeCap>
    </rollingPolicy>
    <!-- WARN 级别及以上 -->
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
        <level>WARN</level>
    </filter>
</appender>
```
- 输出 WARN 和 ERROR 等高优先级日志
- 日志保留 7 天，最多 5GB
- 单独区分错误日志，便于报警系统采集

## ⚡ 异步日志输出配置
```xml
<appender name="ASYNC_FILE_INFO" class="ch.qos.logback.classic.AsyncAppender">
    <!-- 队列剩余容量小于discardingThreshold,则会丢弃TRACT、DEBUG、INFO级别的日志;默认值-1,为queueSize的20%;0不丢失日志 -->
    <discardingThreshold>0</discardingThreshold>
    <!-- 更改默认的队列的深度,该值会影响性能.默认值为256 -->
    <queueSize>8192</queueSize>
    <!-- neverBlock:true 会丢失日志,但业务性能不受影响 -->
    <neverBlock>true</neverBlock>
    <!--是否提取调用者数据-->
    <includeCallerData>false</includeCallerData>
    <appender-ref ref="INFO_FILE"/>
</appender>
<appender name="ASYNC_FILE_ERROR" class="ch.qos.logback.classic.AsyncAppender">
    <!-- 队列剩余容量小于discardingThreshold,则会丢弃TRACT、DEBUG、INFO级别的日志;默认值-1,为queueSize的20%;0不丢失日志 -->
    <discardingThreshold>0</discardingThreshold>
    <!-- 更改默认的队列的深度,该值会影响性能.默认值为256 -->
    <queueSize>1024</queueSize>
    <!-- neverBlock:true 会丢失日志,但业务性能不受影响 -->
    <neverBlock>true</neverBlock>
    <!--是否提取调用者数据-->
    <includeCallerData>false</includeCallerData>
    <appender-ref ref="ERROR_FILE"/>
</appender>
```
- 异步写入不阻塞主线程，提升性能
- 设置 neverBlock=true：写满队列时丢弃 INFO 以下日志，确保业务优先
- 队列大小可根据系统吞吐能力调整

## 🧪 开发环境专属配置
```xml
<springProfile name="dev">
  <logger name="com.nmys.view" level="debug"/>
</springProfile>
```
- 仅在开发环境启用某个包的 DEBUG 日志，生产环境不受影响

## 🏁 Root Logger 配置总控
```xml
<root level="info">
    <appender-ref ref="CONSOLE"/>
    <!-- 异步日志-INFO -->
    <appender-ref ref="ASYNC_FILE_INFO"/>
    <!-- 异步日志-ERROR -->
    <appender-ref ref="ASYNC_FILE_ERROR"/>
</root>
```
- 设置默认日志级别为 INFO
- 同时输出至控制台、文件（INFO）、文件（ERROR）

## ✅ 总结
整合代码如下：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- 日志级别从低到高分为TRACE < DEBUG < INFO < WARN < ERROR < FATAL，如果设置为WARN，则低于WARN的信息都不会输出 -->
<configuration scan="true" scanPeriod="10 seconds">

    <contextName>logback</contextName>
    <!-- name的值是变量的名称，value的值时变量定义的值。通过定义的值会被插入到logger上下文中。定义变量后，可以使“${}”来使用变量。 -->
    <springProperty scope="context" name="log.path" source="logging.path"/>
    <!-- 日志格式 -->
    <conversionRule conversionWord="clr" converterClass="org.springframework.boot.logging.logback.ColorConverter"/>
    <conversionRule conversionWord="wex"
                    converterClass="org.springframework.boot.logging.logback.WhitespaceThrowableProxyConverter"/>
    <conversionRule conversionWord="wEx"
                    converterClass="org.springframework.boot.logging.logback.ExtendedWhitespaceThrowableProxyConverter"/>

    <!-- 输出到控制台 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <!-- 此日志appender是为开发使用，只配置最底级别，控制台输出的日志级别是大于或等于此级别的日志信息 -->
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>info</level>
        </filter>
        <encoder>
            <pattern>%d{yy-MM-dd.HH:mm:ss.SSS} [%-16t] %-5p %-22c{0}%X{ServiceId} -%X{trace-id} %m%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!--输出到文件-->
    <!-- 时间滚动输出 level为 INFO 日志 -->
    <appender name="INFO_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>./logData/log/log_info.log</file>
        <!--日志文件输出格式-->
        <encoder>
            <pattern>%d{yy-MM-dd.HH:mm:ss.SSS} [%-16t] %-5p %-22c{0}%X{ServiceId} -%X{trace-id} %m%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- 每天日志归档路径以及格式 -->
            <fileNamePattern>./logData/log/log-info-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文件保留天数-->
            <maxHistory>15</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
        </rollingPolicy>
    </appender>

    <!-- 时间滚动输出 level为 ERROR 日志 -->
    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>./logData/log/log_error.log</file>
        <!--日志文件输出格式-->
        <encoder>
            <pattern>%d{yy-MM-dd.HH:mm:ss.SSS} [%-16t] %-5p %-22c{0}%X{ServiceId} -%X{trace-id} %m%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>./logData/log/log-error-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!-- 日志文件保留天数【根据服务器预留，可自行调整】 -->
            <maxHistory>7</maxHistory>
            <totalSizeCap>5GB</totalSizeCap>
        </rollingPolicy>
        <!-- WARN 级别及以上 -->
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>WARN</level>
        </filter>
    </appender>

    <!-- 异步输出 -->
    <appender name="ASYNC_FILE_INFO" class="ch.qos.logback.classic.AsyncAppender">
        <!-- 队列剩余容量小于discardingThreshold,则会丢弃TRACT、DEBUG、INFO级别的日志;默认值-1,为queueSize的20%;0不丢失日志 -->
        <discardingThreshold>0</discardingThreshold>
        <!-- 更改默认的队列的深度,该值会影响性能.默认值为256 -->
        <queueSize>8192</queueSize>
        <!-- neverBlock:true 会丢失日志,但业务性能不受影响 -->
        <neverBlock>true</neverBlock>
        <!--是否提取调用者数据-->
        <includeCallerData>false</includeCallerData>
        <appender-ref ref="INFO_FILE"/>
    </appender>

    <appender name="ASYNC_FILE_ERROR" class="ch.qos.logback.classic.AsyncAppender">
        <!-- 队列剩余容量小于discardingThreshold,则会丢弃TRACT、DEBUG、INFO级别的日志;默认值-1,为queueSize的20%;0不丢失日志 -->
        <discardingThreshold>0</discardingThreshold>
        <!-- 更改默认的队列的深度,该值会影响性能.默认值为256 -->
        <queueSize>1024</queueSize>
        <!-- neverBlock:true 会丢失日志,但业务性能不受影响 -->
        <neverBlock>true</neverBlock>
        <!--是否提取调用者数据-->
        <includeCallerData>false</includeCallerData>
        <appender-ref ref="ERROR_FILE"/>
    </appender>

    <!-- 开发环境：控制台打印 -->
    <springProfile name="dev">
        <logger name="com.nmys.view" level="debug"/>
    </springProfile>
    <root level="info">
        <appender-ref ref="CONSOLE"/>
        <!-- 异步日志-INFO -->
        <appender-ref ref="ASYNC_FILE_INFO"/>
        <!-- 异步日志-ERROR -->
        <appender-ref ref="ASYNC_FILE_ERROR"/>
    </root>

</configuration>
```
我们需要在yml中配置当前xml路径
```yml
logging:
  level:
    root: info
  config: classpath:logback-spring.xml
```

代码中使用Logger
```java
    public static final Logger log = Logger.getLogger(Application.class.getName());
```

![image-20250725101702957](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250725101702957.png)