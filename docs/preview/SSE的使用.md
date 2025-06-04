---
title: SSE的使用
createTime: 2025/06/04 08:58:52
permalink: /article/q80b93cf/
tags:
  - SSE
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250603151807.jpg
---



## SSE基本概念

### 一、什么是 SSE？

SSE（Server-Sent Events，服务器发送事件）是一种用于**服务器向客户端实时推送数据**的技术。它最早出现在 HTML5 规范中，并在 2014 年随 HTML5 成为 W3C 推荐标准。[MDN WEB DOCS](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events)

SSE 基于 HTTP 协议，通过长连接实现服务器到客户端的单向通信，适用于需要持续接收更新的应用场景，如股票行情、实时通知、聊天系统等。

------

### 二、SSE 的特点

| 特点               | 描述                                                         |
| ------------------ | ------------------------------------------------------------ |
| **基于 HTTP**      | 使用标准的 HTTP 协议进行通信，易于部署和调试。               |
| **单向通信**       | 数据仅从服务器推送到客户端，不支持客户端主动发送消息。       |
| **轻量级**         | 传输的是文本格式的数据（通常是 UTF-8），无需复杂的编解码过程。 |
| **自动重连机制**   | 如果连接中断，浏览器会自动尝试重新连接。                     |
| **事件类型支持**   | 支持自定义事件类型，便于客户端区分不同类型的消息。           |
| **断线续传标识符** | 提供 `id` 字段用于记录事件位置，方便断线后恢复。             |

------

### 三、SSE 工作原理

#### 1. 客户端发起请求

客户端通过 JavaScript 创建 `EventSource` 对象，向服务器发起一个 HTTP GET 请求：

```javascript
const eventSource = new EventSource('http://example.com/sse');
```

#### 2. 服务器响应并保持连接

服务器接收到请求后，不会立即关闭连接，而是以 `text/event-stream` 类型返回响应，并持续推送事件流数据：

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: Hello, world!
```

#### 3. 客户端监听事件

客户端可以监听以下主要事件：

- `onmessage`：默认事件处理函数，当没有指定事件名时触发。
- `onopen`：连接建立时触发。
- `onerror`：连接出错或中断时触发。
- `onclose`：连接关闭时手动调用 `close()` 方法触发。

```javascript
eventSource.onopen = () => {
    console.log('连接已打开');
};

eventSource.onmessage = (event) => {
    console.log('收到消息:', event.data);
};

eventSource.onerror = (err) => {
    console.error('发生错误:', err);
};
```

------

### 四、SSE 消息格式规范

每个事件流由多个字段组成，每行以 `\n` 分隔，不同字段之间也以空行分隔。常见字段如下：

| 字段    | 含义                                                     |
| ------- | -------------------------------------------------------- |
| `data`  | 必填项，表示要发送的数据，可以是多行。                   |
| `event` | 可选，指定事件名称，客户端通过 `addEventListener` 监听。 |
| `id`    | 可选，事件 ID，用于断线重连时恢复上次的位置。            |
| `retry` | 可选，指定自动重连间隔时间（单位：毫秒）。               |

```
id: 12345
event: update
data: {"type": "stock", "price": 102.5}
data: More data here.

