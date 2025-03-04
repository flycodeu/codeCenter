---
title: Idea的Git忽略文件
createTime: 2025/03/04 09:49:05
permalink: /article/r82mjmsn/
---
> 贴心的编程学习路线，全面的编程知识百科
>
> 作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)



在我们使用Git进行版本管理的时候，有些文件我们不希望进行提交，可以使用.gitignore进行忽略，而这个.ignore插件帮我们整合了常用的一些忽略配置。

1. 首先先进入插件下载
![](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312281634201.png)
2. 右键文件夹，可以看到由许多的文件忽略，这里可以自行选择
![image-20231228163622269](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312281636372.png)
3. 比如常用的一些maven，java的编译，JetBrains配置等等就可以忽略
![image-20231228163715305](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312281637382.png)
4. 配置成功界面，里面的文件也可以自己配置
![image-20231228163756608](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312281637668.png)
5. 如果发现之前的文件都已经被托管了，需要新的忽略文件不被托管，可以在命令行输入以下命令
```sh
 git rm -rf --cached .
```

因为git里面是有个缓存的，所以可以清除缓存，然后重新托管，可以看到下图 .iml的文件已经被忽略了

![image-20231228163836500](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/202312281638566.png)

