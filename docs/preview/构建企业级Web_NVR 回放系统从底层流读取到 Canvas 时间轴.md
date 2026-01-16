---
title: 构建企业级 Web NVR 回放系统：从底层流读取到 Canvas 时间轴
createTime: 2025/12/25 15:16:34
permalink: /article/vmb109dj/
tags:
  - MediaMTX
  - 视频
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/efa331c41ff52b964587567007ab846d.jpg
---

<ImageCard
    image="https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/efa331c41ff52b964587567007ab846d.jpg"
    href="/"
    width=400
    center=true
/>

# 构建企业级 Web NVR 回放系统：从底层流读取到 Canvas 时间轴
在安防视频监控项目中，"历史回放"是最考验前端交互与后端稳定性的功能模块。与普通的视频网站不同，NVR 系统需要处理碎片化的视频文件（fmp4）、绝对时间轴的映射以及多片段的无缝衔接。

本文将基于 Spring Boot 和原生 JS，复盘如何实现一个支持按日检索、平滑时间轴滚动以及解决 Chrome demuxer seek failed 问题的完整方案。

## 一、 系统架构设计
- 视频源：MediaMTX 录制的 fmp4 文件，按日期分文件夹存储（流名称/日期/时间.mp4）。
- 后端：Spring Boot，负责文件检索和基于 RandomAccessFile 的字节流分发。
- 前端：HTML5 video + Canvas 自绘时间轴。不依赖庞大的第三方播放器库，以保证对底层 Seek 行为的控制。

## 二、 后端：稳健的视频流分发
对于 fmp4 格式（安防录像常用格式），Spring Boot 默认的 ResourceRegion 在处理 Chrome 的 Range 请求时，容易因 Content-Length
计算误差导致 FFmpegDemuxer 崩溃。我们需要手写底层的 IO 处理。

### 1. 文件检索接口
   首先，我们需要根据日期扫描磁盘，返回当天的录像片段列表。
```Java
@GetMapping("/search")
public R<List<VideoSegment>> search(@RequestParam String streamName, @RequestParam String date) {
// 1. 获取存储卷物理路径
HmRecordingPlan plan = planService.getByStream(streamName);
String dayPath = plan.getRootPath() + "/" + streamName + "/" + date;

    File dir = new File(dayPath);
    if (!dir.exists()) return R.data(new ArrayList<>());

    // 2. 扫描所有 .mp4 文件
    List<VideoSegment> segments = new ArrayList<>();
    File[] files = dir.listFiles((d, name) -> name.endsWith(".mp4"));
    
    if (files != null) {
        for (File f : files) {
            // 解析文件名获取时间戳 (假设文件名格式: 14-00-00.mp4)
            long startTime = parseTimeFromFileName(date, f.getName());
            long duration = 10 * 60 * 1000; // 假设切片为10分钟，生产环境应读取文件元数据
            
            // 生成流地址，指向下面的 streamVideo 接口
            String url = String.format("/static/videos/%d/%s/%s/%s", 
                plan.getVolumeId(), streamName, date, f.getName());
            
            segments.add(new VideoSegment(startTime, startTime + duration, url));
        }
    }
    // 按时间排序
    segments.sort(Comparator.comparingLong(VideoSegment::getBeginTime));
    return R.data(segments);

}
```
### 2. 硬核流读取（解决 Seek 失败的核心）
   这是解决前端“转圈”和报错的关键。使用 RandomAccessFile 精确控制 Seek 和 206 Partial Content 响应。
```Java
@GetMapping("/{volumeId}/{streamName}/{date}/{fileName}")
public void streamVideo(
@PathVariable Long volumeId,
/* ...其他参数... */,
HttpServletRequest request,
HttpServletResponse response) throws IOException {

    File file = locateFile(volumeId, streamName, date, fileName);
    if (!file.exists()) {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        return;
    }

    long fileLength = file.length();
    long start = 0;
    long end = fileLength - 1;

    // 解析 Range 头 (例如: bytes=102400-)
    String range = request.getHeader("Range");
    if (range != null && range.startsWith("bytes=")) {
        String[] ranges = range.substring(6).split("-");
        try {
            if (ranges.length > 0 && !ranges[0].isEmpty()) start = Long.parseLong(ranges[0]);
            if (ranges.length > 1 && !ranges[1].isEmpty()) end = Long.parseLong(ranges[1]);
        } catch (NumberFormatException ignored) {}
    }
    
    // 修正结束位置
    if (end >= fileLength) end = fileLength - 1;
    long contentLength = end - start + 1;

    // 设置响应头 (跨域头必不可少，否则 Canvas 截图会跨域)
    response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
    response.setContentType("video/mp4");
    response.setHeader("Accept-Ranges", "bytes");
    response.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + fileLength);
    response.setHeader("Content-Length", String.valueOf(contentLength));
    
    // 开始传输
    try (RandomAccessFile randomFile = new RandomAccessFile(file, "r")) {
        randomFile.seek(start); // 物理 Seek
        byte[] buffer = new byte[64 * 1024]; // 64KB 缓冲
        long bytesToRead = contentLength;
        
        while (bytesToRead > 0) {
            int len = randomFile.read(buffer, 0, (int) Math.min(bytesToRead, buffer.length));
            if (len == -1) break;
            response.getOutputStream().write(buffer, 0, len);
            bytesToRead -= len;
        }
        response.getOutputStream().flush();
    } catch (IOException e) {
        // 客户端中断连接是正常现象，忽略即可
    }

}
```
## 三、 前端：时间轴与连贯播放
前端的核心难点在于：如何把一个个独立的视频文件，抽象成一个连续的时间流。
### 1. 播放器配置
   HTML 配置至关重要，必须禁用预加载，防止 fmp4 头部解析锁死。
