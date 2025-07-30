---
title: Ognl获取Json信息
createTime: 2025/07/30 09:36:56
permalink: /article/49s3ueem/
tags:
  - Ognl
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/e90499388ddc78bb57d46b73ea09260.jpg
---
## 使用 OGNL 提取 JSON 字段

OGNL（Object-Graph Navigation Language） 是一种用于访问和操作 Java 对象图的表达式语言。它最初应用于 Web 框架（如
Struts），以其简洁灵活的语法广泛用于属性取值、集合访问、条件表达式等场景。
在处理 Java 对象、Map 或 JSON 数据时，OGNL 可以用来动态访问字段，非常适合配置驱动或测试类场景。

## 1. 引入依赖

在 Maven 项目中添加 OGNL 依赖：

```xml

<dependency>
    <groupId>ognl</groupId>
    <artifactId>ognl</artifactId>
    <version>3.2.21</version>
</dependency>
```

## 2. 使用 OGNL 提取 JSON 字段

Ognl.getValue("key", object) 可用于动态访问对象中的属性。

OGNL 支持多种对象结构，包括 JSONObject、Map、JavaBean 等。

当 JSON 嵌套较深时，也可以使用 "user.name" 等路径表达式获取子字段的值。

下面是一个简单示例，展示如何使用 OGNL 从 JSON 中提取字段：

```java
public void testOgnl() throws OgnlException {
    String jsonStr = "{"
            + "\"orderId\": \"123\","
            + "\"age\": \"18\","
            + "\"user\": {"
            + "  \"userId\": \"u001\","
            + "  \"userName\": \"张三\","
            + "  \"address\": {"
            + "    \"city\": \"北京\","
            + "    \"district\": \"海淀区\""
            + "  }"
            + "}"
            + "}";
    JSONObject jsonObject = JSONObject.parseObject(jsonStr);

    log.info("orderId={}", (String) Ognl.getValue("orderId", jsonObject));
    log.info("userName={}", (String) Ognl.getValue("user.userName", jsonObject));
}
```

## 3. 输出结果

运行后，控制台输出如下日志，表示成功从 JSON 中获取了 orderId 字段：

```
INFO  ApiTest                - orderId=123
INFO  ApiTest                - userName=张三
```

