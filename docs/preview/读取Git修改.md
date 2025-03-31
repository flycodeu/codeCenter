---
title: 读取Git修改
createTime: 2025/03/26 10:26:05
permalink: /article/qtdq6mom/
tags:
  - Java
  - Git
cover: https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/b0accf531a544795e92b0c042a29563.jpg
---



现在需要在Java命令中读取Git相关命令，获取用户名、提交日期、提交分支、提交描述、提交代码相关信息。

[Git命令](https://www.runoob.com/git/git-tutorial.html)

## 读取日志

在git中，读取命令如下

```bash
git log -1
```

![image-20250331100732093](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250331100732093.png)

我们可以从中提取相关信息

---

| 占位符 | 含义                          |
| ------ | ----------------------------- |
| %H     | 提交的完整哈希值              |
| %h     | 提交的简短哈希值              |
| %an    | 作者姓名                      |
| %ae    | 作者邮箱                      |
| %cn    | 提交者姓名（Committer Name）  |
| %ce    | 提交者邮箱（Committer Email） |
| %s     | 提交信息的主题（第一行）      |
| %b     | 提交信息的正文                |
| %cd    | 提交日期                      |
| %cr    | 提交日期的相对时间            |

---



以获取用户名为例

```bash
git log -1 --pretty=format:'%an'
```

通过以上命令即可实现获取用户提交相关信息

---



### 读取用户名、提交日期、提交描述、提交哈希值

在java中，可以使用ProcessBuilder来运行相关命令。

#### 1. 编写通用方法

只需要传入占位符

```java
public String getGitInfo(String tags) throws IOException {
        ProcessBuilder logProcessBuilder = new ProcessBuilder("git", "log", "-1", "--pretty=format:" + tags);
        logProcessBuilder.directory(new File("."));
        Process logProcess = logProcessBuilder.start();
        BufferedReader logReader = new BufferedReader(new InputStreamReader(logProcess.getInputStream()));
        return logReader.readLine();
    }
```

#### 2. 获取基础信息

```bash
    public void testGetGitConfig() throws IOException, InterruptedException {
        // 1. 作者名
        String author = getGitInfo("%an");
        System.out.println("Author: " + author);
        // 2. 日期
        String date = getGitInfo("%cd");
        System.out.println("Date: " + date);
        // 3. 描述
        String description = getGitInfo("%s");
        System.out.println("Description: " + description);
        // 4. 哈希值，用于获取提交代码
        String hashCode = getGitInfo("%h");
        System.out.println("Hash Code: " + hashCode);
    }
```

![image-20250331092034073](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250331092034073.png)



## 读取提交代码

我们需要使用git中的diff命令,结合哈希值获取历史提交命令

![image-20250331100627725](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250331100627725.png)



### 1. 编写通用方法

需要获取最后一次提交的哈希值，通过diff命令获取上一次提交的历史文件

```java
    public String getDiffCode(String lastCommitHash) throws Exception {
        // 1. 读取Git Diff更改记录
        ProcessBuilder diffProcessBuilder = new ProcessBuilder("git", "diff", lastCommitHash + "^", lastCommitHash);
        diffProcessBuilder.directory(new File("."));
        Process process = diffProcessBuilder.start();
        // 读取输出流
        BufferedReader diffReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        StringBuilder processOutput = new StringBuilder();
        while ((line = diffReader.readLine()) != null) {
            processOutput.append(line).append("\n");
        }
        // 2. 获取退出码
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new Exception("Diff process exited with code " + exitCode);
        }
        return processOutput.toString();
    }
```

### 2. 获取历史提交文件

```java
  		 // 5. 获取提交代码
        String diffCode = getDiffCode(hashCode);
        System.out.println(diffCode);
```

