---
title: Vercel部署ChatGpt
createTime: 2025/03/04 10:05:38
permalink: /article/60xnu0lv/
---
# Vercel 部署ChatGpt

> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)


## ChatGPT-Next-Web
开源项目，跨平台无需服务器就可部署自己的gpt网页端口
地址[https://github.com/Yidadaa/ChatGPT-Next-Web](https://github.com/Yidadaa/ChatGPT-Next-Web)

## 优点
1. 一键部署
2. 兼容各个系统
3. 数据存储本地
4. 支持markdown
5. 支持自定义

## 使用条件
1. 拥有vercel账号
 注册地址  https://vercel.com/dashboard，绑定github账号
2. 拥有gpt账号
需要使用gpt的key
3. 将ChatGPT-Next-Web  fork到自己的github仓库


## 开始使用
1. gpt的key获取
官网地址https://platform.openai.com/account/api-keys
![gptv-1](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/gptv-1.png)
点击创建新的key
![gptv-2](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/gptv-2.png)
保存好这个key
2. vercel部署
主界面![gptv-3](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/gptv-3.png)
点击Add new Project创建新项目
找到自己之前的fork项目,点击import
![gptv-4](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/gptv-4.png)

下拉找到Environment Variables
![gptv-5](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/gptv-5.png)
第一个填入OPENAI_API_KEY
第二个填入自己的gpt的key

新建一个NEXT_PUBLIC_USE_USER_KEY
让用户自己输入KEY才能用的设置，填入  false

点击部署，等待
![gptv-6](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/gptv-6.png)

3. 部署成功
![gptv-7](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/gptv-7.png)

4. 去往自己的gpt
点击continue
![gptv-8](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/gptv-8.png)
里面的domain就是自己的域名地址，点击就能进入
![gptv-9](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/gptv-9.png)

5. 配置域名
点击右上角的domain可以配置自己的域名
![gptv-10](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/gptv-10.png)

## 但是由于我的gpt是免费的，所以这里会显示余额不足
![gptv-11](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/gptv-11.png)