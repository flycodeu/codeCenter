---
title: shiro密码加密工具
createTime: 2025/07/29 08:36:33
permalink: /article/azx2s94j/
tags:
  - shiro
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/54a61c380016520913632d86c850a39.jpg
---
# 🔐 基于 Apache Shiro 的密码加密与认证实现指南
在 Spring Security 项目中集成密码加盐加密机制，能够有效提升用户账户的安全性。本文介绍如何通过引入 Apache Shiro 实现密码的 MD5 加盐 + 多次迭代加密，并结合自定义认证逻辑完成安全登录验证。

## 一、引入 Shiro 依赖
首先，在 pom.xml 中添加 Apache Shiro 的核心依赖：
```xml
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-core</artifactId>
    <version>1.5.0</version>
</dependency>
```
shiro-core 提供了强大的加密工具类（如 SimpleHash、Md5Hash），无需完整集成 Shiro 框架即可使用其工具功能。

## 二、创建密码加密工具类
ShiroUtils.java
```java
import org.apache.shiro.crypto.hash.Md5Hash;
import org.apache.shiro.crypto.hash.SimpleHash;
import org.apache.shiro.util.ByteSource;

import java.security.SecureRandom;
import java.util.Random;

public class ShiroUtils {

    /**
     * 哈希算法名称
     */
    public final static String HASH_ALGORITHM_NAME = "MD5";

    /**
     * 哈希迭代次数
     */
    public final static int HASH_ITERATIONS = 1024;

    /**
     * 密码加密方法
     *
     * @param credentials 密码明文
     * @param saltSource  盐值（建议唯一，如用户名或随机串）
     * @return 加密后的十六进制字符串
     */
    public static String md5(String credentials, String saltSource) {
        ByteSource salt = new Md5Hash(saltSource); // 将 salt 也进行一次 MD5，增强安全性
        return new SimpleHash(HASH_ALGORITHM_NAME, credentials, salt, HASH_ITERATIONS).toString();
    }

    /**
     * 生成指定长度的随机盐值
     *
     * @param length 盐的长度
     * @return 随机盐字符串
     */
    public static String getRandomSalt(int length) {
        return getRandomString(length);
    }

    /**
     * 私有方法：生成由小写字母和数字组成的随机字符串
     *
     * @param length 字符串长度
     * @return 随机字符串
     */
    private static String getRandomString(int length) {
        String base = "abcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom(); // 使用更安全的 SecureRandom
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(base.length());
            sb.append(base.charAt(index));
        }
        return sb.toString();
    }
}
```
## 三、自定义认证逻辑（加盐密码校验）
我们通过继承 DaoAuthenticationProvider 实现自定义认证逻辑，在登录时对密码进行 加盐解密比对。

SaltAuthenticationProvider.java
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import javax.servlet.http.HttpServletRequest;

@Component
public class SaltAuthenticationProvider extends DaoAuthenticationProvider {

    private final IUserClient userClient;

    @Autowired
    public SaltAuthenticationProvider(UserDetailsService userDetailsService, IUserClient userClient) {
        setUserDetailsService(userDetailsService);
        this.userClient = userClient;
    }

    @Override
    protected void additionalAuthenticationChecks(UserDetails userDetails,
                                                  UsernamePasswordAuthenticationToken authentication)
            throws AuthenticationException {

        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

        // 获取租户标识（Header 或 参数）
        String headerTenant = request.getHeader(TokenUtil.TENANT_HEADER_KEY);
        String paramTenant = request.getParameter(TokenUtil.TENANT_PARAM_KEY);

        if (StringUtil.isAllBlank(headerTenant, paramTenant)) {
            throw new UserDeniedAuthorizationException(TokenUtil.TENANT_NOT_FOUND);
        }

        String tenantId = headerTenant != null ? headerTenant : paramTenant;

        if (authentication.getCredentials() == null) {
            logger.debug("Authentication failed: no credentials provided");
            throw new BadCredentialsException(messages.getMessage("AbstractUserDetailsAuthenticationProvider.badCredentials", "Bad credentials"));
        }

        // 查询用户盐值
        String salt = userClient.userByAccount(tenantId, userDetails.getUsername())
                               .getData()
                               .getSalt();

        if (salt == null) {
            throw new BadCredentialsException("User salt not found.");
        }

        // 对输入密码进行解码（Base64）并加密比对
        String presentedPassword = authentication.getCredentials().toString();
        String decodedPassword = Base64Util.decode(presentedPassword); // 假设前端传的是 Base64 编码密码
        String encodedPassword = ShiroUtils.md5(decodedPassword, salt);

        // 与数据库中存储的加密密码比对
        if (!encodedPassword.equals(userDetails.getPassword())) {
            logger.debug("Authentication failed: password does not match stored value");
            throw new BadCredentialsException("Invalid credentials");
        }
    }
}
```
核心流程说明：

获取租户信息：支持从 Header 或 URL 参数中读取 tenantId，用于多租户场景。

获取用户 salt：通过 IUserClient 调用服务获取该用户的唯一 salt。
密码处理：

解码前端传来的 Base64 密码（可选）

使用 ShiroUtils.md5(password, salt) 进行加盐加密

密码比对：与数据库中存储的加密密码对比，一致则认证成功。

## 四、数据库设计建议
| 字段名 | 说明 |
|------|------|
| **password** | 存储 ShiroUtils.md5(明文, salt) 的结果 |
| **salt** | 存储 ShiroUtils.getRandomSalt(16) 生成的随机盐 |


明文密码：123456
salt：a3k9m2x8z1p5q7r6
存储密码：e99a18c428cb38d5f260853678922e03（MD5+1024次迭代）
