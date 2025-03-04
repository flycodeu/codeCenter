---
title: STL标准模板库
createTime: 2025/03/04 09:25:15
permalink: /article/wizw4dmx/
tags:
  - C++
---
## STL

### STL基础概念

广义上分为容器算法，迭代器算法，容器和算法之间无缝衔接，STL几乎所有的代码都采用了模板类或者模板函数，可以达到很好的代码复用。

### STL六大组建

- 容器：数据结构，例如vector, list,queue,set,map等，用来存储数据，从实现角度上看，是class Template
- 算法：常用算法，如sort,find,copy,for_each等，从实现角度来看，是function template
- 迭代器：扮演了算法和容器之间的胶合剂，有5种类型，实现角度看，将operator*, operator->,operator++,operator--等相关指针操作重载的class template，所有的STL容器都有自己的迭代器，只有容器的设计者才能知道如何遍历自己的元素
- 仿函数：类似函数，可以作为算法的某种策略，实现角度看，是重载了operator()的class或者class template
- 适配器：修饰容器或者仿函数或者迭代器接口的东西
- 空间配置器：负责空间的配置和管理，实现角度看，配置器是一个实现了动态空间、空间管理、空间释放class template

容器通过空间适配器获取数据存储空间，算法通过迭代器存储容器里面的内容，仿函数可以协助算法完成不同的策略变化，适配器可以修饰仿函数。

### STL优点

![image-20240229165014663](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240229165014663.png)

