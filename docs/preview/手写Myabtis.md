---
title: 手写Myabtis
createTime: 2025/04/23 09:41:12
permalink: /article/l5iex3lc/
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250423155643.jpg
---



## 手写Mybatis-01

主要分成三部分

- 用户定义的数据库操作接口（Dao层）
- xml配置的sql语句
- 数据库

代理可以封装一个复杂的流程为接口对象的实现类。

![image-20250423152515991](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250423152515991.png)

### 1. MapperProxy代理类

这是一个动态代理类，用于代理接口方法调用。通过 `InvocationHandler` 接口实现对目标接口方法的拦截与处理。

核心功能: 

- 使用 `Map<String, String>` 存储接口方法名与 SQL 语句的映射关系。
- 动态代理接口方法调用，并根据接口名和方法名查找对应的 SQL 语句。

```java
public class MapperProxy<T> implements InvocationHandler, Serializable {

    private static final long serialVersionUID = -1047155665507002273L;

    /**
     * 存储mapper的sql语句对应的key-value
     * key: mapper的类名+方法名
     * value: sql语句
     */
    private Map<String, String> sqlSession;

    /**
     * mapper的接口类型,当前代理对象代理的接口
     */
    public final Class<T> mapperInterface;

    public MapperProxy(Class<T> mapperInterface, Map<String, String> sqlSession) {
        this.mapperInterface = mapperInterface;
        this.sqlSession = sqlSession;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        if (Object.class.equals(method.getDeclaringClass())) {
            return method.invoke(this, args);
        } else {
            return "模拟调用：" + sqlSession.get(mapperInterface.getName() + "." + method.getName());
        }
    }
}
```

### 2. MapperProxyFactory工厂类

`MapperProxyFactory` 是一个基于简单工厂模式的工具类，用于帮助我们创建动态代理对象。通过封装 `Proxy.newProxyInstance` 的复杂逻辑，它极大地简化了动态代理对象的创建过程，同时提升了代码的可读性和可维护性

```java
public class MapperProxyFactory<T> {
    /**
    *当前工厂类所服务的目标接口
    */
    private final Class<T> mapperInterface;

    public MapperProxyFactory(Class<T> mapperInterface) {
        this.mapperInterface = mapperInterface;
    }

    public T newInstance(Map<String, String> sqlSession) {
        final MapperProxy<T> mapperProxy = new MapperProxy<>(mapperInterface, sqlSession);
        return (T) Proxy.newProxyInstance(mapperInterface.getClassLoader(), new Class[]{mapperInterface}, mapperProxy);
    }
}
```

### 3. IUserDao接口，被代理的接口

```java
public interface IUserDao {
    String getUserInfoById(String id);
}
```

### 4. 测试

使用MapperProxyFactory创建 `IUserDao` 接口的动态代理对象，

```java
    public static void main(String[] args) {
        MapperProxyFactory<IUserDao> mapperProxyFactory = new MapperProxyFactory<>(IUserDao.class);
        Map<String, String> sqlSession = new HashMap<>();
        sqlSession.put("test.dao.IUserDao.getUserInfoById", "模拟执行 Mapper.xml 中 SQL 语句的操作：根据id查找用户信息");

        IUserDao iUserDao = mapperProxyFactory.newInstance(sqlSession);
        String userInfoById = iUserDao.getUserInfoById("12");
        System.out.println(userInfoById);
    }
```

![image-20250423154058647](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250423154058647.png)



### 5. 总结

目前实现了一个简易版本的Mybatis，其中使用代理类工厂把代理的创建给封装起来了，避免每次创建代理类操作都要创建一个新的代理对象。

此小结学习了：

- 代理的使用
- 工厂设计模式
