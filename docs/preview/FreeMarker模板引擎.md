---
title: FreeMarker模板引擎
createTime: 2025/03/04 09:28:52
permalink: /article/3li9kv1d/
tags:
   - FreeMarker
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

## 背景

目前笔者正在如何制作一个模板文件，只需要根据用户需求替换部分代码内容。例如下面代码，分别使用三个todo表示要替换的地方。

```java
/**
 * ACM 输入模板（多数之和）
 * todo @author {}
 */
public class MainTemplate {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("输入元素个数：");
        //todo 取消循环
        while (scanner.hasNext()) {
            // 读取输入元素个数
            int n = scanner.nextInt();
            // 读取数组
            System.out.println("输入元素：");
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) {
                arr[i] = scanner.nextInt();
            }
            // 处理问题逻辑，根据需要进行输出
            // 示例：计算数组元素的和
            int sum = 0;
            for (int num : arr) {
                sum += num;
            }
            // todo 重构输出  System.out.println("求和结果: " + sum);
            System.out.println("Sum: " + sum);
        }
        scanner.close();
    }
}
```

1. 修改作者名字
2. 判断是否需要循环
3. 判断是否需要修改输出语句

如果是单纯修改字符串那么可以自己写一套规则然后进行替换，但是一旦遇到比如是否需要循环等复杂条件的时候，这种方法就不行了
，而且一旦修改的东西多了，整体上自己写就很麻烦，所以这里直接考虑使用模板引擎，使用现成的技术来实现需求。

## FreeMarker

### 什么是模板引擎

模板引擎主要是分成两个部分，一个部分是制定好的模板，另一个部分是数据，两者相互结合输出相应的结果。

典型的模板引擎有Thymeleaf，FreeMaker等等。

优点：

1. 将模板和数据分离，不需要关心其他内容，有点像前后端的分工协作。
2. 定义好了现成的模板语法规则，不需要自己编写。
3. 有一些安全特性，虽然目前没有太大的感觉。

### FreeMarker网站

FreeMarker主要优点是不会和其他框架绑定，是个Java项目就可以使用。

