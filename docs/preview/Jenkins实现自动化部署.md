---
title: Jenkins实现自动化部署
createTime: 2025/03/04 09:28:52
permalink: /article/u0e0xdqk/
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

## 环境
- Centos 7
- Java 11


## 前置软件
### JDK
建议使用11版本，目前Jenkins已经不维护Java8，导致很多插件无法安装。

####  1. 本地下载Java11安装包

镜像下载Java地址：https://repo.huaweicloud.com/java/jdk/11.0.2+7/

![image-20250303102908889](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303102908889.png)

![image-20250303102902013](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303102902013.png)

#### 2. 上传至服务器

我这里上传至/usr/local

![image-20250303103144603](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303103144603.png)

解压文件

```bash
tar -zxvf jdk-11.0.2_linux-x64_bin.tar.gz
```

#### 3. 配置profile环境

```bash
 vim /etc/profile
```

在profile最后加入

```bash
#java
JAVA_HOME=/usr/local/jdk-11.0.2
JRE_HOME=/usr/local/jdk-11.0.2/jre
PATH=$PATH:$JAVA_HOME/bin:$JRE_HOME/bin
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar:$JRE_HOME/lib
export JAVA_HOME JRE_HOME PATH CLASSPATH
```

重新加载配置

```bash
source /etc/profile
```

#### 4. 查看是否成功

```bash
java -version
```

![image-20250303103507853](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303103507853.png)

### MAVEN

下载地址 https://maven.apache.org/download.cgi

![image-20250303104920109](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303104920109.png)

#### 1. 上传至服务器

文件存放在/opt/maven目录

![image-20250303105501732](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303105501732.png)

#### 2. 解压

```bash
tar -zxvf apache-maven-3.9.9-bin.tar.gz
```

#### 3. 配置profile环境

```bash
vim /etc/profile
```

```bash
#maven
MAVEN_HOME=/opt/maven/apache-maven-3.9.9
export MAVEN_HOME
export PATH=$PATH:$MAVEN_HOME/bin
```

重新加载配置

```bash
source /etc/profile
```

#### 4. 查看是否成功

```bash
mvn -version
```

![image-20250303105902490](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303105902490.png)

#### 5. 配置镜像

```bash
vim /opt/maven/apache-maven-3.9.9/conf/settings.xml
```

![image-20250303110050263](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303110050263.png)

```bash
<mirror>
　　<id>alimaven</id>
　　<name>aliyun maven</name>
　　<url>http://maven.aliyun.com/nexus/content/groups/public/</url>
　　<mirrorOf>central</mirrorOf>
</mirror>
```

![image-20250303110005916](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303110005916.png)

### Git

#### 1. yum安装

```bash
yum install git
```

#### 2. 验证是否安装成功

```bash
git --version
```

![image-20250303110254585](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303110254585.png)



### Node安装

Node需要注意版本，此处采用18.20.4版本，尽量和自己版本一致。

#### 1. 下载安装包

https://unofficial-builds.nodejs.org/download/release/v18.20.4/

![image-20250303144253069](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303144253069.png)

#### 2. 上传解压

此处上传值/usr/local

![image-20250303144448818](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303144448818.png)

```bash
tar -zxvf node-v18.20.4-linux-x64-glibc-217.tar.gz
```

重命名为node-v18.20.4

```bash
mv node-v18.20.4-linux-x64-glibc-217.tar.gz node-v18.20.4
```

#### 3. 配置环境

```bash
vim /etc/profile
```

```bash
# node
export NODE_HOME=/usr/local/node-v18.20.4
export PATH=$NODE_HOME/bin:$PATH
```

```bash
source /etc/profile
```



#### 4. 验证是否成功

```bash
 node -v
 npm -v
```

![image-20250303144806954](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303144806954.png)

#### 5. 更换镜像源

可以使用nrm或者使用npm config set xxx（镜像地址）

```bash
npm install -g nrm
```

```bash
# 列出所有可用的镜像源
nrm ls
```

![image-20250303145858838](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303145858838.png)

```bash
nrm use tencent
```

验证是否更换成功

```bash
npm config get registry
```

![image-20250303150049535](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303150049535.png)

### 安装Jenkins

此处采用war包方式

#### 1. 下载war包

