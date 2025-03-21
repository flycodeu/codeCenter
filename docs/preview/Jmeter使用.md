---
title: Jmeter使用
createTime: 2025/03/21 08:25:57
permalink: /article/ue2v7nsh/
tags:
  - 压力测试
---



## Jmeter下载

[Jemter官网下载](https://jmeter.apache.org/download_jmeter.cgi)

解压文件，进入bin目录，找到jmeter.bat，双击运行

## Jemter使用

1. 创建线程组

![image-20250321101951325](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250321101951325.png)

![image-20250321102025716](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250321102025716.png)

2. 添加请求

![image-20250321102048675](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250321102048675.png)

添加基本信息，消息体
{"current":1,"pageSize":12,"sortField":"createTime","sortOrder":"descend"}

![image-20250321102107826](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250321102107826.png)


3. 添加HTTP信息请求头

![image-20250321102131414](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250321102131414.png)

![image-20250321102154339](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250321102154339.png)

4. 定义响应结果，响应断言
   来判断究竟什么时候才是发送成功

![image-20250321102212341](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250321102212341.png)

因为我们的后端是发送的"code":0，表示成功，而jmeter里面对于""需要使用\来转义这个里面不能有空格

![image-20250321102232390](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250321102232390.png)

5. 添加聚合报告，查看结果树

开始测试

![image-20250321102246099](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250321102246099.png)吞吐量也就是我们的qps：23.3/sec 每秒可以进行的请求数
最小值和最大值分别指线程等待时间，最大等待时间甚至破万了，无疑我们需要改善。
这里是用的500个线程，循环10次，启动时常10s



## 参考文档

https://www.cnblogs.com/monjeo/p/9330464.html

https://blog.csdn.net/m0_62314761/article/details/134544740

https://blog.csdn.net/weixin_44999591/article/details/140626514