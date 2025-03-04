---
title: 前端file-saver保存文件
createTime: 2025/03/04 09:28:52
permalink: /article/vco73585/
tags:
  - 前端
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

## 地址
[file-saver](https://github.com/eligrey/FileSaver.js#readme)

## 使用
使用file-saver可以直接通过url下载文件，而不用通过后端编写流来下载
```js
/**
 * 通用前端文件下载
 * @param url
 * @param fileName
 */
export function downloadImage(url?: string, fileName?: string) {
    if (!url) {
        return
    }
    saveAs(url, fileName)
}

```