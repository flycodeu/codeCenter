---
title: SpringBoot结合七牛云
createTime: 2025/03/04 09:28:52
permalink: /article/cliv5mtd/
tags:
  - SpringBoot
  - 对象存储
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)


## 1. 基础上传文件 thymeleaf版本
### 1.1 需要引入相关依赖
```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
```

### 1.2 yml配置
```yml
spring:
  servlet:
    multipart: 
      max-request-size: 1024MB   
      max-file-size: 1024MB       
  profiles:
    active: local 
  mvc:
   static-path-pattern: /static/** 
  thymeleaf:
    enabled: true
    prefix: classpath:/templates/
    suffix: .html
```
### 1.3 controller编写
```java
@Controller
@RequestMapping( "/img" )
@Slf4j
public class FileController {
    @GetMapping( "/back" )
    public String showPicture() {
        return "index";
    }
    @PostMapping( value = "/uploadImg" )
    public String uploadImg(HttpServletRequest req, @RequestParam( "file" ) MultipartFile file, Model m) {
        try {
            // 根据时间戳创建新的文件名，这样即便是第二次上传相同名称的文件，也不会把第一次的文件覆盖了
            String fileName = System.currentTimeMillis() + file.getOriginalFilename();
            // 通过 req.getServletContext().getRealPath("") 获取当前项目的真实路径，然后拼接前面的文件名
            log.info("服务器地址{}", req.getServletContext().getRealPath(""));
            String destFileName = req.getServletContext().getRealPath("") + "uploaded" + File.separator + fileName;
            // 第一次运行的时候，这个文件所在的目录往往是不存在的，这里需要创建一下目录
            File destFile = new File(destFileName);
            destFile.getParentFile().mkdirs();
            // 把浏览器上传的文件复制到希望的位置
            file.transferTo(destFile);
            // 把文件名放在 model 里，以便后续显示用
            m.addAttribute("fileName", fileName);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            return "上传失败，" + e.getMessage();
        } catch (IOException e) {
            e.printStackTrace();
            return "上传失败，" + e.getMessage();
        }
        return "picture";
    }
}
```

### 1.4 前端界面（放在templates里面）
index.html主界面
```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>SpringBoot上传文件</title>
</head>
<body>
<h1>测试SpringBoot文件上传</h1>
<form th:action="@{/img/uploadImg}" method="post" enctype="multipart/form-data">
    <input type="file" name="file" accept="image/*"/>
    <div style="height: 20px"></div>
    <input type="submit" value="上传文件">
</form>
</body>
</html>
```

picture.html上传界面回显照片
```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<h1>上传成功</h1>
<img th:src="@{/uploaded/{fileName}(fileName=${fileName})}">

</body>
</html>
```

### 1.5 项目访问
启动项目浏览器输入http://localhost:8080/img/back,进行文件上传


## 2. ajax版本文件上传回显
### 2.1 controller编写
```java

@RequestMapping( "/file" )
@RestController
public class FileControllerAjax {

    /**
     * 上传图片
     *
     * @param req  请求
     * @param file 接收上传的文件
     * @return
     */
    @PostMapping( "/uploadImg" )
    public JsonResult uploadImg(HttpServletRequest req, @RequestParam( "file" ) MultipartFile file) throws
            Exception {
        String originalFilename = file.getOriginalFilename();
        // 根据时间戳创建新的文件名，这样即便是第二次上传相同名称的文件，也不会把第一次的文件覆盖了
        String fileName = System.currentTimeMillis() + file.getOriginalFilename();
        // 通过 req.getServletContext().getRealPath("") 获取当前项目的真实路径，然后拼接前面的文件名
        String destFileName = req.getServletContext().getRealPath("") + "uploaded" + File.separator +
                fileName;
        // 第一次运行的时候，这个文件所在的目录往往是不存在的，这里需要创建一下目录
        File destFile = new File(destFileName);
        destFile.getParentFile().mkdirs();
        // 把浏览器上传的文件复制到希望的位置
        file.transferTo(destFile);
        return JsonResult.success().data("filename", fileName);
    }
}
```
### 2.2 html界面编写
uploadFile.html放在resources里面的static里面
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>文件上传</title>
    <script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
</head>
<body>
<input type="file" id="file">
<input type="button" onclick="upload()" value="上传">
<!--显示上传图片的内容-->
<div id="result">
    <img id="img" src=""/>
</div>
</body>
<script>
    function upload() {
        var sourceFile = $("#file")[0].files[0];
        var formData = new FormData();
        formData.append("file", sourceFile);
        $.ajax({
            type: 'post',
            url: 'file/uploadImg',
            data: formData,
            processData: false, //不处理数据
            contentType: false, //不设置类型
            success: function (temp) {
                if (temp.code === 0) {
                    $("#img").attr("src","uploaded/" + temp.data.filename);
                }
            }
        })
    }