retry: 5000
data: This is a message with multiple lines.
```

------

### 五、自定义事件监听

除了 `onmessage`，还可以使用 `addEventListener` 来监听特定事件类型：

```
eventSource.addEventListener('update', (event) => {
    console.log('收到 update 类型消息:', event.data);
});
```

对应的服务端响应示例：

```
event: update
data: 更新内容
```

------

### 六、SSE 的优缺点

#### ✅ 优点

- 简单易用，基于 HTTP，兼容性好。
- 自动重连，简化客户端逻辑。
- 轻量级，适合文本数据推送。
- 支持事件分类，便于消息处理。

#### ❌ 缺点

- **非全双工通信**：只能服务器向客户端推送，无法双向交互。
- **不支持二进制数据**：传输数据必须为文本格式。
- **资源占用较高**：需维持长连接，对服务器性能有一定要求。
- **浏览器兼容性限制**：IE 不支持，移动端主流浏览器基本支持（iOS Safari、Android Chrome 等）。

------

### 七、适用场景

- 实时新闻推送
- 股票行情更新
- 在线聊天应用的通知层
- 实时日志查看
- 游戏排行榜更新

------

### 八、与 WebSocket 的对比

| 功能         | SSE                     | WebSocket                  |
| ------------ | ----------------------- | -------------------------- |
| 协议         | HTTP                    | 自定义协议（通常基于 TCP） |
| 通信方向     | 单向（服务器 → 客户端） | 双向                       |
| 数据格式     | 文本                    | 文本或二进制               |
| 是否自动重连 | 是                      | 否（需自行实现）           |
| 浏览器兼容性 | 较好（不支持 IE）       | 良好（现代浏览器均支持）   |
| 实现复杂度   | 简单                    | 复杂                       |
| 性能开销     | 较低                    | 较高                       |

------

### 九、注意事项与优化建议

- **避免缓存**：设置 `Cache-Control: no-cache` 防止中间缓存干扰。
- **设置合适的超时时间**：防止连接长时间无效占用资源。
- **合理控制并发连接数**：SSE 连接占用服务器资源，注意负载均衡。
- **使用压缩（可选）**：可开启 GZIP 减少带宽消耗。
- **断线续传**：利用 `id` 字段实现断线后继续获取未接收的消息。
- **安全措施**：确保接口权限控制，避免被滥用。

------

### 十、总结

SSE 是一种轻量级的服务器推送技术，特别适合只需要单向通信的实时应用场景。相比 WebSocket，SSE 更加简单易用，且兼容性较好，但在功能上有所局限。应根据业务需求选择合适的技术方案。

## SpringBoot使用SSE

### 1. 返回Flux响应式对象，添加SSE响应MediaType

```java
@GetMapping(value = "/chat/sse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> chatSSEByFlux() {
    return Flux.create(sink -> {
        for (int i = 1; i <= 30; i++) {
            sink.next("第" + i + "次");
            sink.next("hello");
            sink.next("world");
        }
        sink.complete();
    });
}
```

![image-20250604095619517](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250604095619517.png)

### 2. 返回Flux对象

```java
@GetMapping(value = "/chat/sse/noMT")
public Flux<ServerSentEvent<String>> chatSSEByFluxTrunk() {
    return Flux.create(sink -> {
        // 模拟分段发送的虚拟内容
        sink.next(ServerSentEvent.<String>builder()
                .data("Hello, this is the first message.")
                .build());

        sink.next(ServerSentEvent.<String>builder()
                .data("This is a second virtual chunk of data.")
                .build());

        sink.next(ServerSentEvent.<String>builder()
                .data("Streaming content to client...")
                .build());

        // 结束流
        sink.complete();
    });
}
```

![image-20250604100237189](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250604100237189.png)

### 3. 使用Emitter

```java
@GetMapping("/chat/sse/emitter")
public SseEmitter simulateSseEmitter() {
    // 设置超时时间为 3 分钟
    SseEmitter emitter = new SseEmitter(180000L);
    // 模拟异步发送虚拟内容
    new Thread(() -> {
        try {
            // 发送多条消息
            emitter.send("Hello, this is the first message.");
            Thread.sleep(1000); // 模拟延迟
            emitter.send("This is a second virtual chunk of data.");
            Thread.sleep(1000);
            emitter.send("Streaming content to client...");
            Thread.sleep(1000);
            // 完成流
            emitter.complete();
        } catch (IOException | InterruptedException e) {
            emitter.completeWithError(e);
        }
    }).start();
    return emitter;
}
```

![image-20250604100907243](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250604100907243.png)