```HTML
<video id="player" playsinline preload="none" crossorigin="anonymous"></video>
```
### 2. 渲染循环：实现丝滑的时间轴滚动
不要使用 video.ontimeupdate 更新 UI，它的频率太低（250ms/次），会导致时间轴看起来卡顿。使用 requestAnimationFrame。
```JavaScript
let viewTime = Date.now(); // 当前视图中心代表的绝对时间戳

function startRenderLoop() {
const video = document.getElementById('player');

    function loop() {
        // 如果视频正在播放，根据当前相对时间计算绝对时间
        // 公式：当前绝对时间 = 当前片段开始时间 + 视频播放秒数 * 1000
        if (!isDragging && !video.paused) {
            const currentSrc = decodeURIComponent(video.src).split('?')[0];
            const currentSeg = videoSegments.find(s => currentSrc.includes(s.url));
            
            if (currentSeg) {
                viewTime = currentSeg.beginTime + (video.currentTime * 1000);
            }
        }

        // 每一帧都重绘 Canvas
        drawTimeline(); 
        requestAnimationFrame(loop);
    }
    loop();

}
```
### 3. Canvas 绘制逻辑
Canvas 绘制的核心是将时间戳映射为 X 轴坐标。
```JavaScript
function drawTimeline() {
const w = canvas.width;
const pxPerMs = 0.05; // 缩放比例

    // 计算视口的时间范围
    const timeWindow = w / pxPerMs;
    const startTime = viewTime - timeWindow / 2;
    const endTime = viewTime + timeWindow / 2;

    // 绘制录像片段（绿色条）
    ctx.fillStyle = 'rgba(46, 204, 113, 0.6)';
    videoSegments.forEach(seg => {
        // 视口外剔除优化
        if (seg.endTime < startTime || seg.beginTime > endTime) return;

        const x = (seg.beginTime - startTime) * pxPerMs;
        const width = (seg.endTime - seg.beginTime) * pxPerMs;
        ctx.fillRect(x, 60, Math.max(width, 2), 40);
    });
    
    // 绘制时间刻度... (代码略，原理同上)

}
```
### 4. 连贯播放与安全跳转（防 Crash）
这是解决“转圈”问题的最后一道防线。
- 防缓存：URL 加时间戳。
- 安全 Seek：文件开头 2 秒内不执行 video.currentTime = x，直接从头播。
- 自动连播：监听 ended 事件。
```JavaScript
// 播放指定片段逻辑
function playSegment(seg, offsetSeconds) {
const video = document.getElementById('player');

    // 1. 强制防缓存
    const playUrl = `${API_BASE}${seg.url}?_t=${Date.now()}`;
    
    // 2. 切换源的标准流程
    video.pause();
    video.removeAttribute('src'); 
    video.load(); // 重置解码器
    video.src = playUrl;

    // 3. 必须在元数据加载后才能跳转
    const onMetadata = () => {
        video.removeEventListener('loadedmetadata', onMetadata);
        
        // 【核心 Hack】避开 fmp4 头部 Seek Bug
        // 如果跳转目标在文件开头 2秒内，直接从 0 开始播，不要 Seek
        if (offsetSeconds > 2.0 && offsetSeconds < video.duration) {
            video.currentTime = offsetSeconds;
        } else {
            video.currentTime = 0;
        }
        
        video.play().catch(console.warn);
    };
    
    video.addEventListener('loadedmetadata', onMetadata);
    video.load(); // 显式触发加载

}

// 监听播放结束，自动切片
video.addEventListener('ended', () => {
// 查找当前片段的下一个
const currentSeg = findSegmentByUrl(video.currentSrc);
const nextSeg = videoSegments.find(s => s.beginTime >= currentSeg.endTime - 1000); // 1秒容错
if (nextSeg) {
playSegment(nextSeg, 0); // 从下一个片段的 0秒开始播
}
});
```
## 四、 总结
要实现一个工业级的 Web 录像回放系统，关键在于细节的把控：
- 后端：放弃高级封装，使用 RandomAccessFile 确保对 Range 请求的字节级响应。
- 协议：理解 fmp4 格式的局限性，尽量避免在文件头部的 Seek 操作。
- 视觉：利用 requestAnimationFrame 和数据驱动的方式，将离散的视频文件在视觉上整合成一条连续的时间轴。