</script>
</html>
```

### 2.3 项目访问
http://localhost:8080/uploadFile.html




## 3. 结合七牛云

以上两种方法都存在一个问题就是上传之后的文件是存放在对应的服务器里面的，最终是以临时文件的方式存放在c盘里面的，也不怎么好改变服务器上传的路径，也不怎么方便显示新的路径，而且图片多了对于服务器也不好，所以选取对应的七牛云作为文件上传的服务器，对应的还有腾讯云的OSS存储，阿里的对应存储，这里展示七牛云的使用方式，主要使用方法都在七牛云的java sdk里面。

### 3.1 引入依赖
```xml
        <dependency>
            <groupId>com.qiniu</groupId>
            <artifactId>qiniu-java-sdk</artifactId>
            <version>[7.13.0, 7.13.99]</version>
        </dependency>


        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
```
官网地址

### 3.2  yml配置文件
```yml
qiniu:
  accessKey: xx
  secretKey: xx
  # 空间名称
  bucket: xx
  url: xxx
```
写yml的主要原因是读取比较方便，也可以自己写配置类进行读取
其中ak,sk在七牛云的个人中心的密钥管理可以获取(https://portal.qiniu.com/developer/user/key)里面。
bucket是自己空间的名字,可以在七牛云的对象存储的空间管理里面看见，例如我的是flybase
![sbjhqny-0](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/sbjhqny-0.png)
这里面需要注意下存储区域，等一会需要用到。
里面的url是自己的域名地址，以http或者https形式。

### 3.3 通用返回类,也可以不用，不过为了展示方便。
```java
@Data

public class JsonResult {
    /*状态码*/
        private Integer code;
        /*响应消息*/
        private String message;
        /*响应是否成功标志*/
        private boolean success;
        /*响应的数据(添加多个数据)*/
        private Map<String, Object> data = new HashMap<>();

    /**
     * 响应成功函数
     *
     * @return 
     */
    public static JsonResult success() {
        JsonResult jsonResult = new JsonResult();
        jsonResult.setCode(MsgEnum.SUCCESS.getCode());
        jsonResult.setMessage("响应成功");
        jsonResult.setSuccess(true);
        return jsonResult;
    }

    /**
     * 响应失败函数
     *
     * @return
     */
    public static JsonResult fail() {
        JsonResult jsonResult = new JsonResult();
        jsonResult.setCode(MsgEnum.FAILED.getCode());
        jsonResult.setMessage("响应失败");
        jsonResult.setSuccess(false);
        return jsonResult;
    }

    /**
     * 添加响应数据
     *
     * @return
     */
    public JsonResult data(String key, Object value) {
        this.data.put(key, value);
        return this;
    }

    /**
     * 修改状态码
     *
     * @return
     */
    public JsonResult code(Integer code) {
        this.setCode(code);
        return this;
    }

    /**
     * 修改消息
     *
     * @return
     */
    public JsonResult mess(String str) {
        this.setMessage(str);
        return this;
    }
}
```
通用异常编码
```java
public enum MsgEnum {
    /**
     * 成功
     */
    SUCCESS(0, "请求成功"),
    /**
     * 失败
     */
    FAILED(1, "请求失败"),
    /**
     * 消息码
     */
    private Integer code;
    /**
     * 消息内容
     */
    private String msg;

    private MsgEnum(Integer code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public Integer getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }

}

```

### 3.4 编写工具类
需要将yml里面的相关配置读取出来
总体上传步骤：
1. 获取文件流
2. 创建文件名字存储
3. 配置七牛云配置类，写入ak，sk
4. 获取对应的token
5. 返回上传图片的url地址

```java

@Component
public class ImageUtils {

    @Value("${qiniu.accessKey}")
    private String accessKey;

    @Value("${qiniu.secretKey}")
    private String accessSecretKey;

    @Value("${qiniu.bucket}")
    private String bucket;

    @Value("${qiniu.url}")
    private String url;

	/**
     * 多文件上传
     * @param multipartFiles
     * @return
     */
    public Map<String, List<String>> uploadImages(MultipartFile[] multipartFiles){
        Map<String,List<String>> map = new HashMap<>();
        List<String> imageUrls = new ArrayList<>();
        for(MultipartFile file : multipartFiles){
            imageUrls.add(uploadImageQiniu(file));
         }
        map.put("imageUrl",imageUrls);
        return map;
    }

