---
title: SpringBoot自定义实现日志记录
createTime: 2025/03/04 09:28:52
permalink: /article/crg94zm6/
tags:
  - SpringBoot
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)



## 创建logs表

```sql
CREATE TABLE `logs` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `operateUserId` bigint NOT NULL COMMENT '操作者id',
  `operateTime` varchar(255) DEFAULT NULL COMMENT '操作时间',
  `className` varchar(255) DEFAULT NULL COMMENT '操作类名',
  `methodName` varchar(255) DEFAULT NULL COMMENT '操作方法名',
  `methodParams` varchar(255) DEFAULT NULL COMMENT '操作方法参数',
  `returnValue` varchar(1024) DEFAULT NULL COMMENT '操作方法返回值',
  `costTime` varchar(255) DEFAULT NULL COMMENT '操作耗时',
  `ip` varchar(255) DEFAULT NULL COMMENT '用户ip',
  `logType` varchar(255) DEFAULT NULL COMMENT '日志类型',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='操作日志'

```

## 创建实体

```java
package com.sky.pono.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.io.Serializable;

import lombok.Data;

/**
 * 操作日志
 *
 * @TableName logs
 */
@TableName(value = "logs")
@Data
public class Logs implements Serializable {
    /**
     * 主键id
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 操作者id
     */
    private Long operateuserid;

    /**
     * 操作时间
     */
    private String operatetime;

    /**
     * 操作类名
     */
    private String classname;

    /**
     * 操作方法名
     */
    private String methodname;

    /**
     * 操作方法参数
     */
    private String methodparams;

    /**
     * 操作方法返回值
     */
    private String returnvalue;

    /**
     * 操作耗时
     */
    private String costtime;

    private String ip;

    private String logtype;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
```

## 注解Log

```java
import com.sky.enumeration.OperationType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 自定义注解
 */
@Retention(RetentionPolicy.RUNTIME)//运行时有效
@Target(ElementType.METHOD)//作用在方法上
public @interface Log {
    //数据库操作类型
    OperationType value();
}

```

## 操作类型

```java
package com.sky.enumeration;

/**
 * 数据库操作类型
 */
public enum OperationType {

    /**
     * 更新操作
     */
    UPDATE,

    /**
     * 插入操作
     */
    INSERT,

    SELECT,

    DELETE,
    UPLOAD,
    LOGIN,
    LOGOUT

}

```

## 获取Ip

```java
package com.sky.utils;

import javax.servlet.http.HttpServletRequest;

/**
 * IP工具类
 */
public class IpUtils {

    public static String getIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Forwarded-For");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }

        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip;
    }

}
```

## 执行切面方法

```java
package com.sky.utils;

import cn.hutool.core.thread.ThreadUtil;
import com.alibaba.fastjson.JSONObject;
import com.sky.annotation.Log;
import com.sky.constant.JwtClaimsConstant;
import com.sky.context.BaseContext;
import com.sky.enumeration.OperationType;
import com.sky.pono.entity.Logs;
import com.sky.properties.JwtProperties;
import com.sky.service.impl.LogsServiceImpl;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.Arrays;

@Aspect
@Component
@Slf4j
public class LogAsper {
    @Autowired
    private LogsServiceImpl logsService;
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private JwtProperties jwtProperties;


    @Around("@annotation(com.sky.annotation.Log)")//匹配加了Log注解的方法
    public Object recordLog(ProceedingJoinPoint joinPoint) throws Throwable {
        //方法开始前的操作
        Logs logs = new Logs();
        String token;

        token = request.getHeader(jwtProperties.getAdminTokenName());

        Object result = joinPoint.proceed();

        try {
            log.info("jwt校验:{}", token);
            Claims claims = JwtUtil.parseJWT(jwtProperties.getAdminSecretKey(), token);
            Long userId = Long.valueOf(claims.get(JwtClaimsConstant.EMP_ID).toString());
            log.info("当前用户的id：{}", userId);
            BaseContext.setCurrentId(userId);
            // 1. 获取用户id
            logs.setOperateuserid(userId);
            // 2 设置操作时间
            logs.setOperatetime(LocalDateTime.now().toString());
            //获取操作类名
            logs.setClassname(joinPoint.getTarget().getClass().getName());
            //获取操作方法名
            logs.setMethodname(joinPoint.getSignature().getName());
            //获取操作方法参数
            logs.setMethodparams(Arrays.toString(joinPoint.getArgs()));
            //获取开始时间
            long begin = System.currentTimeMillis();
            //获取操作方法返回值
            //String returnValue = JSONObject.toJSONString(result);
            //logs.setReturnvalue(returnValue.toString());
            //获取操作结束时间
            long end = System.currentTimeMillis();
            //获取操作耗时
            logs.setCosttime(String.valueOf(end - begin));

            logs.setIp(IpUtils.getIpAddr(request));
            // 获取方法上的@Log注解
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            Log logAnnotation = method.getAnnotation(Log.class);
            if (logAnnotation != null) {
                OperationType operationType = logAnnotation.value();
                // 设置操作类型到日志实体中
                logs.setLogtype(operationType.toString());
            }
            // 异步保存
            ThreadUtil.execAsync(() -> {
                boolean save = logsService.save(logs);
                if (!save) {
                    log.info("日志记录失败");
                }
            });
        } catch (Exception ex) {
            log.info("jwt校验失败:{}", token, ex);
        }
        return result;

    }
}
```

