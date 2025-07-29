---
title: SpringBoot实现接口防抖
createTime: 2025/07/29 09:38:09
permalink: /article/mlmaqg7m/
tags:
   - 防抖
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/4a15bc0b828d64f8b45299f80d4208d.jpg
---
# 防抖机制详解：原理、场景与实现方案

在 Web 系统中，**防抖（Debounce）**是一种非常重要的用户体验与服务稳定性保障技术。它可以防止用户的重复操作或网络抖动导致的请求重复提交，从而避免生成冗余的数据记录或引发系统性能问题。

## 什么是防抖

防抖的本质是**防止相同请求在短时间内被多次执行**。它主要应用于两个层面：

- **防用户手抖**：用户可能连续点击按钮或键盘触发事件；
- **防网络抖动**：网络不稳定可能引发请求的重复发送。

在前端，常通过设置按钮的 `loading` 状态来防止重复点击。但网络层面的重复请求，仅靠前端防护是不够的，后端需要配合实现请求防重复逻辑。

一个优秀的防抖机制应具备以下特点：

- ✅ 逻辑正确
- ⚡ 响应迅速
- 🔌 易于集成
- 👁️ 良好的用户反馈机制

------

## 防抖应用场景

1. **用户输入类接口**
   - 示例：搜索框自动补全
   - 处理方式：用户停止输入一段时间后才发请求
2. **按钮点击类接口**
   - 示例：提交订单按钮
   - 处理方式：用户点击后立即锁定按钮，防止重复提交
3. **滚动加载类接口**
   - 示例：列表滚动到底自动加载更多
   - 处理方式：延迟处理滚动事件，防止接口频繁调用

------

## 如何判断重复请求

判断是否为重复请求可依据以下条件：

1. **时间间隔限制**：设置允许的最小请求间隔；
2. **请求参数对比**：对关键参数（如 `userId`、`orderNo`）进行比对；
3. **请求路径匹配**：同一 URL 与参数组合可以认为是同一请求。

------

## 防抖方案设计

### 方案一：基于共享缓存实现防抖

利用 Redis 实现幂等性判断，通过 `SETNX` 操作进行原子性加锁，若短时间内相同请求再次进入，则认为是重复请求。

![缓存方案](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250729102026108.png)

### 方案二：基于分布式锁实现防抖

使用 Redisson 的分布式锁机制，实现多实例部署场景下的防重复请求控制。

![分布式锁方案](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250729102230621.png)

------

## 具体实现

### 控制层代码示例

```java
@PostMapping("/add")
@RequiresPermissions("add")
@Log(methodDesc = "添加用户")
public ResponseEntity<String> add(@RequestBody AddReq addReq) {
    return userService.add(addReq);
}
```

### 请求参数类：`AddReq`

```java
@Data
public class AddReq {
    private String userName;
    private String userPhone;
    private List<Long> roleIdList;
}
```

------

## 注解与 Key 生成

### 注解定义

```java
@Target({ElementType.METHOD, ElementType.PARAMETER, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
public @interface RequestKeyParam {}
```

### Key 生成逻辑

比如文章提交的时候，是不可能将所有的文章内容也传递拼接到key中，我们只需要部分参数，通过解析参数或字段上的 `@RequestKeyParam` 注解，拼接生成唯一请求 Key：

```java
public class RequestKeyGenerator {
    public static String getLockKey(ProceedingJoinPoint joinPoint) {
        Method method = ((MethodSignature) joinPoint.getSignature()).getMethod();
        RequestLock requestLock = method.getAnnotation(RequestLock.class);
        Object[] args = joinPoint.getArgs();
        Parameter[] parameters = method.getParameters();

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parameters.length; i++) {
            RequestKeyParam keyParam = parameters[i].getAnnotation(RequestKeyParam.class);
            if (keyParam != null) {
                sb.append(requestLock.delimiter()).append(args[i]);
            }
        }

        if (StringUtils.isEmpty(sb.toString())) {
            Annotation[][] paramAnns = method.getParameterAnnotations();
            for (int i = 0; i < paramAnns.length; i++) {
                Object arg = args[i];
                for (Field field : arg.getClass().getDeclaredFields()) {
                    if (field.isAnnotationPresent(RequestKeyParam.class)) {
                        field.setAccessible(true);
                        sb.append(requestLock.delimiter()).append(ReflectionUtils.getField(field, arg));
                    }
                }
            }
        }

        return requestLock.prefix() + sb;
    }
}
```

