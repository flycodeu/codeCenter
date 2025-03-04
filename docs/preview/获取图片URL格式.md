---
title: 获取图片URL格式
createTime: 2025/03/04 09:28:52
permalink: /article/sucw4nkv/
tags:
  - SpringBoot
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)


## 使用HEAD请求获取图片格式
```java
    long ONE_M = (1024 * 1024);
    // 图片上传类型
    List<String> IMAGE_TYPE = Arrays.asList("jpg", "jpeg", "png", "gif", "bmp", "webp");

    List<String> ALLOW_CONTENT_TYPE = Arrays.asList("image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp");
```

```java
       HttpResponse response = null;
        try {
            response = HttpUtil.createRequest(Method.HEAD, fileUrl).execute();
            if (response.getStatus() != HttpStatus.HTTP_OK) {
                return;
            }

            // 4.  校验图片类型是否合法
            String contentType = response.header("content-type");
            if (StrUtil.isNotBlank(contentType)) {
                if (!ALLOW_CONTENT_TYPE.contains(contentType.toLowerCase())) {
                    throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片格式不正确");
                }
            }
            // 5.  校验图片大小是否合法
            String contentLengthStr = response.header("content-length");
            if (!StrUtil.isBlank(contentLengthStr)) {
                try {
                    long contentLength = Long.parseLong(contentLengthStr);
                    if (contentLength > ONE_M * 2) {
                        throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片大小超过2M");
                    }
                } catch (NumberFormatException e) {
                    throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片大小格式错误");
                }
            }

        } catch (Exception e) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片校验失败");
        } finally {
            if (response != null) {
                response.close();
            }
        }
```