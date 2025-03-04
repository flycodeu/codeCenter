---
title: git忽略提交文件集合
createTime: 2025/03/04 09:28:52
permalink: /article/3mhedlkk/
tags:
  - Git
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)


## 忽略文件集合
```gitignore

HELP.md
.gradle
gradle/
build/
!gradle/wrapper/gradle-wrapper.jar
!**/src/main/**/build/
!**/src/test/**/build/

### STS ###
.apt_generated
.classpath
.factorypath
.project
.settings
client.xml
.springBeans
.sts4-cache

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr
out/
!**/src/main/**/out/
!**/src/test/**/out/

### NetBeans ###
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/

### VS Code ###
.vscode/

### maven ###
target/
*.class
*.war
*.ear
*.zip
*.tar
*.tar.gz
.idea/
```

## gitignore文件不生效
如果项目已经被git托管了，此时添加忽略文件不能实现需求，必须要清除当前托管缓存，让忽略文件生效
```bash
git rm --cached -r .
git add .
git commit -m "Fix .gitignore not working"
```