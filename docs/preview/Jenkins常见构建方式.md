---
title: Jenkins常见构建方式
createTime: 2025/03/05 09:04:01
permalink: /article/kmkxergu/
tags:
  - Jenkins
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/logo.png
coverStyle:
  layout: right
---



## 构建方式

![image-20250305090918858](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250305090918858.png)



## 定时构建

这个定时和其他不一样，不支持秒

https://crontab.guru/

![image-20250305091646627](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250305091646627.png)

![image-20250305091706539](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250305091706539.png)

```
H(1-30) * * * *
```

这个意思是1-30分钟内随机选取时间，每小时的第几分钟，加上H，可以分散负载，不会在同一时间同时执行任务，影响其他任务。

![image-20250305092437429](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250305092437429.png)



