---
title: SSE使用
createTime: 2025/09/23 14:09:31
permalink: /article/4ov1a8ye/
tags:
  - SSE
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/e848b4cad024661c5bb9b6c2d8aefca9.jpg
---
<ImageCard
image="https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/e848b4cad024661c5bb9b6c2d8aefca9.jpg"
href="/"
width=200
center=true
/>

# Server-Sent Events (SSE) 使用指南

> **SSE（Server-Sent Events）** 是一种基于 HTTP 的服务器向客户端推送数据的技术，适用于实时消息通知、状态更新、日志推送等场景。相比
> WebSocket，SSE 更轻量、简单，且天然支持文本流和自动重连。

---

## 📌 一、SSE 简介

### 1. 什么是 SSE？

- **SSE（Server-Sent Events）** 是 HTML5 提供的一种浏览器与服务器之间的**单向通信协议**。
- 服务器可以主动向客户端推送数据，客户端通过 `EventSource` API 接收。
- 基于 **HTTP 长连接**，使用 `text/event-stream` 内容类型。

### 2. 适用场景

- 实时通知（如系统告警、订单状态）
- 日志流输出
- 股票行情、数据看板
- 后台任务进度推送

### 3. 与 WebSocket 对比

| 特性     | SSE           | WebSocket   |
|--------|---------------|-------------|
| 协议     | HTTP          | 自定义（ws/wss） |
| 通信方向   | 服务器 → 客户端（单向） | 双向          |
| 复杂度    | 简单            | 较复杂         |
| 自动重连   | 支持            | 需手动实现       |
| 浏览器兼容性 | 良好（除 IE）      | 良好          |
| 适用场景   | 推送为主          | 实时双向交互      |

> ✅ **推荐使用 SSE 的场景：服务器主动推送，客户端仅接收**

---

## 🛠️ 二、后端实现（Spring Boot）

### 1. 核心依赖

确保项目已引入 Spring Web 依赖（Spring Boot 默认包含）：

```xml

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 2. SSE 服务类：SSEMessageService

```java
@Service
public class SSEMessageService {
    
    private static final Logger logger = LoggerFactory.getLogger(SSEMessageService.class);
    
    // 存储所有SSE连接
    private static final CopyOnWriteArraySet<SseEmitter> emitters = new CopyOnWriteArraySet<>();
    
    /**
     * 创建新的SSE连接
     */
    public SseEmitter createConnection() {
        SseEmitter emitter = new SseEmitter(0L);
        
        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            logger.info("SSE连接完成，当前连接数: {}", emitters.size());
        });
        
        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            logger.info("SSE连接超时，当前连接数: {}", emitters.size());
        });
        
        emitter.onError(throwable -> {
            emitters.remove(emitter);
            logger.error("SSE连接错误: {}, 当前连接数: {}", throwable.getMessage(), emitters.size());
        });
        
        emitters.add(emitter);
        logger.info("新SSE连接建立，当前连接数: {}", emitters.size());
        
        // 发送欢迎消息
        try {
            emitter.send(SseEmitter.event()
                    .name("message")
                    .data("欢迎连接SSE服务器！当前在线人数: " + emitters.size()));
        } catch (IOException e) {
            logger.error("发送欢迎消息失败: {}", e.getMessage());
        }
        
        // 广播新用户连接
        broadcastMessage("新用户已连接，当前在线: " + emitters.size() + " 人");
        
        return emitter;
    }
    
    /**
     * 广播消息给所有连接
     */
    public void broadcastMessage(String message) {
        logger.info("广播消息: {} 给 {} 个客户端", message, emitters.size());
        
        CopyOnWriteArraySet<SseEmitter> deadEmitters = new CopyOnWriteArraySet<>();
        
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("message")
                        .data(message));
            } catch (IOException e) {
                logger.error("发送消息失败: {}", e.getMessage());
                deadEmitters.add(emitter);
            }
        }
        
        // 移除无效连接
        emitters.removeAll(deadEmitters);
    }
    
    /**
     * 获取当前连接数
     */
    public int getConnectionCount() {
        return emitters.size();
    }
}
```

### 3. 控制器（Controller）

```java
@RestController
@RequestMapping("/api/sse")
public class SSEController {

