---
title: 自定义Starter
createTime: 2025/03/04 09:28:52
permalink: /article/3td6t8k5/
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

## 为什么要创建Starter？

日常的开发中，我们必然是会遇到一些独立于业务之外的一些通用模块，而这些模块是可以在其他的业务中达到复用的，肯定是不希望将同样的代码继续编写一遍。例如Mysql的依赖导入之后，我们只需要在配置文件里面填写必要的信息，在不同的业务中可以使用不同的数据库，我们并不需要重复编写一些数据库连接等复杂配置，这就是Starter带给我们的便利。

以下笔者将会使用一个简单的demo来快速创建一个Starter，了解如何使用。创建一个配置，能够读取配置里面的用户名，用于展示。

## 如何制作自己的Starter

### 1. 创建SpringBoot项目，引入依赖

需要引入两个依赖

```xml
       <!--自动配置yml提示-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

### 2. 修改pom配置

第一步：创建成功后，我们能够看到自己的当前项目groupId，工件id以及相应的版本号，这几个配置就是之后打包，别人使用的依赖

![image-20240114151537618](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401141515657.png)

第二步：删除build配置

![image-20240114144225644](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401141442689.png)

因为我们目前是生成依赖包，而不是打包成jar，需要删掉，否则会报错

### 3. 删除启动类

因为我们是想让别人来使用的我们的starter，就不需要原本的配置启动类了。

![image-20240114144505926](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401141445967.png)

### 4. 编写配置文件

从SpringBoot里面读出相应的配置文件信息

```java
/**
 * 第三方调用客户端
 */
@Configuration
@ComponentScan
// 读取application.yml中的配置信息
@ConfigurationProperties( "fly.demo" )
@Data
public class NameClientConfig {
    private String name;

    @Bean
    public FlyClient flyClient() {
        return new FlyClient(name);
    }
}
```

对外提供服务类

```java
/**
 * 提供给用户相关的服务
 */
public class FlyClient {
    private String name;

    public FlyClient(String name) {
        this.name = name;
    }

    /**
     * 模拟方法
     * @param name
     * @return
     */
    public String getUserName(String name) {
        return "Hello " + name + " from " + this.name;
    }
}
```

### 6. 编写spring.factories

在resources里面创建spring.factories文件，编写以下配置，用于自动加载的配置类

```
org.springframework.boot.autoconfigure.EnableAutoConfiguration= com.fly.flydemosdk.NameClientConfig(这部分是自己配置所在的地址)
```

### 7. install安装

点击install安装Starter到本地依赖

![image-20240114151144935](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401141511978.png)

安装成功后可以在本地看到对应的依赖，名称就是一开始自己定义的name

![image-20240114151303055](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401141513098.png)

当然，这里也可以发布到Maven的中央仓库，让别人也能引入调用，具体步骤不多说，网上都有详细教程。

### 7. 其他项目使用

需要引入自己的本地配置好的依赖

```
<dependency>
    <groupId>com.fly</groupId>
    <artifactId>fly-demo-sdk</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

前往配置文件yml或者其他的配置文件

![image-20240114151620269](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401141516320.png)

可以看到已经识别除了对应的配置信息

### 8. 编写测试

![image-20240114152441831](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401141524889.png)

![image-20240114152454723](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401141524767.png)

很明显，输出了当前的使用者以及传入的配置参数信息

## 总体步骤如下

1. 需要一个SpringBoot项目，引入Spring-boot-configuration-processor依赖
2. 编写提供服务的接口
3. 编写客户端调用服务的类
4. 添加@ConfigurationProperies注解来标注用户再配置文件输入的提示
5. 再resources里面创建META-INFO文件夹
6. 里面编写spring.factories的配置，主要就是通过autoConfiguration来识别到对应启动的客户端
7. install来安装依赖，或者deploy来部署依赖

## 笔者项目

飞云API里面配置了对应的Starter如下，可以引入自己的项目调用接口。
具体信息请看 [飞云API](/项目实战/飞云API/飞云API.md)

```xml

<dependency>
    <groupId>io.github.flybase1</groupId>
    <artifactId>flyapi-client-sdk</artifactId>
    <version>1.0.0.Release</version>
</dependency>
```