https://mirrors.tuna.tsinghua.edu.cn/jenkins/war/2.499/

![image-20250303110712205](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303110712205.png)

注意选择版本，不要低于2.346.1。

#### 2. 上传至服务器

位置：/opt/jenkins

![image-20250303110929834](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303110929834.png)



#### 3. 运行war

```bash
nohup java -jar jenkins.war > nohup.out 2>&1 &
```



#### 4. 开放端口

默认端口是8080，需要放开端口，不然无法访问。

```bash
sudo firewall-cmd --zone=public --add-port=8080/tcp --permanent
```

重载防火墙

```bash
sudo firewall-cmd --reload
```

查看所有开放端口

```bash
sudo firewall-cmd --zone=public --list-ports
```



#### 5. 访问界面

IP:8080

一开始可能出现以下报错

![image-20250303111626407](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303111626407.png)

需要安装fontConfig，然后重载配置

```bash
yum install fontconfig
```

![image-20250303111828188](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303111828188.png)

正常会进入当前界面

![image-20250303112014081](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303112014081.png)

#### 6. 查看密码

```bash
cat /root/.jenkins/secrets/initialAdminPassword
```

#### 7. 安装配置Jenkins

1. 安装插件

![image-20250303112211864](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303112211864.png)

2. 新建用户

![image-20250303130523026](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303130523026.png)

3. 配置Java、Maven、Git

进入Manage Jenkins

![image-20250303131034006](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303131034006.png)

![image-20250303131147015](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303131147015.png)

![image-20250303131220574](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303131220574.png)

![image-20250303131253719](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303131253719.png)





#### 8. 安装额外插件

进入Plugin界面

##### 1. [Publish Over SSH](https://plugins.jenkins.io/publish-over-ssh)

可以远程拉取git仓库代码。

![image-20250303131555617](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303131555617.png)



##### 2. [NodeJS](https://plugins.jenkins.io/nodejs)

可以部署前端

![image-20250303131735212](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303131735212.png)

##### 3. [Maven Integration](https://plugins.jenkins.io/maven-plugin)

可以执行Maven打包命令

![image-20250303133421020](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303133421020.png)

#### Jenkins默认地址

/root/.jenkins

![image-20250303135353233](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303135353233.png)

### Jenkins后端部署使用

#### 1. 配置远程仓库信息

进入System

![image-20250303133009036](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303133009036.png)

![image-20250303133338695](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303133338695.png)

需要先在服务器里面创建对应的文件地址，我这边地址是，新建一个文件夹，里面新建api文件夹，这个地址设置为远程代码存放位置

![image-20250303142812624](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303142812624.png)

#### 2. 创建Maven项目

![image-20250303133906392](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303133906392.png)

 #### 3. 配置Git仓库地址

需要写入仓库地址，以及录入对应的用户名，密码，否则无法连接远程仓库。

![image-20250303133959620](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303133959620.png)

![image-20250303134504179](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303134504179.png)

保存

#### 4. 初次构建

点击Build Now系统会自动构建项目，点击构建历史里面的数据，可以浏览详细执行情况

![image-20250303134847539](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303134847539.png)

![image-20250303134956856](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303134956856.png)

![image-20250303135417893](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303135417893.png)

拉取代码成功，可以在/root/.jenkins/workspace查看拉取的代码

#### 5. Post Steps运行Jar包

我们可以通过以上方式拉取代码到本地服务器，但是这个代码此时并不能直接执行，我们需要将代码编译成Jar包，通过java -jar的方式运行程序。我们需要在拉取完成后，执行编译代码，继续进入配置环境，找到构建代码位置，选择SSH连接。

![image-20250303135919288](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303135919288.png)

![image-20250303135959877](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303135959877.png)

![image-20250303141244159](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303141244159.png)

###### 数据流重定向

将某个命令执行后要出现在屏幕上的数据传输到其他地方

标准输出(stdin):代码为0，使用<或者<<

标准输入(stdout): 代码为1，使用>或>>

标准错误输出(stderr): 代码为2,使用2> 或者2>>

\>覆盖写

\>>追加

###### 运行结果

可以在指定步骤1中配置的目录查看当前生成的jar包。

![image-20250303141444599](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303141444599.png)

有了Jar包，就可以运行代码，上面已经写好了运行jar的代码，会在构建后自动执行，可以通过jps查看当前运行Id。

