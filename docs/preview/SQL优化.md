---
title: SQL优化
createTime: 2025/03/04 09:28:52
permalink: /article/suopcpgk/
tags:
  - 优化
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

![SQL优化](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/SQL%E4%BC%98%E5%8C%96.png)



## 避免使用Select *

select * 会占用过多的资源，消耗CPU

slect * 查询了许多无用的数据，增加了传输时间

实际项目中测试过使用Select *的问题，使用Mybatis Plus默认是查询所有的数据，1条数据查询了2.9s，而去除了许多的无效数据后查询时间是0.4s，响应时间从3.6s降低为0.42s，优化成果巨大。



## 分页优化

数据量小的时候的limit分页，性能还行，但是一旦数据量大了，分页时间非常长，例如limit 100000,10。

可以使用子查询，先使用子查询查出第一个参数的主键，然后通过id>=主键，再次limit 10



## 避免多表使用join



## 优先批量操作

减少数据库请求次数，提升性能

## 优化慢SQL

slow_query_log查询某些查询超过时间阈值的sql语句

## 使用分析工具

## 选择合适的字段

例如

1. 小数值（性别，正常情况下只有男和女，可以使用）Tinyint

2. 非负整数（年龄肯定是大于0的），可以使用无符号整数存储，存储空间更大
3. 日期类型采用DATETIME等日期格式存储
4. 金额使用Decimal存储，避免精度丢失
5. id自增
6. 不使用null来作为默认值



## 正确使用索引
