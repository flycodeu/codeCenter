---
title: Java中使用Git提交代码
createTime: 2025/03/27 08:46:44
permalink: /article/37pml0o0/
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/22678c319934c0e968b1ef06041698b.jpg
tags:
- Git
---
## 创建空仓库

一定需要添加README.md文件，否则无法提交代码

![image-20250327090020163](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250327090020163.png)

## 创建token

https://github.com/settings/personal-access-tokens

![image-20250327090450110](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250327090450110.png)

![image-20250327090556582](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250327090556582.png)

![image-20250327090723607](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250327090723607.png)

复制生成的token到![image-20250327090834790](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250327090834790.png)



## 引入依赖

```xml
     <dependency>
            <groupId>org.eclipse.jgit</groupId>
            <artifactId>org.eclipse.jgit</artifactId>
            <version>5.13.0.202109080827-r</version>
        </dependency>
```



## Java代码

主要步骤：

1. 连接数据库
2. 创建文件夹和日志文件
3. 提交暂存区、提交commit、提交代码

里面的token就是刚才创建的

```java
   private static String writeLogs(String token, String log) throws GitAPIException {
        // 1. 连接Git仓库
        Git git = Git.cloneRepository()
                .setURI("https://github.com/flycodeu/openai-code-review-logs.git")
                .setDirectory(new File("repo"))
                .setCredentialsProvider(new UsernamePasswordCredentialsProvider(token, ""))
                .call();

        // 2. 创建文件夹
        String dateFolderName = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
        File dateFolder = new File("repo/" + dateFolderName);
        if (!dateFolder.exists()) {
            dateFolder.mkdirs();
        }

        // 3. 写入日志文件
        String fileName = generateRandomString(12) + ".md";
        File file = new File(dateFolder, fileName);
        try (FileWriter writer = new FileWriter(file)) {
            writer.write(log);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        // 4. 提交并推送更改
        git.add().addFilepattern(dateFolderName + "/" + fileName).call();
        git.commit().setMessage("Add new log via Github Actions").call();
        git.push().setCredentialsProvider(new UsernamePasswordCredentialsProvider(token, ""));

        return "https://github.com/flycodeu/openai-code-review-logs/blob/master/" + dateFolderName + "/" + fileName;

    }


    /**
     * 随机字母作为名称
     *
     * @param length
     * @return
     */
    private static String generateRandomString(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(characters.charAt(random.nextInt(characters.length())));
        }
        return sb.toString();
    }
```

![image-20250327094157784](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250327094157784.png)