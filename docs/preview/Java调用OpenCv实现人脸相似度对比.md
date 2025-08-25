
## 引入依赖
```xml
<dependency>
    <groupId>org.openpnp</groupId>
    <artifactId>opencv</artifactId>
    <version>4.5.1-2</version>
</dependency>
```

## 下载opencv
[opencv下载](https://github.com/opencv/opencv/releases?page=1)

## 编写测试两张图片对比
```java
package com.hmifo.facerecognitionsystem;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.springframework.boot.test.context.SpringBootTest;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

@Slf4j
class FaceRecognitionSystemApplicationTests {

    @Test
    void contextLoads() {
        Path referenceImagePath1 = Paths.get("src/main/resources/all", "demo-01" + ".jpg");
        Path referenceImagePath2 = Paths.get("src/main/resources/all", "demo-02" + ".jpg");
        Mat referenceImage1 = Imgcodecs.imread(referenceImagePath1.toString());
        Mat referenceImage2 = Imgcodecs.imread(referenceImagePath2.toString());
        double similarity = calculateSimilarity(referenceImage1, referenceImage2);
        log.info("图像相似度: {}", similarity);
    }


    private double calculateSimilarity(Mat img1, Mat img2) {
        try {
            // 调整大小为相同尺寸
            Mat resizedImg1 = new Mat();
            Mat resizedImg2 = new Mat();
            Size commonSize = new Size(100, 100);
            Imgproc.resize(img1, resizedImg1, commonSize);
            Imgproc.resize(img2, resizedImg2, commonSize);

            // 转换为灰度图
            Mat grayImg1 = new Mat();
            Mat grayImg2 = new Mat();
            Imgproc.cvtColor(resizedImg1, grayImg1, Imgproc.COLOR_BGR2GRAY);
            Imgproc.cvtColor(resizedImg2, grayImg2, Imgproc.COLOR_BGR2GRAY);

            // 计算直方图
            Mat hist1 = new Mat();
            Mat hist2 = new Mat();
            Imgproc.calcHist(
                    Arrays.asList(grayImg1),
                    new MatOfInt(0),
                    new Mat(),
                    hist1,
                    new MatOfInt(256),
                    new MatOfFloat(0, 256)
            );
            Imgproc.calcHist(
                    Arrays.asList(grayImg2),
                    new MatOfInt(0),
                    new Mat(),
                    hist2,
                    new MatOfInt(256),
                    new MatOfFloat(0, 256)
            );

            // 归一化直方图
            Core.normalize(hist1, hist1, 0, 1, Core.NORM_MINMAX);
            Core.normalize(hist2, hist2, 0, 1, Core.NORM_MINMAX);

            // 比较直方图 (相关性方法，值越高越相似)
            double similarity = Imgproc.compareHist(hist1, hist2, Imgproc.CV_COMP_CORREL);

            // 释放资源
            resizedImg1.release();
            resizedImg2.release();
            grayImg1.release();
            grayImg2.release();
            hist1.release();
            hist2.release();

            return similarity;
        } catch (Exception e) {
            log.error("计算图像相似度失败: {}", e.getMessage());
            return 0.0;
        }
    }
}
```

但是运行会报错，我们需要修改JVM配置，可以读取之前下载的opencv相关文件
```
 -ea -Djava.library.path="D:\Program Files\opencv\opencv\build\java\x64"
```
在如下位置
![image-01](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/20250821161714.png)
