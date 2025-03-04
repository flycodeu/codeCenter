---
title: Mysql的EXTRACT函数
createTime: 2025/03/04 09:28:52
permalink: /article/qkrqgo2t/
---

> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

EXTRACT函数是MySQL中用于从日期、时间或日期时间中提取指定部分的函数。

可以用于



## 提取年

```sql
EXTRACT(Year from delivery_time) as year
```

## 提取月

```
EXTRACT(MONTH from delivery_time)
```