    @Autowired
    private SSEMessageService sseMessageService;

    @GetMapping("/connect")
    public SseEmitter connect() {
        return sseMessageService.createConnection();
    }

    @PostMapping("/broadcast")
    public String broadcast(@RequestBody Map<String, String> request) {
        sseMessageService.broadcastMessage(request.get("message"));
        return "消息已广播";
    }
}
```

## 🖥️ 三、前端使用

### 1. 基础连接

```js
const eventSource = new EventSource('/api/sse/connect');

eventSource.onmessage = function (event) {
    console.log('收到消息:', event.data);
    // 处理消息
};

eventSource.onerror = function (event) {
    console.error('SSE连接出错:', event);
};

```

### 2. 监听自定义事件

后端发送：

```java
emitter.send(SseEmitter.event().name("user-login").data("user123"));
```

前端监听：

```javascript
eventSource.addEventListener('user-login', function (event) {
    console.log('用户登录:', event.data);
});
```

### 3. 自动重连机制

```javascript
let eventSource = null;
let reconnectDelay = 3000;
let maxReconnectDelay = 30000;
let reconnectAttempts = 0;

function connect() {
    eventSource = new EventSource('/api/sse/connect');

    eventSource.onopen = () => {
        console.log('SSE连接已建立');
        reconnectAttempts = 0; // 重置重试次数
    };

    eventSource.onmessage = (event) => {
        console.log('消息:', event.data);
    };

    eventSource.onerror = () => {
        console.error('SSE连接断开，准备重连...');
        setTimeout(() => {
            const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts), maxReconnectDelay);
            reconnectAttempts++;
            connect();
        }, 3000);
    };

}

// 启动连接
connect();
```

> 🔁 使用 指数退避 策略避免频繁重试。

### 4. 手动关闭连接

```javascript
if (eventSource) {
   eventSource.close();
}
```

## 🌐 四、高级特性

### 1. 心跳机制（Keep-Alive）

防止 Nginx、代理服务器断开长连接：

```java
// 每 30 秒发送一次心跳
@Scheduled(fixedRate = 30000)
public void sendHeartbeat() {
    emitters.forEach(emitter -> {
        try {
            emitter.send(SseEmitter.event().comment("heartbeat"));
        } catch (IOException e) {
            // 忽略或记录
        }
    });
}
```

### 2. 设置重连建议时间

```java
emitter.send(SseEmitter.event()
    .retry(5000)  // 建议前端 5 秒后重连
    .name("reconnect")
    .data("服务器建议重连"));
```

前端会自动使用此值作为重连间隔。

### 3. 用户级连接管理（可选）

可将 emitters 改为 Map<userId, SseEmitter>，实现定向推送。

## ⚠️ 五、注意事项

- **服务重启后连接丢失**
  → 前端必须实现自动重连机制。
- **连接数限制**
  → 高并发时注意线程和内存消耗，建议设置超时时间（如 new SseEmitter(5 * 60 * 1000L)）。
- **Nginx 配置**
  -> 确保 Nginx 不缓存 SSE 请求：

```nginx
location /api/sse {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_buffering off;
    proxy_cache off;
    chunked_transfer_encoding off;
} 
```

- **浏览器兼容性**
支持：Chrome、Firefox、Safari、Edge
不支持：IE（需 Polyfill）


## ✅ 总结
SSE 是一种轻量、高效的服务器推送技术，特别适合“服务器主动通知”的场景。结合 Spring Boot 的 SseEmitter 和前端 EventSource，可以快速实现实时消息系统。