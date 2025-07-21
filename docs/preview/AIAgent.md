---
title: AIAgent
createTime: 2025/07/09 08:52:53
permalink: /article/6dm27fwx/
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250721105646096.png
tags:
  - AI
---


## Agent

AI 智能体是使用 AI 来实现目标并代表用户完成任务的软件系统。其表现出了推理、规划和记忆能力，并且具有一定的自主性，能够自主学习、适应和做出决定。

这些功能在很大程度上得益于生成式 AI 和 AI 基础模型的多模态功能。AI 智能体可以同时处理文本、语音、视频、音频、代码等多模态信息；可以进行对话、推理、学习和决策。它们可以随着时间的推移不断学习，并简化事务和业务流程。智能体可以与其他智能体协作，来协调和执行更复杂的工作流。

Spring AI 框架，支持大语言模型构建 AI Agent 实现。AI Agent是整合多种技术手段的智能实体 ，其实现依赖于 Tools、MCP、Memory、RAG（Retrieval 增强检索生成） 等技术组件，但不是非得依赖全部组件才叫 AI Agent。

## Agent设计

![img](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%7B7EEC67A9-45FE-44F7-AD14-4A8FCDBC39E9%7D)

![AIAgentFlow.drawio](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/AIAgentFlow.drawio.png)

![AIAgentTimeFlow.drawio](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/AIAgentTimeFlow.drawio.png)