---
title: wangEditor实现图片上传
createTime: 2025/03/04 09:28:52
permalink: /article/wsioto6o/
tags:
  - 前端
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

## 官方文档地址

https://www.wangeditor.com/v5/getting-started.html



### 1. 引入依赖

```sh
yarn add @wangeditor/editor
# 或者 npm install @wangeditor/editor --save

yarn add @wangeditor/editor-for-vue@next
# 或者 npm install @wangeditor/editor-for-vue@next --save
```

### 2. 引入组件vue3

```js
import {Editor, Toolbar} from "@wangeditor/editor-for-vue";
```

```html
          <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
          />
          <Editor
              style="height: 500px; overflow-y: hidden"
              v-model="form.description"
              :defaultConfig="editorConfig"
              mode="default"
              @onCreated="handleCreated"
          />
```

```js
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const toolbarConfig = {};
const editorConfig = {
  MENU_CONF: {},
  placeholder: "请输入内容...",
}

editorConfig.MENU_CONF['uploadImage'] = {
    // fieldName必须要和下面后端接口的参数名一致
  fieldName: 'file',
    // 只允许图片
  allowedFileTypes: ['image/*'],
  server: "http://localhost:8100/api/picture/uploadEditor",  // 后端地址
    // 请求头
  headers: {
    token: store.getters.GET_TOKEN
  },
  withCredentials: false,
  timeout: 5 * 1000, // 5 秒

}
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
const handleCreated = (editor) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};
```

### 3. 后端上传

返回的数据格式必须是

```json
{
    "errno": 0, // 注意：值是数字，不能是字符串
    "data": {
        "url": "xxx", // 图片 src ，必须
        "alt": "yyy", // 图片描述文字，非必须
        "href": "zzz" // 图片的链接，非必须
    }
}
```

所以我们需要自己拼接请求

```java
    @PostMapping("/uploadEditor")
    public HashMap<String, Object> uploadEditorImage(MultipartFile file) {
        if (ObjectUtils.isEmpty(file)) {
            throw new BusinessException(ErrorCode.PARAMS_EMPTY_ERROR, "请选择文件");
        }
        // 上传之七牛云，可以自己配置
        String url = imageUtils.uploadImageQiniu(file);
        HashMap<String, Object> map = new HashMap<>();
        HashMap<String, Object> hashMap = new HashMap<>();
        hashMap.put("url", url);
        map.put("errno", 0);
        map.put("data", hashMap);
        return map;
    }

```

imageUtils可查看
[SpringBoot结合七牛云完成文件上传](SpringBoot结合七牛云.md)