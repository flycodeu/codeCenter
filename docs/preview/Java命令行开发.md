---
title: Java命令行开发
createTime: 2025/03/04 09:28:52
permalink: /article/4bdqwgi4/
tags:
  - SpringBoot
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

# 1. 如何开发一个java命令行程序
首先想到的是通过`Scanner`，获取到用户在命令好界面输入的内容，然后解析对应的内容，执行相应的命令。但是有一些缺点

1. 需要解析用户的输入

例如我们常用的mysql登录,`mysql -u xxx -p `，我们需要先提取参数，然后再执行，如果这个命令较为复杂，一个主命令下面有多个子命令，那么如何从复杂的命令提取相应的值？

2. 如何进行与用户的交互

例如我们登录数据库的时候，我们的密码可以不输入在一行里面，然后命令行给出提示输入缺少的参数，然后继续执行命令。

3. 高级命令

比如`git --help`等等，我如何配置自己的命令行能够支持帮助命令，颜色高亮等等内容。

很显然，这种方式缺点较多。



这边收集了一部分可以支持开发的工具，第三方库

1. 命令行开发框架

> 专门用于开发命令行的框架

[Picocli](https://github.com/remkop/picocli) : 支持帮助手册，颜色高亮，子命令等等功能，而且作者持续更新内容

2. 控制台输入处理库

> 能够对用户的输入进行处理的库

[Jline](https://github.com/jline/jline3): 支持自动补全，查看历史命令等等，但是缺点是官方文档内容较少。

3. 命令行解析库

> 支持对命令行进行解析取值的库

[JCommander](https://github.com/cbeust/jcommander): 注解驱动，可以将命令映射到对象上面去

[Apache Commons CLI](https://github.com/apache/commons-cli): 学习简单，使用容易，但是功能不多，参考地址[https://blog.csdn.net/liuxiangke0210/article/details/78141887](https://blog.csdn.net/liuxiangke0210/article/details/78141887)



相对而言Picocli更加好一点，毕竟是专业的命令行开发框架，所以接下来笔者会学习使用这个框架。

# 2. 入门Demo

需要一个Maven项目
学习地址: [https://picocli.info/quick-guide.html](https://picocli.info/quick-guide.html)

## 1. 引入依赖

```xml
<!-- https://mvnrepository.com/artifact/info.picocli/picocli -->
<dependency>
    <groupId>info.picocli</groupId>
    <artifactId>picocli</artifactId>
    <version>4.7.5</version>
</dependency>
```

## 2. 引入官方Demo样例
对于官方案例稍微改进一点
```java
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;
import java.util.Arrays;

@Command( name = "ASCIIArt", version = "ASCIIArt 1.0", mixinStandardHelpOptions = true )
public class ASCIIArt implements Runnable {

    @Option( names = {"-s", "--font-size"}, description = "Font size" )
    int fontSize = 19;

    @Parameters( paramLabel = "<word>", defaultValue = "Hello, picocli",
            description = "Words to be translated into ASCII art." )
    private String[] words = {"Hello,", "picocli"};

    @Override
    public void run() {
        System.out.println("font size:" + fontSize);
        System.out.println("words: " + Arrays.toString(words));
    }

    public static void main(String[] args) {
        int exitCode = new CommandLine(new ASCIIArt()).execute(args);
        System.exit(exitCode);
    }
}
```
## 3. 运行

![image-20231230114729912](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301147048.png)

因为这里我们没有给对应的输入，所以输出的是默认值，这里有两种方法可以模拟命令行

### 1. 修改运行配置

需要点击当前文件的配置

![image-20231230114953715](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301149784.png)

![image-20231230115112863](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301151955.png)

在程序实参里面输入对应的命令，例如  -s 20 test，重新运行就可以了。

### 2. 修改传入的Args参数

```java
   public static void main(String[] args) {
        String myArgs[] = {"-s", "10"};
        int exitCode = new CommandLine(new ASCIIArt()).execute(myArgs);
        System.exit(exitCode);
    }
```



## 4.详细讲解

![image-20231230120126939](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301201014.png)

以上内容官方是分成了8个部分

1. 实现Runnable或者Callable接口，可以看做一个命令。
2. @Command来标记这个类并且可以命名这个类的命令名，mixinStandardHelpOptions =true 可以开启帮助文档，可以给当前的应用程序添加对应的`–-help`和`--version`。
3. @Option可以设置字段为命令行选项，也可以设置对应的名称和描述信息。
4. @Paramters可以设置字段为命令行的参数。
5. 可以将命令行参数转换为强类型的值，并将这些值注入带注释的字段中。
6. 实现对应的接口的方法，执行相应的业务。
7. CommandLine.execute方法返回退出代码。
8. 应用程序可以使用此退出代码调用System.exit，以向调用进程发出成功或失败的信号。



# 3. 实用功能

## 1.  帮助手册

```java
@Command( name = "ASCIIArt", version = "ASCIIArt 1.0", mixinStandardHelpOptions = true )
```

里面可以指定对应的名称，版本，以及对应是否需要开启help文档，开启后可以通过`--help`获取所有的参数，选项列表，这个功能在很多命令行里面都有，比如git等等，可以帮助用户了解更多内容。

![image-20231230132745363](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301327416.png)

格式 `ASCIIArt -- help`。

## 2. 命令解析@Option

![Example command with annotated @Option and @Parameters](https://picocli.info/images/OptionsAndParameters2.png)

```java
@Option( names = {"-s", "--font-size"}, description = "Font size" ,required=true)
```

这个一般用于解析选项，用户可以输入`-s`也可以输入`--font-size`。 可以指定对应的参数的英文名，描述信息，是否必须填入，是否有默认值等等。这个Option是支持多值选项，只需要将对象属性设置为数组类型即可。

![image-20231230133245415](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301332470.png)

所有的选项如下

![image-20231230132644954](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301326013.png)

格式 `ASCIIArt -s 20` 

其中需要注意的是arity，这个能够指定每个选项可以接受的参数个数，后面会提及

## 3. 命令解析@Parameters

```java
@Parameters( paramLabel = "<word>", defaultValue = "Hello, picocli",
        description = "Words to be translated into ASCII art." )
```

这个就是对应的参数值，用于解析命令输入。

![image-20231230133423903](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301334961.png)

格式`ASCIIArt xxx`。

其中需要注意的是echo和arity两个配置，arity这个能够指定每个选项可以接受的参数个数，echo主要是设置用户是否能够看到对应的输入，如果是较早于4.6的picocli通过jar运行命令的时候是看不见用户输入的，现在可以通过echo=true让用户看见自己的输入数据。



## 4. 交互式命令

### 1. 单个交互式命令

上面option里面有一个参数是**interactive**，只要这个参数设置为true就能实现交互式命令，下面写一个模拟登录的命令。

```java
@CommandLine.Command( name = "login", mixinStandardHelpOptions = true )
public class LoginDemo implements Callable<Integer> {

    @CommandLine.Option( names = "-u", required = true, description = "用户名" )
    private String username;

    @CommandLine.Option( names = "-p", required = true, description = "密码", interactive = true )
    private String password;

    @Override
    public Integer call() throws Exception {
        System.out.println("password: " + password);
        return 0;
    }

    public static void main(String[] args) {
        String[] myArgs = {"-u", "user", "-p"};
        int exitCode = new CommandLine(new LoginDemo()).execute(myArgs); // 自动生成帮助信息
    }
}
```

这边我是直接将部分参数，选项写入里面去的，所以只需要命令行输入密码就可以。

![image-20231230135116188](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301351254.png)

可以看出已经有了交互式内容

### 2. 多个交互命令

加入我现在有多个命令需要交互输入，比如我添加了校验密码

```java
    @CommandLine.Option( names = "-cp", required = true, description = "校验密码", interactive = true )
    private String checkPassword;

    @Override
    public Integer call() throws Exception {
        System.out.println("password: " + password);
        System.out.println("checkPassword: " + checkPassword);
        return 0;
    }
```

![image-20231230135421915](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301354995.png)

但是运行的是否并不会走下一个交互命令，我里面加了`required = true`所以直接报错，不然就是checkPassword为空，也就是说不会进行交互。但是我将checkpassword的交互命令写入，就能继续执行了。

![image-20231230135721205](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301357274.png)

很显然这里是存在一点问题的，如果这个命令参数是强制需要输入的，那么用户必须填，但是如果不是强制输入的，那么用户可以不填，所以这边需要分成两种情况。

#### 1. 可选交互式

官方讲解地址[https://picocli.info/#_optionally_interactive](https://picocli.info/#_optionally_interactive)

用户直接在命令行输入一长串命令不需要进行交互

```java
        String[] myArgs = {"-u", "user", "-p", "123", "-cp", "123"};
```

上面就是模拟长串命令，但是这里存在一点问题，会出现参数不匹配的问题。

![image-20231230140615068](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301406126.png)

因为是给完整命令填充参数，默认的参数个数是0，需要修改arity的参数范围0..1表示0-1个参数都是可以的，既能满足交互式，也能满足填充数据方式。

```java
@CommandLine.Option( arity = "0..1",names = "-p", description = "密码", interactive = true )
private String password;
```

> arity [https://picocli.info/#_arity](https://picocli.info/#_arity)

一般建议给所有的选项设置为0..1

现在我只需要输入检验密码，password已经在命令行里面设置好了

![image-20231230141349891](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301413968.png)

#### 2. 强制交互式

官方也是有对应的讲解[https://picocli.info/#_forcing_interactive_input](https://picocli.info/#_forcing_interactive_input)

```java
@Command
public class Main implements Runnable {
    @Option(names = "--interactive", interactive = true)
    String value;

    public void run() {
        if (value == null && System.console() != null) {
            // alternatively, use Console::readPassword
            value = System.console().readLine("Enter value for --interactive: ");
        }
        System.out.println("You provided value '" + value + "'");
    }

    public static void main(String[] args) {
        new CommandLine(new Main()).execute(args);
    }
}
```

就是命令提交后，然后手动判断，如果没有对应的命令，就提示用户输入，但是这边就来了一个问题，当初就是不希望编写通过读取命令行输入的方式来判断的相关代码，现在还是需要重新去判断，编写对应的业务。

这里了解一种方案，就是编写一套通用的校验程序，如果用户输入命令没有交互式选项，那么就自动输入命令补充该选项。可以通过反射编写一个工具类实现。

主要是判断args里面是否存在对应的选项，如果不存在就给数组增加选项

```java
public class OptionUtil {
    public static String[] processInteractiveOptions(Class<?> clazz, String[] args) {
        // 将传递过来的数组转成集合，方便添加
        Set<String> argSet = new LinkedHashSet<>(Arrays.asList(args));

        // 获取字段的Option注解
        for (Field field : clazz.getDeclaredFields()) {
            // 如果注解存在且其interactive属性为true，则执行以下操作
            Option option = field.getAnnotation(Option.class);
            if (option != null && option.interactive()) {
                // 如果传递的参数中没有该属性，则添加
                if (!argSet.contains(option.names()[0])) {
                    argSet.add(option.names()[0]);
                }
            }
        }
        args = argSet.toArray(new String[0]);
        return args;
    }
} 
```

使用

```java
public static void main(String[] args) throws IllegalAccessException {
    String[] myArgs = {"-u", "user", "-cp", "123"};
    new CommandLine(new LoginDemo()).execute(OptionUtil.processInteractiveOptions(LoginDemo.class, myArgs));
}
```

上面我没输入密码，意味着密码需要用户输入

![image-20231230151301228](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312301513314.png)

总体上能够实现功能。



## 5.子命令

子命令是指命令中又包含一组命令，相当于命令的分组嵌套，适用于功能较多、较为复杂的命令行程序，比如 git、docker 命令等 在 Picocli 中，提供两种设置子命令的方式。 

- 声明式 通过 @Command 注解的 subcommands 属性来给命令添加子命令，更直观清晰。 

```java
@Command(subcommands = {
    GitStatus.class,
    GitCommit.class,
    GitAdd.class,
    GitBranch.class,
    GitCheckout.class,
    GitClone.class,
    GitDiff.class,
    GitMerge.class,
    GitPush.class,
    GitRebase.class,
    GitTag.class
})
```

- 编程式 在创建 CommandLine 对象时，调用 addSubcommand 方法来绑定子命令，更灵活。 

```java
CommandLine commandLine = new CommandLine(new Git())
        .addSubcommand("status",   new GitStatus())
        .addSubcommand("commit",   new GitCommit())
        .addSubcommand("add",      new GitAdd())
        .addSubcommand("branch",   new GitBranch())
        .addSubcommand("checkout", new GitCheckout())
        .addSubcommand("clone",    new GitClone())
        .addSubcommand("diff",     new GitDiff())
        .addSubcommand("merge",    new GitMerge())
        .addSubcommand("push",     new GitPush())
        .addSubcommand("rebase",   new GitRebase())
        .addSubcommand("tag",      new GitTag());
```

- 实战

示例程序：支持增加、删除、查询 3个子命令，并传入不同的 args 来测试效果

```java
@CommandLine.Command(name = "main", mixinStandardHelpOptions = true)
public class SubCommandExample implements Runnable {

    @Override
    public void run() {
        System.out.println("执行主命令");
    }

    @CommandLine.Command(name = "add", description = "增加", mixinStandardHelpOptions = true)
    static class AddCommand implements Runnable {
        @Override
        public void run() {
            System.out.println("执行增加命令");
        }
    }

    @CommandLine.Command(name = "delete", description = "删除", mixinStandardHelpOptions = true)
    static class DeleteCommand implements Runnable {
        @Override
        public void run() {
            System.out.println("执行删除命令");
        }
    }

    @CommandLine.Command(name = "query", description = "查询", mixinStandardHelpOptions = true)
    static class QueryCommand implements Runnable {
        @Override
        public void run() {
            System.out.println("执行查询命令");
        }
    }

    public static void main(String[] args) {
        // 执行主命令
        String[] myArgs = new String[]{};
        // 查看主命令的帮助手册
//        String[] myArgs = new String[]{"--help"};
        // 执行增加命令
//        String[] myArgs = new String[]{"add"};
        // 执行删除命令的帮助手册
//        String[] myArgs = new String[]{"delete", "--help"};
        // 执行不存在的命令，会报错
//        String[] myArgs = new String[]{"update"};

        int exitCode = new CommandLine(new SubCommandExample())
                .addSubcommand(new AddCommand())
                .addSubcommand(new DeleteCommand())
                .addSubcommand(new QueryCommand())
                .execute(myArgs);
        System.exit(exitCode);
    }
}
```
