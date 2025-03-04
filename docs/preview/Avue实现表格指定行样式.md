---
title: Avue实现表格指定行样式
createTime: 2025/03/04 09:28:52
permalink: /article/ioqb8jfx/
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)


## avue-curd配置option
:row-class-name="rowStyle"

```js
<avue-crud :option="option"
:table-loading="loading"
:data="data"
:page.sync="page"
:permission="permissionList"
:before-open="beforeOpen"
:before-close="beforeClose"
:row-class-name="rowStyle"
v-model="form"
ref="crud"
@row-update="rowUpdate"
@row-save="rowSave"
@row-del="rowDel"
@search-change="searchChange"
@search-reset="searchReset"
@selection-change="selectionChange"
@current-change="currentChange"
@size-change="sizeChange"
@refresh-change="refreshChange"
@on-load="onLoad">
```

## 编写方法
根据自己的条件进行判断，最后返回的是对应的样式
```js
    rowStyle({row, column}) {
      if (row.a098 === "0" || row.a098 === undefined) {
        return 'warning-row'
      }
    }
```

## 编写样式
```js
.warning-row {
  background-color: #ff4d4f !important; /* 设置背景色为红色 */
}
```