    /**
     * 上传图片到七牛云
     * @param multipartFile
     * @return
     */
    private String uploadImageQiniu(MultipartFile multipartFile){
        try {
            //1、获取文件上传的流
            byte[] fileBytes = multipartFile.getBytes();
            //2、创建日期目录分隔(这个也可以按照自己需求修改)
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd");
            String datePath = dateFormat.format(new Date());
            //3、获取文件名
            String originalFilename = multipartFile.getOriginalFilename();
            String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = datePath+"/"+UUID.randomUUID().toString().replace("-", "")+ suffix;
            //4.构造一个带指定 Region 对象的配置类
            //Region.huanan(根据自己的对象空间的地址选)
            Configuration cfg = new Configuration(Region.huanan());
            UploadManager uploadManager = new UploadManager(cfg);
            //5.获取七牛云提供的 token
            Auth auth = Auth.create(accessKey, accessSecretKey);
            String upToken = auth.uploadToken(bucket);
            uploadManager.put(fileBytes,filename,upToken);
            return url+filename;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}
```


### 3.5 编写controller
```java
@RestController
@RequestMapping( "/api" )
public class ImageController {

    @Autowired
    private ImageUtils imageUtils;

    @PostMapping( "/image/upload" )
    public JsonResult uploadImage(@RequestParam( value = "file", required = false ) MultipartFile[] multipartFile) {
        if (ObjectUtils.isEmpty(multipartFile)) {
            return JsonResult.fail().data("data", "请选择文件");
        }
        Map<String, List<String>> uploadImagesUrl = imageUtils.uploadImages(multipartFile);
        return JsonResult.success().data("data", uploadImagesUrl);
    }
}
```

### 3.6 测试
需要注意文件上传相应的参数是在body里面选择文件，上传成功会返回对应的url，可以将这个url进行页面展示。
![sbjhqny-1](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/sbjhqny-1.png)


### 3.7 vue3
需要安装elment plus
文件上传网: https://element-plus.org/zh-CN/component/upload.html#%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F

看了一下官方的以及网上大部分网站的制作，对我个人都不是太满意的，所以自己重写
```vue
      <el-upload
          class="avatar-uploader"
          action="#"
          :auto-upload="false"
          :show-file-list="true"
          :headers="headers"
          :http-request="uploadPicture"
          :on-change="handlePictureChange"
          :on-success="handleAvatarSuccess"
          :on-remove="handlePictureRemove"
          :before-upload="handlePictureBeforeUpload"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>

        <el-button @click="handleConfirmPostPicture">确认上传</el-button>
```
这里是采用了一个按钮点击上传来触发事件的
action: 默认的action事件，可以写入对应上传地址，但是一半不使用这种方式，这种方式不大方便，可以随便设置。
show-file-list：展示列表文件
headers：请求头，由于这边使用的token验证，所以需要添加
http-request：自定义处理文件上传的方法

```js
const headers = ref({ token: store.getters.GET_TOKEN });
const imageUrl = ref("");

// 处理成功
const handleAvatarSuccess = async (response, file, fileList) => {
  console.log("ok");
  console.log(response);
  // imageUrl.value = response.data.data;
  // console.log(res.data);
};
// 改变图片
const handlePictureChange = (file, fileList) => {
  uploadTravelCover.value = file;
  console.log("file:", file);
};
// 出错处理
const handlePictureError = () => {
  console.log("ok");
};

// 上传图片
const uploadPicture = async (file) => {
  const formData = new FormData();
  formData.append("file", file.raw);
  try {
    const response = await requestUtil.fileUpload("/picture/upload", formData);
    if (response.data.code === 0) {
      imageUrl.value = response.data.data; // 处理后端返回的图片URL
      ElMessage.success("上传成功");
    } else {
      ElMessage.error("上传失败");
    }
  } catch (error) {
    console.error("上传失败", error);
    ElMessage.error("上传失败");
  }
};
// 移除图片
const handlePictureRemove = () => {
  console.log("ok");
};

// 文件类型
const fileType = ref([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "txt",
  "png",
  "jpg",
  "bmp",
  "jpeg",
]);
const handlePictureBeforeUpload = (file) => {
  if (file.type !== "" || file.type != null || file.type !== undefined) {
    //截取文件的后缀，判断文件类型
    const FileExt = file.name.replace(/.+\./, "").toLowerCase();
    //计算文件的大小
    const isLt5M = file.size / 1024 / 1024 < 50; //这里做文件大小限制
    //如果大于50M
    if (!isLt5M) {
      ElMessage.error("上传文件大小不能超过 50MB!");
      return false;
    }
    //如果文件类型不在允许上传的范围内
    if (fileType.value.includes(FileExt)) {
      return true;
    } else {
      this.$message.error("上传文件格式不正确!");
      return false;
    }
  }
};

// 上传图片按钮
const handleConfirmPostPicture = async () => {
  if (!uploadTravelCover.value || !uploadTravelCover.value.raw) {
    ElMessage.warning("请先选择图片");
    return;
  }
  await uploadPicture(uploadTravelCover.value);
};
```