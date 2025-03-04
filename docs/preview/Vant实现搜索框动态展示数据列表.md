---
title: Vant实现搜索框动态展示数据列表
createTime: 2025/03/04 09:28:52
permalink: /article/k1bio6yf/
tags:
  - 前端
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)


## van-popup+van-search实现数据动态搜索
1. 需要定义好对应的模板，van-popup里面添加搜索框，绑定searchKeyword，之后搜索内容可以通过这个控制
2. 获取所有的数据写入allUnits中
3. 使用allUnits过滤处包含对应字符的数据，写入filteredUnits，过滤后的数据
4. 使用watch监听searchKeyword的变化，然后请求过滤方法，这样只会请求一次，而不会请求多次
```js
<template>
  <div>
    <van-field 
      v-model="mainObj.supplierName" 
      name="supplierName" 
      label="单位" 
      placeholder="单位"
      clickable
      @click="handleShowUnit" 
      :rules="[{ required: false, message: '请填写单位名称' }]"
    />
    <van-popup v-model="showUnitSelector" position="top">
      <div>
        <van-search v-model="searchKeyword" placeholder="请输入单位名称" :show-action="true">
          <template #action>
            <van-button type="default" size="small" @click="searchUnits">搜索</van-button>
          </template>
        </van-search>
        <van-picker v-if="showUnitSelector" show-toolbar :columns="filteredUnits" @confirm="confirmUnit" @cancel="cancelUnit"/>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { getSupplierNameByFlag } from '@/api/supplier'; // 假设这是你的API请求

export default {
  data() {
    return {
      mainObj: {
        supplierName: '',
        supplierCode: ''
      },
      showUnitSelector: false,
      searchKeyword: '',
      allUnits: [], // 存储所有单位数据
      filteredUnits: [] // 存储过滤后的单位数据
    };
  },
  mounted() {
    this.getAllUnits();
  },
  methods: {
    getAllUnits() {
      // 获取所有单位数据
      const params = {
        tranFlag: 1
      };
      getSupplierNameByFlag(params).then((res) => {
        this.allUnits = res.data.map(item => ({
          text: item.supplierName,
          value: item.supplierCode,
        }));
        this.filteredUnits = this.allUnits; // 初始显示所有数据
      });
    },
    handleShowUnit() {
      this.showUnitSelector = true;
    },
    searchUnits() {
      // 根据用户输入进行模糊查询
      const keyword = this.searchKeyword.toLowerCase();
      this.filteredUnits = this.allUnits.filter(unit => unit.text.toLowerCase().includes(keyword));
    },
    confirmUnit(value, index) {
      this.mainObj.supplierName = value.text;
      this.mainObj.supplierCode = value.value;
      this.showUnitSelector = false;
    },
    cancelUnit() {
      this.showUnitSelector = false;
    }
  },
  watch: {
    searchKeyword: {
      handler(newVal) {
        this.searchUnits();
      },
      immediate: true // 立即执行一次，确保初始值也能触发
    }
  }
};
</script>

<style scoped>
/* 添加一些样式 */
</style>
```