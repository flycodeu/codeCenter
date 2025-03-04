---
title: MP的getOne查询出多条数据
createTime: 2025/03/04 09:28:52
permalink: /article/zwqyjkml/
tags:
  - Mybatis Plus
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)


使用getOne方法的时候查询出多条数据，会报错返回多条数据但是只需要一条，需要查明什么原因导致出现多条数据，无法解决可以使用last方法。
[条件构造器](https://baomidou.com/guides/wrapper/#last)

mysql

last("limit 1")

oracle

last("and rownum = 1")