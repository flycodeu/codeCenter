---
title: Idea无法查看源码
createTime: 2025/05/22 10:10:42
permalink: /article/5ux90m7i/
tags:
  - Bug
---


## 存在问题
在Idea中想要查看部分依赖的源码，但是点击进入只能看到class编译后的文件，并且下载源码报错
`无法下载源代码
找不到此对象的源代码: xxx
`
## 终端运行命令
```
mvn dependency:resolve -Dclassifier=sources
```

然后重新下载即可看到java文件源码