------

## Redis 实现防抖

### 切面拦截器：`RedisRequestLockAspect`

```java
@Aspect
@Configuration
@Order(2)
public class RedisRequestLockAspect {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Around("@annotation(com.summo.demo.config.requestlock.RequestLock)")
    public Object interceptor(ProceedingJoinPoint joinPoint) {
        Method method = ((MethodSignature) joinPoint.getSignature()).getMethod();
        RequestLock requestLock = method.getAnnotation(RequestLock.class);
        String lockKey = RequestKeyGenerator.getLockKey(joinPoint);

        Boolean success = redisTemplate.execute((RedisCallback<Boolean>) connection ->
            connection.set(lockKey.getBytes(), new byte[0],
                Expiration.from(requestLock.expire(), requestLock.timeUnit()),
                RedisStringCommands.SetOption.SET_IF_ABSENT)
        );

        if (!Boolean.TRUE.equals(success)) {
            throw new BizException(ResponseCodeEnum.BIZ_CHECK_FAIL, "您的操作太快了，请稍后重试");
        }

        try {
            return joinPoint.proceed();
        } catch (Throwable t) {
            throw new BizException(ResponseCodeEnum.BIZ_CHECK_FAIL, "系统异常");
        }
    }
}
```

**`SET_IF_ABSENT`是 [RedisStringCommands.SetOption ](http://redisstringcommands.setoption/)枚举类中的一个选项，用于在执行 SET 命令时设置键值对的时候，如果键不存在则进行设置，如果键已经存在，则不进行设置。**

------

## Redisson 分布式锁实现

### Maven 依赖

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.10.6</version>
</dependency>
```

### 配置类：`RedissonConfig`

```java
@Configuration
public class RedissonConfig {

    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        config.useSingleServer()
              .setAddress("redis://127.0.0.1:6379")
              .setPassword("xxxx")
              .setDatabase(0)
              .setConnectionPoolSize(10)
              .setConnectionMinimumIdleSize(2);
        return Redisson.create(config);
    }
}
```

### 切面类：`RedissonRequestLockAspect`

```java
@Aspect
@Configuration
@Order(2)
public class RedissonRequestLockAspect {

    @Autowired
    private RedissonClient redissonClient;

    @Around("@annotation(com.summo.demo.config.requestlock.RequestLock)")
    public Object interceptor(ProceedingJoinPoint joinPoint) {
        Method method = ((MethodSignature) joinPoint.getSignature()).getMethod();
        RequestLock requestLock = method.getAnnotation(RequestLock.class);
        String lockKey = RequestKeyGenerator.getLockKey(joinPoint);

        RLock lock = redissonClient.getLock(lockKey);
        boolean isLocked = false;

        try {
            isLocked = lock.tryLock();
            if (!isLocked) {
                throw new BizException(ResponseCodeEnum.BIZ_CHECK_FAIL, "您的操作太快了，请稍后重试");
            }

            lock.lock(requestLock.expire(), requestLock.timeUnit());
            return joinPoint.proceed();
        } catch (Throwable t) {
            throw new BizException(ResponseCodeEnum.BIZ_CHECK_FAIL, "系统异常");
        } finally {
            if (isLocked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

**Redisson的核心思路就是抢锁，当一次请求抢到锁之后，对锁加一个过期时间，在这个时间段内重复的请求是无法获得这个锁。**

------

## 总结

| 项目       | Redis 实现         | Redisson 实现      |
| ---------- | ------------------ | ------------------ |
| 并发支持   | 较弱               | 强，适合分布式场景 |
| 实现复杂度 | 中等               | 稍高               |
| 依赖组件   | `RedisTemplate`    | `RedissonClient`   |
| 场景建议   | 单体服务或轻量应用 | 高并发、微服务架构 |