---
title: SpringBoot发送简单邮件
createTime: 2025/03/04 09:28:52
permalink: /article/q75zwbqy/
tags:
  - SpringBoot
  - 邮件 
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

## 1. 引入依赖

```xml

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

## 2. yml配置

```yaml
spring:
  mail:
    host: smtp.qq.com
    port: 25
    username: xxx # 邮箱账号
    password: xxx # 授权码
```

## 3. QQ邮箱授权码

在设置，账号里面，开启服务
![sbse-1](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/sbse-1.png)
生成授权码
![sbse-2](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/sbse-2.png)
发送信息
![sbse-3](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/sbse-3.png)
生成授权码（妥善保管)

## 4. 发送简单邮件service

```java
public interface MailService {
    void sendEmail();
}
```

实现类

```java

@Service
public class MailServiceImpl implements MailService {
    @Autowired
    private JavaMailSender javaMailSender;

    private String from = "xxxx";
    private String to = "xxx";
    private String subject = "测试";
    private String context = "正文";

    /**
     * 发送人
     * 接收人
     * 标题
     * 正文
     */
    @Override
    public void sendEmail() {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom(from);
        mailMessage.setTo(to);
        mailMessage.setSubject(subject);
        mailMessage.setText(context);
        javaMailSender.send(mailMessage);
    }
}
```

测试

```java

@SpringBootTest
class MailServiceImplTest {
    @Resource
    private MailServiceImpl mailService;


    @Test
    void sendEmail() {
        mailService.sendEmail();
    }
}
```

## 5. 高级版本

```java

@Service
public class MailServiceImpl implements MailService {
    @Autowired
    private JavaMailSender javaMailSender;
    // 发送方
    private String from = "xxxx";
    private String to = "xxxx";
    private String subject = "测试";
    private String context = "<a href='https://www.baidu.com'>点击获取</a>";

    @Override
    public void sendMimeEmail() {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            // 可以设置发送附件
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setSubject(subject);
            helper.setFrom(from);
            helper.setTo(to);
            // 发送链接
            helper.setText(context, true);
            // 发送附件，file地址
            File file = new File("xxxx");
            helper.addAttachment(file.getName(), file);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}
```