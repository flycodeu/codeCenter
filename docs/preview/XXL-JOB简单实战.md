---
title: XXL-JOB简单实战
createTime: 2025/03/04 09:28:52
permalink: /article/7gwbpyo6/
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)



## 分布式任务调度系统

分布式任务调度系统是用于协调和执行分布式场景中的任务。

> 可以理解为一个公司的老板给公司员工分配任务，保证每个人不会做重复的工作，提升效率，员工执行完任务向老板汇报。

主流的任务调度系统有 XXL-JOB，Elastic Job等等，此处使用XXL-JOB，相对简单易于使用。



## XXL-JOB

官方文档：[分布式任务调度平台XXL-JOB](https://www.xuxueli.com/xxl-job/#%E4%BA%8C%E3%80%81%E5%BF%AB%E9%80%9F%E5%85%A5%E9%97%A8)

1. 下载源码

[项目源码](https://github.com/xuxueli/xxl-job?tab=readme-ov-file)

2. 创建数据库

需要找到`doc/db/tables_xxl_job.sql`并且执行对应的sql语句

![image-20240129164930670](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401291655137.png)

3. 修改`xxl-job-admin`里面的`application`的数据库配置

4. 启动项目

访问`http://localhost:8080/xxl-job-admin`输入账号`admin`密码`123456`即可进入

![image-20240129165153062](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401291655117.png)

可以在任务管理里面新增相应的任务管理，默认的是有`测试任务`，这个是已经写好的案例，可以启动`samples`里面的`springboot`项目，即可运行。

执行任务前必须在执行器管理里面查看机器是否在线，如果不在线就无法调用ren'wu

![image-20240129171419526](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401291714616.png)

### 入门案例步骤解析

1. 引入依赖

```xml
<!-- https://mvnrepository.com/artifact/com.xuxueli/xxl-job-core -->
<dependency>
    <groupId>com.xuxueli</groupId>
    <artifactId>xxl-job-core</artifactId>
    <version>2.4.0</version>
</dependency>
```

2. 配置执行器

需要手动创建一个XXL-JOB执行器的Bean

```java
@Configuration
public class XxlJobConfig {
    private Logger logger = LoggerFactory.getLogger(XxlJobConfig.class);

    @Value("${xxl.job.admin.addresses}")
    private String adminAddresses;

    @Value("${xxl.job.accessToken}")
    private String accessToken;

    @Value("${xxl.job.executor.appname}")
    private String appname;

    @Value("${xxl.job.executor.address}")
    private String address;

    @Value("${xxl.job.executor.ip}")
    private String ip;

    @Value("${xxl.job.executor.port}")
    private int port;

    @Value("${xxl.job.executor.logpath}")
    private String logPath;

    @Value("${xxl.job.executor.logretentiondays}")
    private int logRetentionDays;


    @Bean
    public XxlJobSpringExecutor xxlJobExecutor() {
        logger.info(">>>>>>>>>>> xxl-job config init.");
        XxlJobSpringExecutor xxlJobSpringExecutor = new XxlJobSpringExecutor();
        xxlJobSpringExecutor.setAdminAddresses(adminAddresses);
        xxlJobSpringExecutor.setAppname(appname);
        xxlJobSpringExecutor.setAddress(address);
        xxlJobSpringExecutor.setIp(ip);
        xxlJobSpringExecutor.setPort(port);
        xxlJobSpringExecutor.setAccessToken(accessToken);
        xxlJobSpringExecutor.setLogPath(logPath);
        xxlJobSpringExecutor.setLogRetentionDays(logRetentionDays);

        return xxlJobSpringExecutor;
    }
}
```

3. 读取`application`配置文件

```properties
# web port
server.port=8081
# no web
#spring.main.web-environment=false
# log config
logging.config=classpath:logback.xml
### xxl-job admin address list, such as "http://address" or "http://address01,http://address02"
xxl.job.admin.addresses=http://127.0.0.1:8080/xxl-job-admin
### xxl-job, access token
xxl.job.accessToken=default_token
### xxl-job executor appname
xxl.job.executor.appname=xxl-job-executor-sample
### xxl-job executor registry-address: default use address to registry , otherwise use ip:port if address is null
xxl.job.executor.address=
### xxl-job executor server-info
xxl.job.executor.ip=
xxl.job.executor.port=9999
### xxl-job executor log-path
xxl.job.executor.logpath=/data/applogs/xxl-job/jobhandler
### xxl-job executor log-retention-days
xxl.job.executor.logretentiondays=30
```

4. 开发任务

案例里面包含了一个简单的`SampleXxlJob`循环任务类，核心注解`@XxlJob("demoJobHandler")`,我们可以开发自己的模拟任务。

开发步骤如下：官方提供

```
1、任务开发：在Spring Bean实例中，开发Job方法；
2、注解配置：为Job方法添加注解 "@XxlJob(value="自定义jobhandler名称", init = "JobHandler初始化方法", destroy = "JobHandler销毁方法")"，注解value值对应的是调度中心新建任务的JobHandler属性的值。
3、执行日志：需要通过 "XxlJobHelper.log" 打印执行日志；
4、任务结果：默认任务结果为 "成功" 状态，不需要主动设置；如有诉求，比如设置任务结果为失败，可以通过 
```

```java
@Component
public class MyJobHandler {

    @XxlJob("myJobHandler")
    public void myJobHandler() throws InterruptedException {
        Thread.sleep(3000);
        System.out.println("你好，我是fly");
    }
}
```

5. 新建任务管理配置

![image-20240129170257354](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401291702450.png)

必须要注意`JobHandler`必须和注解`@XxlJob`里面一致，然后点击操作执行，即可在控制台输出，如果希望在界面展示，必须使用`XxlJobHelper.log`

6. 查看运行报表

![image-20240129170505890](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401291705988.png)



测试过程中，可以发现即使在界面上关闭任务的执行，但是依然会执行没有完成的数据。

如果`XXL-JOB`管理系统挂了，客户端不再执行定时任务，但是客户端会依然尝试重连`XXL-JOB`管理端，等管理端重新上线后，会处理堆积请求。

### 核心原理

![image-20240129170903403](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202401291709538.png)

我们可以看到`XXL-JOB`可以看作两个部分，一个是调度中心，一个是执行器。

执行器会向调度中心注册服务，调度中心会发布任务给执行器，执行器会通过相应的日志，回调通知调度中心。

> 类似老板和员工



