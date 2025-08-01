---
title: AOP实现权限校验
createTime: 2025/07/31 13:19:43
permalink: /article/mo15146q/
tags:
  - AOP
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/71fee2c9e637523ffccafa3a45d0c968.jpg
---
在实际开发中，我们常常需要对接口进行权限控制。传统做法是在方法内部进行权限判断，这样做不仅代码冗余、耦合度高，还违背了单一职责原则。为了解耦权限逻辑与业务代码，我们可以借助 AOP（面向切面编程） 实现权限校验，搭配自定义注解，使权限控制更加灵活优雅。

## 一、什么是 AOP？
AOP（Aspect Oriented Programming），即面向切面编程，是 Spring 框架中用于封装横切关注点（如日志、事务、安全等）的一种技术。

简单来说，它可以在不修改原始业务逻辑的前提下，对方法的执行过程进行增强，如：

- 方法执行前后插入逻辑
- 异常处理
- 条件拦截执行等

## 二、自定义注解的原理
自定义注解是 Java 提供的一种元编程方式，可以在代码中通过标记注解，传递元信息。结合 AOP，我们可以读取这些注解，并据此决定是否拦截某个方法、执行特定逻辑，从而实现解耦和代码复用。

## 三、代码实现，引入 AOP 依赖
首先需要在 pom.xml 中引入 Spring AOP 的依赖：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```
## 四、编写权限注解
我们自定义一个注解 @AuthCheck，用于标记需要权限校验的方法：
```java
/**
* 权限校验注解
*
* 用于指定访问该方法所必须拥有的角色。
*/
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuthCheck {

    /**
    * 指定访问该方法所需的角色，例如：admin
    */
    String mustRole() default "";
}
```      
使用时，只需在方法上加上 @AuthCheck(mustRole = "admin") 即可。

## 五、实现权限拦截器（切面类）
创建一个切面类 AuthInterceptor，用于在方法执行前进行权限校验：
```java
@Aspect
@Component
public class AuthInterceptor {

    @Resource
    private UserService userService;

    /**
     * 环绕通知，拦截标记了 @AuthCheck 注解的方法
     *
     * @param joinPoint  切入点
     * @param authCheck  注解信息
     */
    @Around("@annotation(authCheck)")
    public Object doInterceptor(ProceedingJoinPoint joinPoint, AuthCheck authCheck) throws Throwable {
        String mustRole = authCheck.mustRole();
        RequestAttributes requestAttributes = RequestContextHolder.currentRequestAttributes();
        HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();

        // 获取当前登录用户
        User loginUser = userService.getCurrentLoginUser(request);

        // 将注解中的角色值转为枚举
        UserRoleEnum mustRoleEnum = UserRoleEnum.getUserRoleByValue(mustRole);

        // 如果注解未指定角色，直接放行
        if (mustRoleEnum == null) {
            return joinPoint.proceed();
        }

        // 获取当前用户的角色
        UserRoleEnum userRoleEnum = UserRoleEnum.getUserRoleByValue(loginUser.getUserRole());

        // 若用户无权限，抛出异常
        if (userRoleEnum == null) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }

        // 若要求管理员权限，但当前用户不是管理员，拒绝访问
        if (UserRoleEnum.ADMIN.equals(mustRoleEnum) && !UserRoleEnum.ADMIN.equals(userRoleEnum)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }

        // 校验通过，执行原方法
        return joinPoint.proceed();
    }
}
```
## 六、使用示例
```java
@AuthCheck(mustRole = "admin")
@GetMapping("/admin/data")
public Result<List<Data>> getAdminData() {
    // 仅管理员可访问
    return Result.success(dataService.getSensitiveData());
}
```
## 七、小结
通过 AOP + 自定义注解，可以让权限校验逻辑与业务代码彻底解耦，具备以下优势：
- 灵活扩展：支持自定义不同角色逻辑；
- 复用性高：统一拦截逻辑，减少代码重复；
- 增强可读性：方法上直接标注权限要求，一目了然；
- 更易维护：权限逻辑集中管理，排查问题更方便。