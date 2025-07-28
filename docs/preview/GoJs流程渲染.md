---
title: GoJs流程渲染
createTime: 2025/07/28 14:24:35
permalink: /article/ju343p8d/
tags:
  - 前端
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250728145634409.png
---

## GOJS
[GoJs](https://gojs.net/latest/intro/#SimpleGoJSDiagram)

GoJS 是一个 JavaScript 库，让您可以轻松在网页浏览器中创建交互式图表。GoJS 支持图形模板和图形对象属性与模型数据的绑定。您只需要保存和恢复由简单 JavaScript 对象组成的模型，这些对象包含您的应用程序所需的任何属性。许多预定义的工具和命令实现了大多数图表所需的标准行为。外观和行为自定义主要是一个设置属性的问题。

**核心是节点和关系的数据维护**


## 快速上手
需要引入一些js，可以从当前位置下载对应的[GoJs样例](https://github.com/flycodeu/business-behavior-monitor/tree/master/front)
```html
<!DOCTYPE html>
<html>
<head>
    <title>基于GOJS封装的流程图设计（展示）工具类</title>
    <meta name="description" content="" />
    <!-- Copyright 1998-2016 by Northwoods Software Corporation. -->
    <meta charset="UTF-8">
    <script src="../js/jquery.min.js"></script>
    <script src="../js/go.js"></script>
    <script src="../js/flow-desinger.js"></script>
    <script src="../js/flow-display.js"></script>
</head>
<body>
<div id="sample" style="width:80%;margin: 0 auto">
    <div style="width:100%; white-space:nowrap;">
        <!--  控件 -->
        <span style="display: inline-block; vertical-align: top; padding: 5px; width:110px">
      <div id="myPaletteDiv" style="border: solid 1px black; height: 420px"></div>
    </span>

        <!--  设计面板 -->
        <span style="display: inline-block; vertical-align: top; padding: 5px; width:80%">
      <div id="myFlowDesignerDiv" style="border: solid 1px black; height: 420px"></div>
    </span>
    </div>

    <div>
        <div>
            <button id="btnCreate" onclick="doCreateStep()">新建步骤</button>
            <button id="btnSave" onclick="saveDesigner()">保存设计图</button>
        </div>
        <textarea id="mySavedModel" style="width:100%;height:300px">
{ "class": "go.GraphLinksModel",
  "modelData": {"position":"-5 -5"},
  "nodeDataArray": [
{"key":"1", "text":"开始", "figure":"Circle", "fill":"#4fba4f", "stepType":1, "loc":"90 110"},
{"key":"2", "text":"结束", "figure":"Circle", "fill":"#CE0620", "stepType":4, "loc":"770 110"},
{"key":"3", "text":"填写请假信息 ",  "loc":"210 110", "remark":""},
{"key":"4", "text":"部门经理审核 ",  "loc":"370 110", "remark":""},
{"key":"5", "text":"人事审核  ",  "loc":"640 110", "remark":""},
{"key":"6", "text":"副总经理审核  ",  "loc":"510 40", "remark":""},
{"key":"7", "text":"总经理审核  ",  "loc":"500 180", "remark":""}
 ],
  "linkDataArray": [
{"from":"1", "to":"3"},
{"from":"3", "to":"4"},
{"from":"4", "to":"5"},
{"from":"5", "to":"2"},
{"from":"4", "to":"6", "key":"1001", "text":"小于5天 ", "remark":"", "condition":"Days<5"},
{"from":"6", "to":"5"},
{"from":"4", "to":"7", "key":"1002", "text":"大于5天 ", "remark":"", "condition":"Days>5"},
{"from":"7", "to":"5"}
 ]}
    </textarea>
    </div>

    <br/>
    <div>
        流程路径(不包括【开始】和【结束】)：<input type="text" id="txtFlowPath" placeholder="" value="3,4,6,5"  style="width: 300px;"/>
        <button onclick="showFlowPath()">查看流程状态</button><input type="checkbox" value="已完成流程" id="chkIsCompleted" />流程已结束
        <span style="color:red;font-size: 10px; margin-left: 20px;">3,4,6,5是步骤的id，最后一个步骤为"待处理"或"已完成"的步骤</span>
    </div>
    <!-- 图例 -->
    <div style="padding:8px 5px 0 10px;">
        <span style="display:inline-block; height:12px; width:12px; background:#4fba4f; margin-left:6px; vertical-align:middle;"></span>
        <label style="vertical-align:middle;">已完成步骤</label>
        <span style="display:inline-block; height:12px; width:12px; background:#ff9001; margin-left:6px; vertical-align:middle;"></span>
        <label style="vertical-align:middle;">待处理步骤</label>
        <span style="display:inline-block; height:12px; width:12px; background:#7e7e7f; margin-left:6px; vertical-align:middle;"></span>
        <label style="vertical-align:middle;">未经过步骤</label>
    </div>
    <div style="width:100%; white-space:nowrap;">
        <!--  显示面板 -->
        <span style="display: inline-block; vertical-align: top; padding: 5px; width:80%">
      <div id="myDisplayDiv" style="border: solid 1px black; height: 420px"></div>
    </span>
    </div>

</div>
</body>
<script type="text/javascript">
    var areaFlow = document.getElementById('mySavedModel');

    // 流程图设计器
    var  myDesigner= new FlowDesigner('myFlowDesignerDiv');
    myDesigner.initToolbar('myPaletteDiv');// 初始化控件面板
    myDesigner.displayFlow(areaFlow.value);// 在设计面板中显示流程图

    // 流程图显示器
    var myDisplay = new FlowDisplay('myDisplayDiv');
    showFlowPath();

    function showFlowPath() {
        var flowPath =  $.trim($('#txtFlowPath').val());
        var isCompleted = $('#chkIsCompleted').is(':checked');
        myDisplay.loadFlow(areaFlow.value);
        myDisplay.animateFlowPath(flowPath, isCompleted);

        console.info("刷新");
    }

    // Set interval to fetch data every 5 seconds
    setInterval(showFlowPath, 5000);

    /**
     * 创建步骤
     */
    var doCreateStep = function () {
        if(!myDesigner) return;

        myDesigner.createStep();
    };

    /**
     * 保存设计图中的数据
     */
    var saveDesigner = function(){
//      var errMsg = myDesigner.checkData();
//      if(errMsg){
//          layer.msg(errMsg);
//          return;
//      }
        areaFlow.value = myDesigner.getFlowData();
    };

</script>
</html>
```

## 效果

界面总体实现了本地流程图界面展示以及在线修改

![image-20250728144319954](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250728144319954.png)



## 总结

官网案例如下，总体上就是定义节点以及相应属性。

```js
// the node template describes how each Node should be constructed
diagram.nodeTemplate =
  new go.Node("Auto")
    .add(  // the Shape will be sized to go around the TextBlock
      new go.Shape("RoundedRectangle")
        // Shape.fill is bound to Node.data.color
        .bind("fill", "color"),
      new go.TextBlock({ margin: 8}) // Specify a margin to add some room around the text
        // TextBlock.text is bound to Node.data.text
        .bind("text")
    );

// the Model holds only the essential information describing the diagram
diagram.model = new go.GraphLinksModel(
[ // a JavaScript Array of JavaScript objects, one per node;
  // the "color" property is added specifically for this app
  { key: 1, text: "Alpha", color: "lightblue" },
  { key: 2, text: "Beta", color: "orange" },
  { key: 3, text: "Gamma", color: "lightgreen" },
  { key: 4, text: "Delta", color: "pink" }
],
[ // a JavaScript Array of JavaScript objects, one per link
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 2 },
  { from: 3, to: 4 },
  { from: 4, to: 1 }
]);

// enable Ctrl-Z to undo and Ctrl-Y to redo
diagram.undoManager.isEnabled = true;
```

图由部件组成：节点可以通过连接线连接，并且可以组合成组。所有这些部件都聚集在层中，并由布局和路由器排列。

每个图都有一个模型，该模型存储并解释您的应用程序数据，以确定节点之间的连接关系和组成员关系。大多数部件都与您的应用程序数据数据绑定。图会自动为模型中的 Model.nodeDataArray 中的每个数据项创建一个节点或组，并为模型中的 GraphLinksModel.linkDataArray 中的每个数据项创建一个连接线。您可以为每个数据对象添加所需的任何属性，但每种模型只期望少数几个属性。它们在灰色的数据对象中用粗体显示。

![image-20250728144743333](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250728144743333.png)

总体流程

![image-20250728144822003](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250728144822003.png)

## 学习和扩展

**[FlowDiagram: 详细编写了对应的案例](https://gitee.com/markies/FlowDiagram)**

[GoJsDesigner: Go流程设计图，简化了原本的配置](https://github.com/BoBoooooo/GoJsDesigner?tab=readme-ov-file)

[GoJs官网](https://gojs.net/latest/intro/#SimpleGoJSDiagram)