![image-20250303141902666](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303141902666.png)

#### 6. Pre Steps

每次拉取代码到本地服务器，再执行打包，运行jar包，会产生对个运行的jar包，而且会多个jar包占用同一个端口，所以每次都需要先停止之前运行的命令，并且将当前jar包移动到指定位置做备份，然后删除当前jar包，等待重新生成jar包，然后运行。

步骤如下

- 停止命令
- 备份旧jar包
- 删除旧jar包
- 生成新jar包
- 执行新jar包

![image-20250303142623253](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303142623253.png)

![image-20250303142714643](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303142714643.png)

##### 1. 创建脚本

```bash
vim x.sh
```

```bash
#!/bin/bash
projectName=$1
pid=$(ps -ef | grep -w "$projectName" | grep 'java -jar' | grep -v grep | awk '{print $2}')

if [ -z "$pid" ]; then
    echo "$projectName not started"
    exit 0  # 无进程时正常退出
else
    kill -9 $pid
    sleep 2
    if ps -p $pid > /dev/null; then
        echo "Failed to kill $pid"
        exit 1
    fi
    echo "$projectName $pid stopped"
fi

# 备份操作
SOURCE_DIR="/ntdc/api"
BACKUP_ROOT="/ntdc/back/api"
VERSION=$(date +%Y%m%d%H%M%S)
TARGET_DIR="$BACKUP_ROOT/$VERSION"

mkdir -p "$BACKUP_ROOT" || { echo "无法创建备份目录"; exit 1; }

if rsync -av --delete "$SOURCE_DIR/" "$TARGET_DIR/"; then
    echo "备份成功: $TARGET_DIR"
    rm -rfv "$SOURCE_DIR"/*  # 详细输出删除内容
else
    echo "备份失败"
    exit 1
fi
```

赋予权限

```bash
chmod 777 x.sh
```

##### 2. 运行脚本

![image-20250303143609210](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303143609210.png)

保存运行，即可实现上述需求。



### Jenkins前端部署使用

需要提前安装NodeJs插件、Node。

需要配置好nginx，核心配置如下

```xml
server {
        listen       80;
        server_name  ip;
        location / {
            root   /xx/web;
            index  index.html index.htm;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
        # 反向代理,处理管理端发送的请求
        location /api/ {
          proxy_pass   http://localhost:8000/admin/;
          #proxy_set_header x-forwarded-for  $remote_addr;
          proxy_set_header Referer $http_referer;
          proxy_set_header Host $http_host;
       		proxy_set_header X-Real-IP $remote_addr;
       		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        	proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}

```



#### 1. 配置NodeJs插件

进入Tools

![image-20250303150354389](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303150354389.png)

#### 2. 配置远程服务器地址

这里需要和之前Jenkins后端存储位置做区分，需要新建一个存储地址。就是上面的nginx配置地址

![image-20250303150516702](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303150516702.png)

配置步骤和前面一样，一样需要新建一个web文件夹

![image-20250303150720657](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303150720657.png)

![image-20250303150802240](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303150802240.png)

#### 3. 创建空项目

![image-20250303150903073](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303150903073.png)

#### 4. 配置Git前端地址

![image-20250303150935359](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303150935359.png)



#### 5. 选择构建环境

![image-20250303151051261](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303151051261.png)



#### 6. 编写构建脚本

- npm install 安装依赖
- npm run:build 构建dist包
- 备份旧构件包
- 删除旧构件包
- 复制新构件包

![image-20250303151548602](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303151548602.png)

```bash
node -v
npm -v
rm -rf package-lock.json
npm install --legacy-peer-deps --ignore-scripts
npm run build:test > /dev/null 2>&1 
BACKUP_DIR="/ntdc/back/web/$(date +%Y%m%d%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -rp /ntdc/web/. "$BACKUP_DIR/"
rm -rf /ntdc/web/* /ntdc/web/.* 2>/dev/null || true
cp -rp dist/. /ntdc/web/ 
```

有可能在install的时候无法安装，报错。

可以先删除package-lock.json，重新构建。

这个脚本可以自行构建。



#### 7. 生成位置

![image-20250303152505101](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com/codeCenterImg/image-20250303152505101.png)
]()