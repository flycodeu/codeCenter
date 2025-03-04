---
title: 备份Mysql结构和数据
createTime: 2025/03/04 09:28:52
permalink: /article/07khmkn2/
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

## Mysql备份方式

```bash
mysqldump -u用户名 -p密码 --databases 数据库 > xxx.sql
```

[](https://www.cnblogs.com/nancyzhu/p/8511389.html)

## Centos备份Mysql

```bash
# 设置环境变量
#!/bin/bash

# 设置环境变量
export PATH=$PATH:/usr/local/soft/mysql/bin

# 日志文件路径
log_file="$backup_dir/log.txt"
error_log_file="$backup_dir/error.log"

# 保存备份个数，备份31天数据
number=31

backup_dir=/food/ztgtDcApi/mysqlbackup

# 获取当前日期时间
dd=$(date +%Y-%m-%d-%H-%M-%S)

# 备份工具绝对路径
tool=/usr/local/soft/mysql/bin/mysqldump

# MySQL 用户名和密码
username=root
password=ldhy888@666

# 将要备份的数据库名称
database_name=sky_take_out

# 如果文件夹不存在则创建
if [ ! -d "$backup_dir" ]; then
   mkdir -p "$backup_dir"
fi

# 执行备份并捕获错误输出
backup_file="$backup_dir/$database_name-$dd.sql"
$tool -u"$username" -p"$password" "$database_name" > "$backup_file" 2>> "$error_log_file"

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup succeeded: $backup_file" >> "$log_file"
else
    echo "[$(date)] Backup failed: $backup_file" >> "$log_file"
fi

# 删除 `:wq` 错误指令
# 判断现在的备份数量是否大于 $number
count=$(ls -1 "$backup_dir"/*.sql 2>/dev/null | wc -l)

if [ $count -gt $number ]; then
    # 找出需要删除的最早备份文件
    delfile=$(ls -t "$backup_dir"/*.sql | tail -n 1)
    
    if [[ -n "$delfile" && -f "$delfile" ]]; then
        # 删除最早生成的备份，只保留 number 数量的备份
        rm -f "$delfile"
        # 写删除文件日志
        echo "[$(date)] Deleted old backup: $delfile" >> "$log_file"
    fi
fi
```

## Cron定时执行脚本
1. 创建新的定时任务
```bash
crontab -e 
```
2. 编写任务
```bash
0 */1 * * * sh  /food/ztgtDcApi/mysql_dump_back.sh
```
需要注意脚本里面必须要使用备份命令的绝对路径，否则无法执行。

## 使用Navicat定时备份任务

![image-20241225143951093](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20241225143951093.png)

![image-20241225143752921](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20241225143752921.png)


## Windows定时备份数据

编写.bat脚本命令

```bat
@echo off
setlocal

:: 设置日期和时间格式为 YYYYMMDD_HHMMSS
for /f "tokens=2 delims==" %%i in ('"wmic os get localdatetime /value"') do set datetime=%%i
set Ymd=%datetime:~0,8%
set Hms=%datetime:~8,6%

:: 创建备份目录
set backupDir=D:\sky-take-out\%Ymd%
if not exist "%backupDir%" (
    mkdir "%backupDir%"
) else (
    echo 子目录或文件 %backupDir% 已经存在。
)

:: 定义 MySQL 用户名和密码 (注意: 密码应避免明文存储)
set mysqlUser=root
set mysqlPassword=ldhy888@666

:: 定义输出文件路径，包括时间戳
set logFile="%backupDir%\backup_log_%Hms%.txt"
set outputFile="%backupDir%\database_%Ymd%_%Hms%.sql"

:: 执行 mysqldump 并记录日志
"D:\Developer Tools\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u %mysqlUser% -p%mysqlPassword% -h 47.100.167.169 sky_take_out > "%outputFile%" 2>> "%logFile%"

:: 检查 mysqldump 是否成功完成
if errorlevel 1 (
    echo Error occurred during database backup at %Ymd%_%Hms%. Check the log file for details.
) else (
    echo Database backup completed successfully at %Ymd%_%Hms%.
)

endlocal
```

