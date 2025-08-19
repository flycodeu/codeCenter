---
title: 前后端流式处理SSE
createTime: 2025/08/13 09:02:56
permalink: /article/e5rou6x4/
tags:
  - SSE
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/2f2fb80273762e672c81a240c67f7cda.jpg
---

## 后端返回封装后的流式结果
首先我们需要实现对应的AI流式输出，使用对应框架返回一个Flux对象，然后使用map方法将数据转换成对应的ServerSentEvent对象，最后使用concatWith方法将一个done事件添加到流中，返回给前端。
流式输出格式:
![流式输出格式](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/20250813091540.png)
这样主要是避免部分数据丢失，处理完成后再返回一个done事件，前端收到done事件后，表示数据处理完成。
```java
@GetMapping(value = "/chat/gen/code", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> chatToCode(@RequestParam String message, @RequestParam long appId, HttpServletRequest request) {
    //  流式输出
    Flux<String> chatToCodeStream = appService.chatToCode(appId, message, currentLoginUser);
    Flux<ServerSentEvent<String>> serverSentEventFlux = chatToCodeStream
            .map(chunk -> {
                Map<String, Object> data = Map.of("d", chunk);
                String jsonStr = JSONUtil.toJsonStr(data);
                return ServerSentEvent
                        .<String>builder()
                        .data(jsonStr)
                        .build();
            })
            .concatWith(
                    Mono.just(ServerSentEvent.<String>builder()
                            .event("done")
                            .data("")
                            .build()));
    return serverSentEventFlux;
}
```
前端处理SSE，使用EventSource处理，具体代码如下：

```js
const generateCode = async (userMessage: string, aiMessageIndex: number) => {
    let eventSource: EventSource | null = null
    let streamCompleted = false

    try {
        // 获取 axios 配置的 baseURL
        const baseURL = request.defaults.baseURL || API_BASE_URL

        // 构建URL参数
        const params = new URLSearchParams({
            appId: appId.value || '',
            message: userMessage,
        })

        const url = `${baseURL}/app/chat/gen/code?${params}`

        // 创建 EventSource 连接
        eventSource = new EventSource(url, {
            withCredentials: true,
        })

        let fullContent = ''

        // 处理接收到的消息
        eventSource.onmessage = function (event) {
            if (streamCompleted) return

            try {
                // 解析JSON包装的数据
                const parsed = JSON.parse(event.data)
                const content = parsed.d

                // 拼接内容
                if (content !== undefined && content !== null) {
                    fullContent += content
                    messages.value[aiMessageIndex].content = fullContent
                    messages.value[aiMessageIndex].loading = false
                    scrollToBottom()
                }
            } catch (error) {
                console.error('解析消息失败:', error)
                handleError(error, aiMessageIndex)
            }
        }

        // 处理done事件
        eventSource.addEventListener('done', function () {
            if (streamCompleted) return

            streamCompleted = true
            isGenerating.value = false
            eventSource?.close()

            // 延迟更新预览，确保后端已完成处理
            setTimeout(async () => {
                await fetchAppInfo()
                updatePreview()
            }, 1000)
        })

        // 处理错误
        eventSource.onerror = function () {
            if (streamCompleted || !isGenerating.value) return
            // 检查是否是正常的连接关闭
            if (eventSource?.readyState === EventSource.CONNECTING) {
                streamCompleted = true
                isGenerating.value = false
                eventSource?.close()

                setTimeout(async () => {
                    await fetchAppInfo()
                    updatePreview()
                }, 1000)
            } else {
                handleError(new Error('SSE连接错误'), aiMessageIndex)
            }
        }
    } catch (error) {
        console.error('创建 EventSource 失败：', error)
        handleError(error, aiMessageIndex)
    }
}

// 错误处理函数
const handleError = (error: unknown, aiMessageIndex: number) => {
    console.error('生成代码失败：', error)
    messages.value[aiMessageIndex].content = '抱歉，生成过程中出现了错误，请重试。'
    messages.value[aiMessageIndex].loading = false
    message.error('生成失败，请重试')
    isGenerating.value = false
}
```