官方网站 [https://freemarker.apache.org/docs/dgui_quickstart.html](https://freemarker.apache.org/docs/dgui_quickstart.html)
，缺点是都是英文，但是有详细示例，可以看懂

中文网站
[http://www.freemarker.net/#1](http://www.freemarker.net/#1)   
[http://freemarker.foofun.cn/index.html](http://freemarker.foofun.cn/index.html)

基本上不需要特地的去学习，看一下相关知识就可以了。



### FreeMarker实战Demo

1. 首先需要创建一个Maven项目，引入对应的依赖

```xml
<!--http://www.freemarker.net/#1-->
<dependency>
   <groupId>org.freemarker</groupId>
   <artifactId>freemarker</artifactId>
   <version>2.3.32</version>
</dependency>
```

2. 创建ftl文件

![image-20231229113338197](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/202312291133326.png)

写入如下代码，看起来和Thymeleaf一样，语法这一块就没什么太大好说的。例如插槽${},#list，直接看官方文档就好

```htm
<html>
<head>
    <title>Welcome to FlyCode 编程</title><br>
</head>
<body>
<#-- 注释部分 -->
<#-- 下面使用插值 -->
<h1>Welcome ${user} !</h1><br>
<u1>
    <#-- 使用FTL指令 -->
    <#list menuItems as item><br>
        <li><a href="${item.url}">${item.label}</a></li>
    </#list>
</u1>
<footer>
    ${currentYear}
</footer>
</body>
</html>
```

其中传递的数据格式是Json形式的

```json
{
  "user": "fly",
  "menuItems": [
    {
      "url": "https://www.baidu.com",
      "label": "百度"
    },
    {
      "url": "https://www.baidu.com",
      "label": "百度"
    }
  ],
  "currentYear": "2023"
}
```

3. 编写配置，没什么好说的，要修改的只有文件地址，以及传递数据，数据是上面Json形式的转换为map存储

```java
    public void testFreeMarkerConfig() throws IOException, TemplateException {
        // 第一步：创建一个Configuration对象，直接new一个对象。构造方法的参数就是FreeMarker对于的版本号。
        Configuration configuration = new Configuration(Configuration.VERSION_2_3_21);
        // 第二步：设置模板文件所在的路径。
        configuration.setDirectoryForTemplateLoading(new File("src/main/resources/templates"));
        // 第三步：设置模板文件使用的字符集。一般就是utf-8.
        configuration.setDefaultEncoding("utf-8");

        // 第四步：加载模板文件，创建一个模板对象。
        Template template = configuration.getTemplate("myweb.html.ftl");

        // 第五步：创建一个模板使用的数据集，可以是pojo也可以是map。一般是Map。
        HashMap<String, Object> model = new HashMap<>();
        model.put("user", "fly");
        model.put("currentYear", 2023);

        List<HashMap<String, Object>> menuList = new ArrayList<>();
        HashMap<String, Object> menuItem1 = new HashMap<>();
        menuItem1.put("url", "https://www.baidu.com");
        menuItem1.put("label", "百度一下");

        HashMap<String, Object> menuItem2 = new HashMap<>();
        menuItem2.put("url", "https://www.flycode.icu");
        menuItem2.put("label", "飞云编程");
        menuList.add(menuItem1);
        menuList.add(menuItem2);
        model.put("menuItems", menuList);

        // 第六步：创建一个Writer对象，一般创建FileWriter对象，指定生成的文件名。
         // 文件不存在
        if (!FileUtil.exist(outputPath)){
            FileUtil.touch(outputPath);
        }
        Writer out = new FileWriter("myweb.html");

        // 第七步：调用模板对象的process方法输出文件。
        template.process(model, out);

        // 第八步：关闭流。
        out.close();
    }
}
```

4. 运行成功

![image-20231229120522799](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312291205903.png)

![image-20231229120540860](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312291205951.png)

5. 存在问题，很显然上面的2,023不是我们需要的，我们需要的是2023，这个直接看官方文档即可，修改对应的number格式

[http://freemarker.foofun.cn/app_faq.html#faq_number_grouping](http://freemarker.foofun.cn/app_faq.html#faq_number_grouping)

主要是不同的国家这个表示不一样而已。

```java
cfg.setNumberFormat("0.######")
```



### 常用语法

1. 插值

```
${100 + money}
```

2. 分支判断

```
<#if user == "fly">
  fly
<#else>
  dogfly
</#if>
```

3. 默认值

```
${user!"用户为空"}
```

4. 循环

```
<#list users as user>
  ${user}
</#list>
```

5.  宏定义

```
<#macro card userName>     
---------    
${userName}
---------
</#macro>
```

使用

```
<@card userName="fly"/>
```



其余的直接查看对应的官方文档就可以，这边是几个比较常用的语法。



### 回归背景

以上就是简单的官方示例，那么这个应该如何用于解决背景里面的相关问题，重新回顾一下上面的问题

1. 添加作者
2. 修改循环条件（可选）
3. 修改输出信息

很明显 1，3是String类型的，而控制循环条件是判断条件，使用布尔值，于是可以定义对应的实体类

1. 创建实体类

![image-20231229144721488](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312291447591.png)

2. 创建MainTemplate对应的ftl文件

实际就是替换，对于循环可能麻烦一点，就是需要使用if判断是否需要循环。吐槽一下这个代码因为没有对应的ftl格式，所以编辑器会乱排序，不太美观。

```java
import java.util.Scanner;

/**
* ACM 输入模板（多数之和）
* @author ${author}
*/
public class MainTemplate {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("输入元素个数：");
<#if loop>
        while (scanner.hasNext()) {
</#if>

            // 读取输入元素个数
            int n = scanner.nextInt();
            // 读取数组
            System.out.println("输入元素：");
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) {
                arr[i] = scanner.nextInt();
            }

            // 处理问题逻辑，根据需要进行输出
            // 示例：计算数组元素的和
            int sum = 0;
            for (int num : arr) {
                sum += num;
            }

            System.out.println("${outputText}" + sum);
<#if loop>
    }
</#if>
            scanner.close();
    }
}

```

3. 编写配置

所有的配置基本一致，除了第四步加载模板文件，第五步创建数据集，和第六步输出的名称不一样之外，其余都是一样的

```java
        // 第四步：加载模板文件，创建一个模板对象。
        Template template = configuration.getTemplate("MainTemplate.java.ftl");
        // 第五步：创建一个模板使用的数据集，可以是pojo也可以是map。一般是Map。
        MainTemplateConfig model = new MainTemplateConfig();
        model.setAuthor("flycode");
        model.setOutputText("求和: ");
        model.setLoop(false);
        // 第六步：创建一个Writer对象，一般创建FileWriter对象，指定生成的文件名。
        Writer out = new FileWriter("MainTemplate.java");
```

4. 生成文件

![image-20231229145450760](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312291454866.png)

很明显添加了作者，移除了循环，修改了输出，基本上完成对应的要求

### 潜在问题

1. 文件路径
关于这个配置的file目录可能会存在部分问题，之前直接用的相对路径没出问题，但是可能有的时候使用会出现问题找不到对应的路径，需要传递一个完整的当前项目路径(
user.dir获取)+相对路径进行拼接

```java
        String projectPath = System.getProperty("user.dir") ;
        File parentFile = new File(projectPath);
        File file = new File(parentFile, "src/main/resources/templates");
        configuration.setDirectoryForTemplateLoading(file);
```

2. 目前健壮性不行，如果没有传递对应的值会报错，为了解决这个问题，有两种方案

    1. 模板里面使用对应的!语法

   ```java
    @author ${author!'fly'}
   ```

    2. java写好（推荐）

   ```java
   /**
    * 作者注释
    */
   private String author = "fly";
   
   /**
    * 输出文字
    */
   private String outputText = "sum= ";
   /**
   * 是否循环
   */
   private Boolean loop = true;
   ```



### 通用方法

这个完全可以抽象出对应方法，通用方法，唯一需要传递的是输入路径，输出路径，数据

```java
    public static void main(String[] args) throws IOException, TemplateException {
        String projectPath = System.getProperty("user.dir") ;
        String inputPath = projectPath + File.separator + "src/main/resources/templates/MainTemplate.java.ftl";
        String outputPath = projectPath + File.separator + "MainTemplate.java";
        MainTemplateConfig model = new MainTemplateConfig();
        doGenerate(inputPath, outputPath, model);
    }    
	public static void doGenerate(String inputPath, String outputPath, Object model) throws IOException, TemplateException {
        // 第一步：创建一个Configuration对象，直接new一个对象。构造方法的参数就是FreeMarker对于的版本号。
        Configuration configuration = new Configuration(Configuration.VERSION_2_3_21);
        // 第二步：设置模板文件所在的路径。
        File templateDir = new File(inputPath).getParentFile();
        configuration.setDirectoryForTemplateLoading(templateDir);
        // 第三步：设置模板文件使用的字符集。一般就是utf-8.
        configuration.setEncoding(Locale.CANADA, "UTF-8");
        // 第四步：加载模板文件，创建一个模板对象。
        String templateName = new File(inputPath).getName();
        Template template = configuration.getTemplate(templateName);
        // 第五步：创建一个模板使用的数据集，可以是pojo也可以是map。一般是Map。
        // 第六步：创建一个Writer对象，一般创建FileWriter对象，指定生成的文件名。
        // 文件不存在
        if (!FileUtil.exist(outputPath)){
            FileUtil.touch(outputPath);
        }
        Writer out = new FileWriter(outputPath);
        // 第七步：调用模板对象的process方法输出文件。
        template.process(model, out);
        // 第八步：关闭流。
        out.close();
    }
}
```

### 这里可能会有中文乱码
可以改成如下
```java
Template template = configuration.getTemplate(templateName,"utf-8");
BufferedWriter out = new BufferedWriter(new OutputStreamWriter(Files.newOutputStream(Paths.get(outputPath)), StandardCharsets.UTF_8));
```

# 重点
这个网站[http://freemarker.foofun.cn/app_faq.html#faq_number_grouping](http://freemarker.foofun.cn/app_faq.html#faq_number_grouping)
如果之后有问题，大部分都可以在这里解决，找到答案
