---
title: 使用oshi监控java运行
createTime: 2025/03/04 09:28:52
permalink: /article/3vzpzz57/
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

## 展示效果
![](https://cdn.nlark.com/yuque/0/2024/png/34915237/1731029866496-1bd5b17d-ec10-4aef-b4ac-4ede75b6a655.png)

![](https://cdn.nlark.com/yuque/0/2024/png/34915237/1731029873867-a9757f27-030e-4b9f-a7a8-418d7612108d.png)



## oshi
[oshi官网]([https://www.oshi.ooo/](https://www.oshi.ooo/))

[oshiApi]([https://www.oshi.ooo/oshi-core-java11/apidocs/com.github.oshi/module-summary.html](https://www.oshi.ooo/oshi-core-java11/apidocs/com.github.oshi/module-summary.html))

![](https://cdn.nlark.com/yuque/0/2024/png/34915237/1731030404281-669f273c-0b9c-4dd8-8e07-71cc75f9c48b.png)



## 引入依赖
还需要引入lombok

```xml
    <!-- https://mvnrepository.com/artifact/com.github.oshi/oshi-core -->
<dependency>
    <groupId>com.github.oshi</groupId>
    <artifactId>oshi-core</artifactId>
    <version>6.6.5</version>
</dependency>
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-all</artifactId>
    <version>5.8.26</version>
</dependency>
```



## 编写监控对象实体类
包含Cpu、Disk、Jvm、Mem、Sys

```java
import lombok.Data;

import java.io.Serializable;

/**
 *  CPU相关信息
 */
@Data
public class Cpu implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 核心数
     */
    private int cpuNum;

    /**
     * CPU总的使用率
     */
    private double total;

    /**
     * CPU系统使用率
     */
    private double sys;

    /**
     * CPU用户使用率
     */
    private double used;

    /**
     * CPU当前等待率
     */
    private double wait;

    /**
     * CPU当前空闲率
     */
    private double free;

}
```



```java

import lombok.Data;

import java.io.Serializable;

/**
 * 系统文件相关信息
 */
@Data
public class Disk implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 盘符路径
     */
    private String dirName;

    /**
     * 盘符类型
     */
    private String sysTypeName;

    /**
     * 文件类型
     */
    private String typeName;

    /**
     * 总大小
     */
    private String total;

    /**
     * 剩余大小
     */
    private String free;

    /**
     * 已经使用量
     */
    private String used;

    /**
     * 资源的使用率
     */
    private double usage;

}
```



```java

import lombok.Data;

import java.io.Serializable;

/**
 * JVM相关信息
 */
@Data
public class Jvm implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 当前JVM占用的内存总数(M)
     */
    private double total;

    /**
     * JVM最大可用内存总数(M)
     */
    private double max;

    /**
     * JVM空闲内存(M)
     */
    private double free;

    /**
     * JVM内存使用率
     */
    private double usage;

    /**
     * JDK版本
     */
    private String version;

    /**
     * JDK路径
     */
    private String home;

    /**
     * JDK名称
     */
    private String name;

    /**
     * 运行参数
     */
    private String inputArgs;

    /**
     * JDK运行时间
     */
    private String runTime;

    /**
     * JDK启动时间
     */
    private String startTime;
}

```



```java
import lombok.Data;

import java.io.Serializable;

/**
 * 內存相关信息
 */
@Data
public class Mem implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 内存总量
     */
    private double total;

    /**
     * 已用内存
     */
    private double used;

    /**
     * 剩余内存
     */
    private double free;

    /**
     * 使用率
     */
    private double usage;

}
```



```java
import lombok.Data;

import java.io.Serializable;

/**
 * 系统相关信息
 */
@Data
public class Sys implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 服务器名称
     */
    private String computerName;

    /**
     * 服务器Ip
     */
    private String computerIp;

    /**
     * 项目路径
     */
    private String userDir;

    /**
     * 操作系统
     */
    private String osName;

    /**
     * 系统架构
     */
    private String osArch;

}
```



## 工具类
也可以不需要这些工具类

### 获取当前Ip信息
```java
package com.sky.utils;

import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSON;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * IP工具类
 */
@Slf4j
public class IpUtils {

    public static String getIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Forwarded-For");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }

        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip;
    }

    /**
     * 根据IP获取所在地址
     *
     * @param ip Ip地址
     * @return String (广州省 广州市)
     * @author fzr
     */
    public static String getRealAddressByIP(String ip) {
        String IP_URL = "https://whois.pconline.com.cn/ipJson.jsp";
        String UNKNOWN = "XX XX";

        // 内网不查询
        if (IpUtils.internalIp(ip)) {
            return "内网IP";
        }
        try {
            String rspStr = HttpUtil.get(IP_URL + "ip=" + ip + "&json=true" + "GBK");
            if (StringUtils.isEmpty(rspStr)) {
                log.error("获取地理位置异常 {}", ip);
                return UNKNOWN;
            }
            // 使用正则表达式提取 JSON 部分
            String jsonPart = rspStr.replaceAll(".*?\\{", "{").replaceAll("\\}.*", "}");
            JSONObject obj = JSONUtil.parseObj(jsonPart);
            String region = obj.getStr("pro");
            String city = obj.getStr("city");
            return String.format("%s %s", region, city);
        } catch (Exception e) {
            log.error("获取地理位置异常 {}", ip);
        }

        return UNKNOWN;
    }

    /**
     * 检查是否为内部IP地址
     *
     * @param ip IP地址
     * @return 结果
     */
    public static boolean internalIp(String ip) {
        byte[] address = textToNumericFormatV4(ip);
        return internalIp(address) || "127.0.0.1".equals(ip);
    }

    /**
     * 检查是否为内部IP地址
     *
     * @param address byte地址
     * @return 结果
     * @author fzr
     */
    private static boolean internalIp(byte[] address) {
        if (address == null || address.length < 2) {
            return true;
        }
        final byte b0 = address[0];
        final byte b1 = address[1];
        // 10.x.x.x/8
        final byte SECTION_1 = 0x0A;
        // 172.16.x.x/12
        final byte SECTION_2 = (byte) 0xAC;
        final byte SECTION_3 = (byte) 0x10;
        final byte SECTION_4 = (byte) 0x1F;
        // 192.168.x.x/16
        final byte SECTION_5 = (byte) 0xC0;
        final byte SECTION_6 = (byte) 0xA8;
        switch (b0) {
            case SECTION_1:
                return true;
            case SECTION_2:
                if (b1 >= SECTION_3 && b1 <= SECTION_4) {
                    return true;
                }
            case SECTION_5:
                if (b1 == SECTION_6) {
                    return true;
                }
            default:
                return false;
        }
    }

    /**
     * 将IPv4地址转换成字节
     *
     * @param text IPv4地址
     * @return byte 字节
     * @author fzr
     */
    public static byte[] textToNumericFormatV4(String text) {
        if (text.isEmpty()) {
            return null;
        }

        byte[] bytes = new byte[4];
        String[] elements = text.split("\\.", -1);
        try {
            long l;
            int i;
            switch (elements.length) {
                case 1:
                    l = Long.parseLong(elements[0]);
                    if ((l < 0L) || (l > 4294967295L)) {
                        return null;
                    }
                    bytes[0] = (byte) (int) (l >> 24 & 0xFF);
                    bytes[1] = (byte) (int) ((l & 0xFFFFFF) >> 16 & 0xFF);
                    bytes[2] = (byte) (int) ((l & 0xFFFF) >> 8 & 0xFF);
                    bytes[3] = (byte) (int) (l & 0xFF);
                    break;
                case 2:
                    l = Integer.parseInt(elements[0]);
                    if ((l < 0L) || (l > 255L)) {
                        return null;
                    }
                    bytes[0] = (byte) (int) (l & 0xFF);
                    l = Integer.parseInt(elements[1]);
                    if ((l < 0L) || (l > 16777215L)) {
                        return null;
                    }
                    bytes[1] = (byte) (int) (l >> 16 & 0xFF);
                    bytes[2] = (byte) (int) ((l & 0xFFFF) >> 8 & 0xFF);
                    bytes[3] = (byte) (int) (l & 0xFF);
                    break;
                case 3:
                    for (i = 0; i < 2; ++i) {
                        l = Integer.parseInt(elements[i]);
                        if ((l < 0L) || (l > 255L)) {
                            return null;
                        }
                        bytes[i] = (byte) (int) (l & 0xFF);
                    }
                    l = Integer.parseInt(elements[2]);
                    if ((l < 0L) || (l > 65535L)) {
                        return null;
                    }
                    bytes[2] = (byte) (int) (l >> 8 & 0xFF);
                    bytes[3] = (byte) (int) (l & 0xFF);
                    break;
                case 4:
                    for (i = 0; i < 4; ++i) {
                        l = Integer.parseInt(elements[i]);
                        if ((l < 0L) || (l > 255L)) {
                            return null;
                        }
                        bytes[i] = (byte) (int) (l & 0xFF);
                    }
                    break;
                default:
                    return null;
            }
        } catch (NumberFormatException e) {
            return null;
        }
        return bytes;
    }

    /**
     * 获取IP地址
     *
     * @return 本地IP地址
     * @author fzr
     */
    public static String getHostIp() {
        try {
            return InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException ignored) {
        }
        return "127.0.0.1";
    }

    /**
     * 获取主机名
     *
     * @return 本地主机名
     * @author fzr
     */
    public static String getHostName() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException ignored) {
        }
        return "未知";
    }

    /**
     * 从多级反向代理中获得第一个非unknown IP地址
     *
     * @param ip 获得的IP地址
     * @return 第一个非unknown IP地址
     * @author fzr
     */
    public static String getMultistageReverseProxyIp(String ip) {
        if (ip != null && ip.indexOf(",") > 0) {
            final String[] ips = ip.trim().split(",");
            for (String subIp : ips) {
                if (!isUnknown(subIp)) {
                    ip = subIp;
                    break;
                }
            }
        }
        return ip;
    }

    /**
     * 检测给定字符串是否为未知,多用于检测HTTP请求相关
     *
     * @param checkString 被检测的字符串
     * @return 是否未知
     * @author fzr
     */
    public static boolean isUnknown(String checkString) {
        return StringUtils.isBlank(checkString) || "unknown".equalsIgnoreCase(checkString);
    }


    public static void main(String[] args) {
        String ip = "xxx";
        String address = getRealAddressByIP(ip);
        System.out.println(address);
    }
}
```



### 算术运算工具
```java
package com.sky.utils;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 算术运算工具
 */
public class ArithUtils {

    /** 默认除法运算精度 */
    private static final int DEF_DIV_SCALE = 10;

    /** 这个类不能实例化 */
    private ArithUtils() {}

    /**
     * 提供精确的加法运算
     *
     * @param v1 被加数
     * @param v2 加数
     * @return 两个参数的和
     */
    public static double add(double v1, double v2) {
        BigDecimal b1 = new BigDecimal(Double.toString(v1));
        BigDecimal b2 = new BigDecimal(Double.toString(v2));
        return b1.add(b2).doubleValue();
    }

    /**
     * 提供精确的减法运算
     *
     * @param v1 被减数
     * @param v2 减数
     * @return 两个参数的差
     */
    public static double sub(double v1, double v2) {
        BigDecimal b1 = new BigDecimal(Double.toString(v1));
        BigDecimal b2 = new BigDecimal(Double.toString(v2));
        return b1.subtract(b2).doubleValue();
    }

    /**
     * 提供精确的乘法运算
     *
     * @param v1 被乘数
     * @param v2 乘数
     * @return 两个参数的积
     */
    public static double mul(double v1, double v2) {
        BigDecimal b1 = new BigDecimal(Double.toString(v1));
        BigDecimal b2 = new BigDecimal(Double.toString(v2));
        return b1.multiply(b2).doubleValue();
    }

    /**
     * 提供（相对）精确的除法运算,当发生除不尽的情况时,精确到
     * 小数点以后10位,以后的数字四舍五入
     *
     * @param v1 被除数
     * @param v2 除数
     * @return 两个参数的商
     */
    public static double div(double v1, double v2) {
        return div(v1, v2, DEF_DIV_SCALE);
    }

    /**
     * 提供（相对）精确的除法运算。当发生除不尽的情况时,由scale参数指
     * 定精度,以后的数字四舍五入。
     *
     * @param v1 被除数
     * @param v2 除数
     * @param scale 表示表示需要精确到小数点以后几位。
     * @return 两个参数的商
     */
    public static double div(double v1, double v2, int scale) {
        if (scale < 0)
        {
            throw new IllegalArgumentException(
                    "The scale must be a positive integer or zero");
        }
        BigDecimal b1 = new BigDecimal(Double.toString(v1));
        BigDecimal b2 = new BigDecimal(Double.toString(v2));
        if (b1.compareTo(BigDecimal.ZERO) == 0)
        {
            return BigDecimal.ZERO.doubleValue();
        }
        return b1.divide(b2, scale, RoundingMode.HALF_UP).doubleValue();
    }

    /**
     * 提供精确的小数位四舍五入处理
     *
     * @param v 需要四舍五入的数字
     * @param scale 小数点后保留几位
     * @return 四舍五入后的结果
     */
    public static double round(double v, int scale) {
        if (scale < 0)
        {
            throw new IllegalArgumentException(
                    "The scale must be a positive integer or zero");
        }
        BigDecimal b = new BigDecimal(Double.toString(v));
        BigDecimal one = BigDecimal.ONE;
        return b.divide(one, scale, RoundingMode.HALF_UP).doubleValue();
    }

}

```



### 时间工具类
```java
package com.mdd.common.util;


import java.lang.management.ManagementFactory;
import java.text.DateFormat;
import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;

public class TimeUtils {

    /**
     * 时间戳转日期(默认格式)
     *
     * @author fzr
     * @param time 时间戳
     * @return String
     */
    public static String timestampToDate(Long time) {
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date(time * 1000));
    }

    /**
     * 时间戳转日期(默认格式)
     *
     * @author fzr
     * @param time 时间戳
     * @return String
     */
    public static String timestampToDate(String time) {
        if (time == null) {
            time = "0";
        }
        long longTime = Long.parseLong(time);
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date(longTime * 1000));
    }

    /**
     * 时间戳转日期(指定格式)
     *
     * @author fzr
     * @param time 时间戳
     * @param format 格式串
     * @return String
     */
    public static String timestampToDate(Long time, String format) {
        return new SimpleDateFormat(format).format(new Date(time * 1000));
    }

    /**
     * 时间戳转日期(指定格式)
     *
     * @author fzr
     * @param time 时间戳
     * @param format 格式串
     * @return String
     */
    public static String timestampToDate(String time, String format) {
        long longTime = Long.parseLong(time);
        return new SimpleDateFormat(format).format(new Date(longTime * 1000));
    }

    /**
     * 日期转时间戳
     *
     * @author fzr
     * @param date 日期
     * @return Long
     */
    public static Long dateToTimestamp(String date) {
        String dateTime = TimeUtils.formatDate(date);
        return (new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).parse(dateTime, new ParsePosition(0)).getTime() / 1000;
    }

    /**
     * 毫秒转日期时间
     *
     * @author fzr
     * @param time 毫秒
     * @return String
     */
    public static String millisecondToDate(Long time) {
        Date date = new Date();
        date.setTime(time);
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
    }

    /**
     * 毫秒转日期时间
     *
     * @author fzr
     * @param time 毫秒
     * @return String
     */
    public static String millisecondToDate(String time) {
        Date date = new Date();
        date.setTime(Long.parseLong(time));
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
    }

    /**
     * 毫秒转日期时间
     *
     * @author fzr
     * @param time 毫秒
     * @param format 格式串
     * @return String
     */
    public static String millisecondToDate(Long time, String format) {
        Date date = new Date();
        date.setTime(time);
        return new SimpleDateFormat(format).format(date);
    }

    /**
     * 毫秒转日期时间
     *
     * @author fzr
     * @param time 毫秒
     * @param format 格式串
     * @return String
     */
    public static String millisecondToDate(String time, String format) {
        Date date = new Date();
        date.setTime(Long.parseLong(time));
        return new SimpleDateFormat(format).format(date);
    }

    /**
     * 日期转固定格式 yyyy-MM-dd HH:mm:ss
     *
     * @author fzr
     * @param dateStr 日期时间
     * @return String
     */
    public static String formatDate(String dateStr){
        dateStr = dateStr.trim();
        HashMap<String, String> dateRegFormat = new HashMap<>();
        dateRegFormat.put("^\\d{4}\\D+\\d{1,2}\\D+\\d{1,2}\\D+\\d{1,2}\\D+\\d{1,2}\\D+\\d{1,2}\\D*$", "yyyy-MM-dd-HH-mm-ss");//2014年3月12日 13时5分34秒，2014-03-12 12:05:34，2014/3/12 12:5:34
        dateRegFormat.put("^\\d{4}\\D+\\d{2}\\D+\\d{2}\\D+\\d{2}\\D+\\d{2}$", "yyyy-MM-dd-HH-mm");//2014-03-12 12:05
        dateRegFormat.put("^\\d{4}\\D+\\d{2}\\D+\\d{2}\\D+\\d{2}$", "yyyy-MM-dd-HH");//2014-03-12 12
        dateRegFormat.put("^\\d{4}\\D+\\d{2}\\D+\\d{2}$", "yyyy-MM-dd");//2014-03-12
        dateRegFormat.put("^\\d{4}\\D+\\d{2}$", "yyyy-MM");//2014-03
        dateRegFormat.put("^\\d{4}$", "yyyy");//2014
        dateRegFormat.put("^\\d{14}$", "yyyyMMddHHmmss");//20140312120534
        dateRegFormat.put("^\\d{12}$", "yyyyMMddHHmm");//201403121205
        dateRegFormat.put("^\\d{10}$", "yyyyMMddHH");//2014031212
        dateRegFormat.put("^\\d{8}$", "yyyyMMdd");//20140312
        dateRegFormat.put("^\\d{6}$", "yyyyMM");//201403
        dateRegFormat.put("^\\d{2}\\s*:\\s*\\d{2}\\s*:\\s*\\d{2}$", "yyyy-MM-dd-HH-mm-ss");//13:05:34 拼接当前日期
        dateRegFormat.put("^\\d{2}\\s*:\\s*\\d{2}$", "yyyy-MM-dd-HH-mm");//13:05 拼接当前日期
        dateRegFormat.put("^\\d{2}\\D+\\d{1,2}\\D+\\d{1,2}$", "yy-MM-dd");//14.10.18(年.月.日)
        dateRegFormat.put("^\\d{1,2}\\D+\\d{1,2}$", "yyyy-dd-MM");//30.12(日.月) 拼接当前年份
        dateRegFormat.put("^\\d{1,2}\\D+\\d{1,2}\\D+\\d{4}$", "dd-MM-yyyy");//12.21.2013(日.月.年)

        String curDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
        DateFormat formatter1 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        DateFormat formatter2;
        String dateReplace;
        String strSuccess = "";
        try {
            for (String key : dateRegFormat.keySet()) {
                if (Pattern.compile(key).matcher(dateStr).matches()) {
                    formatter2 = new SimpleDateFormat(dateRegFormat.get(key));
                    if (key.equals("^\\d{2}\\s*:\\s*\\d{2}\\s*:\\s*\\d{2}$") || key.equals("^\\d{2}\\s*:\\s*\\d{2}$")) {
                        // 13:05:34 或 13:05 拼接当前日期
                        dateStr = curDate + "-" + dateStr;
                    } else if (key.equals("^\\d{1,2}\\D+\\d{1,2}$")) {
                        //21.1 (日.月) 拼接当前年份
                        dateStr = curDate.substring(0, 4) + "-" + dateStr;
                    }
                    dateReplace = dateStr.replaceAll("\\D+", "-");
                    strSuccess = formatter1.format(formatter2.parse(dateReplace));
                    break;
                }
            }
            return strSuccess;
        } catch (Exception ignored) { }
        return "";
    }

    /**
     * 返回当前时间戳
     *
     * @author fzr
     * @return Long
     */
    public static Long timestamp() {
        return System.currentTimeMillis() / 1000;
    }

    /**
     * 返回当前Date型日期
     *
     *  @author fzr
     * @return Date() 当前日期
     */
    public static Date nowDate() {
        return new Date();
    }

    /**
     * 返回今日开始和结束的时间戳
     *
     * @author fzr
     * @return List
     */
    public static List<Long> today() {
        List<Long> list = new ArrayList<>();
        // 开始时间
        Calendar todayStart = Calendar.getInstance();
        todayStart.set(Calendar.HOUR, 0);
        todayStart.set(Calendar.MINUTE, 0);
        todayStart.set(Calendar.SECOND, 0);
        todayStart.set(Calendar.MILLISECOND, 0);
        list.add(todayStart.getTime().getTime() / 1000 - 43200);

        // 结束时间
        Calendar todayEnd = Calendar.getInstance();
        todayEnd.set(Calendar.HOUR_OF_DAY, 23);
        todayEnd.set(Calendar.MINUTE, 59);
        todayEnd.set(Calendar.SECOND, 59);
        todayEnd.set(Calendar.MILLISECOND, 999);
        list.add(todayEnd.getTime().getTime() / 1000);

        return list;
    }

    /**
     * 返回昨日开始和结束的时间戳
     *
     * @author fzr
     * @return List
     */
    public static List<Long> yesterday() {
        List<Long> today = TimeUtils.today();
        List<Long> list = new ArrayList<>();
        list.add(today.get(0) - 86400);
        list.add(today.get(1) - 86400);
        return list;
    }

    /**
     * 返回本周开始和结束的时间戳
     *
     * @author fzr
     * @return List
     */
    public static List<Long> week() {
        List<Long> list = new ArrayList<>();
        // 开始时间
        Calendar cal = Calendar.getInstance();
        cal.set(cal.get(Calendar.YEAR),cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH), 0, 0,0);
        cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
        list.add(cal.getTimeInMillis() / 1000);
        // 结束时间
        list.add(list.get(0) + ((7 * 24 * 60 * 60 * 1000) / 1000)-1);
        return list;
    }

    /**
     * 返回上周开始和结束的时间戳
     *
     * @author fzr
     * @return List
     */
    public static List<Long> lastWeek() {
        List<Long> week = TimeUtils.week();
        List<Long> list = new ArrayList<>();
        list.add(week.get(0) - 604800);
        list.add(week.get(1) - 604800);
        return list;
    }

    /**
     * 返回今天是周几
     *
     * @author fzr
     * @return Long
     */
    public static Long dayOfWeek() {
        Date date = new Date();
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        boolean isFirstSunday = (cal.getFirstDayOfWeek() == Calendar.SUNDAY);
        long week = cal.get(Calendar.DAY_OF_WEEK);
        if(isFirstSunday){
            week = (week -1) == 0? 7:(week - 1);
        }
        return week;
    }

    /**
     * 返回本月开始和结束的时间戳
     *
     * @author fzr
     * @return List
     */
    public static List<Long> month() {
        List<Long> list = new ArrayList<>();
        // 开始时间
        Calendar calStart = Calendar.getInstance();
        calStart.set(calStart.get(Calendar.YEAR),calStart.get(Calendar.MONTH), calStart.get(Calendar.DAY_OF_MONTH), 0, 0,0);
        calStart.set(Calendar.DAY_OF_MONTH,calStart.getActualMinimum(Calendar.DAY_OF_MONTH));
        list.add(calStart.getTimeInMillis() / 1000);

        // 结束时间
        Calendar calEnd = Calendar.getInstance();
        calEnd.set(calEnd.get(Calendar.YEAR),calEnd.get(Calendar.MONTH), calEnd.get(Calendar.DAY_OF_MONTH), 0, 0,0);
        calEnd.set(Calendar.DAY_OF_MONTH, calEnd.getActualMaximum(Calendar.DAY_OF_MONTH));
        calEnd.set(Calendar.HOUR_OF_DAY, 24);
        list.add(calEnd.getTimeInMillis() / 1000 - 1);
        return list;
    }

    /**
     * 返回上个月开始和结束的时间戳
     *
     * @author fzr
     * @return List
     */
    public static List<Long> lastMonth() {
        List<Long> list = new ArrayList<>();
        // 开始时间
        Calendar calStart = Calendar.getInstance();
        calStart.add(Calendar.MONTH, -1);
        calStart.set(Calendar.DAY_OF_MONTH,1);
        calStart.set(Calendar.HOUR, 0);
        calStart.set(Calendar.MINUTE, 0);
        calStart.set(Calendar.SECOND, 0);
        calStart.set(Calendar.MILLISECOND, 0);
        list.add((calStart.getTimeInMillis() / 1000) - 43200);

        // 结束时间
        Calendar calEnd = Calendar.getInstance();
        calEnd.set(calEnd.get(Calendar.YEAR),calEnd.get(Calendar.MONTH), calEnd.get(Calendar.DAY_OF_MONTH), 0, 0,0);
        calEnd.set(Calendar.DAY_OF_MONTH,calEnd.getActualMinimum(Calendar.DAY_OF_MONTH));
        list.add((calEnd.getTimeInMillis() / 1000)-1);
        return list;
    }

    /**
     * 返回今年开始和结束的时间戳
     *
     * @author fzr
     * @return List
     */
    public static List<Long> year() {
        List<Long> list = new ArrayList<>();
        // 开始时间
        Calendar calStart = Calendar.getInstance();
        calStart.add(Calendar.YEAR, 0);
        calStart.add(Calendar.DATE, 0);
        calStart.add(Calendar.MONTH, 0);
        calStart.set(Calendar.DAY_OF_YEAR, 1);
        calStart.set(Calendar.HOUR_OF_DAY, 0);
        calStart.set(Calendar.MINUTE, 0);
        calStart.set(Calendar.SECOND, 0);
        calStart.set(Calendar.MILLISECOND, 0);
        list.add(calStart.getTimeInMillis() / 1000);

        // 结束时间
        Calendar calEnd = Calendar.getInstance();
        int year = calEnd.get(Calendar.YEAR);
        calEnd.clear();
        calEnd.set(Calendar.YEAR, year);
        calEnd.set(Calendar.HOUR_OF_DAY, 23);
        calEnd.set(Calendar.MINUTE, 59);
        calEnd.set(Calendar.SECOND, 59);
        calEnd.set(Calendar.MILLISECOND, 999);
        calEnd.roll(Calendar.DAY_OF_YEAR, -1);
        list.add(calEnd.getTimeInMillis() / 1000);
        return list;
    }

    /**
     * 返回去年开始和结束的时间戳
     *
     * @author fzr
     * @return List
     */
    public static List<Long> lastYear() {
        List<Long> list = new ArrayList<>();
        // 开始时间
        Calendar calStart = Calendar.getInstance();
        calStart.add(Calendar.YEAR, -1);
        calStart.set(Calendar.HOUR_OF_DAY, 0);
        calStart.set(Calendar.DAY_OF_YEAR, 1);
        calStart.set(Calendar.MINUTE, 0);
        calStart.set(Calendar.SECOND, 0);
        calStart.set(Calendar.MILLISECOND, 0);
        list.add(calStart.getTimeInMillis() / 1000);

        // 结束时间
        Calendar calEnd = Calendar.getInstance();
        calEnd.add(Calendar.YEAR, -1);
        calEnd.set(Calendar.MONTH, calEnd.getActualMaximum(Calendar.MONTH));
        calEnd.set(Calendar.DAY_OF_MONTH, calEnd.getActualMaximum(Calendar.DAY_OF_MONTH));
        calEnd.set(Calendar.HOUR_OF_DAY, 23);
        calEnd.set(Calendar.MINUTE, 59);
        calEnd.set(Calendar.SECOND, 59);
        calEnd.set(Calendar.MILLISECOND, 999);
        list.add(calEnd.getTimeInMillis() / 1000);
        return list;
    }

    /**
     * 获取几天前零点到现在/昨日结束的时间戳
     *
     * @author fzr
     * @return List
     */
    public static List<Long> dayToNow(int day) {
        List<Long> today = TimeUtils.today();
        List<Long> list = new ArrayList<>();
        list.add(today.get(0) - day * 86400L);
        list.add(today.get(0) -1);
        return list;
    }

    /**
     * 返回几天前的时间戳
     *
     * @author fzr
     * @param day (天)
     * @return Long
     */
    public Long daysAgo(long day) {
        long currTime = System.currentTimeMillis() / 1000;
        return currTime - (day * 86400);
    }

    /**
     * 返回几天后的时间戳
     *
     * @author fzr
     * @param day (天)
     * @return Long
     */
    public Long daysAfter(long day) {
        long currTime = System.currentTimeMillis() / 1000;
        return currTime + (day * 86400);
    }

    /**
     * 返回月份第几天
     *
     * @author fzr
     * @return int
     */
    public static Integer monthDay(){
        Date date = new Date();
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        return cal.get(Calendar.DAY_OF_MONTH);
    }

    /**
     * 获取几天前的日期列表
     *
     * @author fzr
     * @param day 获取多少天
     * @return [2022-03-29, 2022-03-30, 2022-03-31, 2022-04-01]
     */
    public static List<String> daysAgoDate(Integer day) {
        long time = TimeUtils.today().get(0);

        List<String> data = new ArrayList<>();
        for (int i=0; i<day; i++) {
            if (i != 0) {
                time -= 86400;
            }

            data.add(TimeUtils.timestampToDate(time, "yyyy-MM-dd"));
        }

        Collections.reverse(data);
        return data;
    }

    /**
     * 获取几天前的日期列表
     *
     * @author fzr
     * @param day 获取多少天
     * @return [1648483200, 1648569600, 1648656000, 1648742400]
     */
    public static List<Long> daysAgoTime(Integer day) {
        long time = TimeUtils.today().get(0);

        List<Long> data = new ArrayList<>();
        for (int i=0; i<day; i++) {
            if (i != 0) {
                time -= 86400;
            }

            data.add(time);
        }

        Collections.reverse(data);
        return data;
    }

    /**
     * 返回服务器启动时间
     */
    public static Date serverStartDate() {
        long time = ManagementFactory.getRuntimeMXBean().getStartTime();
        return new Date(time);
    }

    /**
     * 计算两个时间差
     *
     * @author fzr
     * @param endDate 结束时间
     * @param nowDate 开始时间
     * @return String
     */
    public static String datePoor(Date endDate, Date nowDate) {
        long nd = 1000 * 24 * 60 * 60;
        long nh = 1000 * 60 * 60;
        long nm = 1000 * 60;
        // long ns = 1000;
        // 获得两个时间的毫秒时间差异
        long diff = endDate.getTime() - nowDate.getTime();
        // 计算差多少天
        long day = diff / nd;
        // 计算差多少小时
        long hour = diff % nd / nh;
        // 计算差多少分钟
        long min = diff % nd % nh / nm;
        // 计算差多少秒//输出结果
        // long sec = diff % nd % nh % nm / ns;
        return day + "天" + hour + "小时" + min + "分钟";
    }
}
```



## 获取系统信息
```java
package com.sky.utils;

import com.sky.pono.server.*;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.CentralProcessor.TickType;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;
import oshi.software.os.FileSystem;
import oshi.software.os.OSFileStore;
import oshi.software.os.OperatingSystem;
import oshi.util.Util;

import java.lang.management.ManagementFactory;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * 服务器相关信息
 */
public class ServerUtils {

    private static final int OSHI_WAIT_SECOND = 1000;
    private final Cpu cpu = new Cpu(); // CPU相关信息
    private final Mem mem = new Mem(); // 內存相关信息
    private final Jvm jvm = new Jvm(); // JVM相关信息
    private final Sys sys = new Sys(); // 服务器相关信息
    private final List<Disk> disk = new LinkedList<>(); // 磁盘相关信息

    /**
     * 拷贝数据
     */
    public Map<String, Object> copyTo() {
        SystemInfo si = new SystemInfo();
        HardwareAbstractionLayer hal = si.getHardware();
        setCpuInfo(hal.getProcessor());
        setMemInfo(hal.getMemory());
        setSysInfo();
        setJvmInfo();
        setSysFiles(si.getOperatingSystem());

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("cpu", this.cpu);
        map.put("mem", this.mem);
        map.put("sys", this.sys);
        map.put("disk", this.disk);
        map.put("jvm", this.jvm);
        return map;
    }

    /**
     * 设置CPU信息
     */
    private void setCpuInfo(CentralProcessor processor) {
        long[] prevTicks = processor.getSystemCpuLoadTicks();
        Util.sleep(OSHI_WAIT_SECOND);
        long[] ticks = processor.getSystemCpuLoadTicks();
        long nice = ticks[TickType.NICE.getIndex()] - prevTicks[TickType.NICE.getIndex()];
        long irq = ticks[TickType.IRQ.getIndex()] - prevTicks[TickType.IRQ.getIndex()];
        long softer = ticks[TickType.SOFTIRQ.getIndex()] - prevTicks[TickType.SOFTIRQ.getIndex()];
        long steal = ticks[TickType.STEAL.getIndex()] - prevTicks[TickType.STEAL.getIndex()];
        long cSys = ticks[TickType.SYSTEM.getIndex()] - prevTicks[TickType.SYSTEM.getIndex()];
        long user = ticks[TickType.USER.getIndex()] - prevTicks[TickType.USER.getIndex()];
        long ioWait = ticks[TickType.IOWAIT.getIndex()] - prevTicks[TickType.IOWAIT.getIndex()];
        long idle = ticks[TickType.IDLE.getIndex()] - prevTicks[TickType.IDLE.getIndex()];
        long totalCpu = user + nice + cSys + idle + ioWait + irq + softer + steal;
        cpu.setCpuNum(processor.getLogicalProcessorCount());
        cpu.setTotal(ArithUtils.round(ArithUtils.mul(totalCpu, 100), 2));
        cpu.setSys(ArithUtils.round(ArithUtils.mul(cSys / cpu.getTotal(), 100), 2));
        cpu.setUsed(ArithUtils.round(ArithUtils.mul(user / cpu.getTotal(), 100), 2));
        cpu.setWait(ArithUtils.round(ArithUtils.mul(ioWait / cpu.getTotal(), 100), 2));
        cpu.setFree(ArithUtils.round(ArithUtils.mul(idle / cpu.getTotal(), 100), 2));
    }


    /**
     * 设置内存信息
     */
    private void setMemInfo(GlobalMemory memory) {
        int number = (1024 * 1024 * 1024);
        mem.setTotal(ArithUtils.div(memory.getTotal(), number, 2));
        mem.setUsed(ArithUtils.div(memory.getTotal() - memory.getAvailable(), number, 2));
        mem.setFree(ArithUtils.div(memory.getAvailable(), number, 2));
        mem.setUsage(ArithUtils.mul(ArithUtils.div(mem.getUsed(), memory.getTotal(), 4), 100));
    }

    /**
     * 设置服务器信息
     */
    private void setSysInfo() {
        Properties props = System.getProperties();
        sys.setComputerName(IpUtils.getHostName());
        sys.setComputerIp(IpUtils.getHostIp());
        sys.setOsName(props.getProperty("os.name"));
        sys.setOsArch(props.getProperty("os.arch"));
        sys.setUserDir(props.getProperty("user.dir"));
    }

    /**
     * 设置Java虚拟机
     */
    private void setJvmInfo() {
        Properties props = System.getProperties();
        jvm.setTotal(ArithUtils.div(Runtime.getRuntime().totalMemory(), (1024 * 1024), 2));
        jvm.setMax(ArithUtils.div(Runtime.getRuntime().maxMemory(), (1024 * 1024), 2));
        jvm.setFree(ArithUtils.div(Runtime.getRuntime().freeMemory(), (1024 * 1024), 2));
        jvm.setUsage(ArithUtils.mul(ArithUtils.div(jvm.getTotal() - jvm.getFree(), jvm.getTotal(), 4), 100));
        jvm.setVersion(props.getProperty("java.version"));
        jvm.setHome(props.getProperty("java.home"));
        jvm.setName(ManagementFactory.getRuntimeMXBean().getVmName());
        jvm.setInputArgs(ManagementFactory.getRuntimeMXBean().getInputArguments().toString());
        jvm.setRunTime(TimeUtils.datePoor(TimeUtils.nowDate(), TimeUtils.serverStartDate()));
        jvm.setStartTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(TimeUtils.serverStartDate()));
    }

    /**
     * 设置磁盘信息
     */
    private void setSysFiles(OperatingSystem os) {
        FileSystem fileSystem = os.getFileSystem();
        List<OSFileStore> fsArray = fileSystem.getFileStores();
        for (OSFileStore fs : fsArray) {
            long free = fs.getUsableSpace();
            long total = fs.getTotalSpace();
            long used = total - free;
            Disk sysFile = new Disk();
            sysFile.setDirName(fs.getMount());
            sysFile.setSysTypeName(fs.getType());
            sysFile.setTypeName(fs.getName());
            sysFile.setTotal(convertFileSize(total));
            sysFile.setFree(convertFileSize(free));
            sysFile.setUsed(convertFileSize(used));
            sysFile.setUsage(ArithUtils.mul(ArithUtils.div(used, total, 4), 100));
            disk.add(sysFile);
        }
    }

    /**
     * 字节转换
     */
    public String convertFileSize(long size) {
        long kb = 1024;
        long mb = kb * 1024;
        long gb = mb * 1024;
        if (size >= gb) {
            return String.format("%.1f GB", (float) size / gb);
        } else if (size >= mb) {
            float f = (float) size / mb;
            return String.format(f > 100 ? "%.0f MB" : "%.1f MB", f);
        } else if (size >= kb) {
            float f = (float) size / kb;
            return String.format(f > 100 ? "%.0f KB" : "%.1f KB", f);
        } else {
            return String.format("%d B", size);
        }
    }
}
```



## 编写接口
```java
@RestController
@RequestMapping("/admin/monitor")
public class MonitorServerController {

    @GetMapping("/server")
    public Result<Map<String, Object>> info() {
        ServerUtils server = new ServerUtils();
        return Result.success(server.copyTo());
    }

}
```





## 接口测试
![](https://cdn.nlark.com/yuque/0/2024/png/34915237/1731032235324-b69cd720-3304-4b26-8286-bde44e26d322.png)







## 前端代码
```javascript
<template>
  <div class="system-environment" v-loading="loading">
    <div class="cards-container">
      <el-card class="card mb-4 card-margin-right" shadow="never">
        <div>CPU</div>
        <div class="mt-4">
          <div class="flex flex-wrap">
            <div class="item mb-4">
              <div class="text-4xl mb-3">{{ info.cpu.cpuNum }}</div>
              <div class="text-tx-regular">核心数</div>
            </div>

            <div class="item mb-4">
              <div class="text-4xl mb-3">
                {{ info.cpu.used ? `${info.cpu.used}%` : '-' }}
              </div>
              <div class="text-tx-regular">用户使用率</div>
            </div>

            <div class="item mb-4">
              <div class="text-4xl mb-3">
                {{ info.cpu.sys ? `${info.cpu.sys}%` : '-' }}
              </div>
              <div class="text-tx-regular">系统使用率</div>
            </div>

            <div class="item mb-4">
              <div class="text-4xl mb-3">
                {{ info.cpu.free ? `${info.cpu.free}%` : '-' }}
              </div>
              <div class="text-tx-regular">当前空闲率</div>
            </div>
          </div>
        </div>
      </el-card>
      <el-card class="card mb-4" shadow="never">
        <div>内存</div>
        <div class="mt-4">
          <div class="flex flex-wrap">
            <div class="item mb-4">
              <div class="text-4xl mb-3">{{ info.mem.total }}</div>
              <div class="text-tx-regular">总内存</div>
            </div>

            <div class="item mb-4">
              <div class="text-4xl mb-3">
                {{ info.mem.used ? `${info.mem.used}%` : '-' }}
              </div>
              <div class="text-tx-regular">已用内存</div>
            </div>

            <div class="item mb-4">
              <div class="text-4xl mb-3">
                {{ info.mem.free ? `${info.mem.free}%` : '-' }}
              </div>
              <div class="text-tx-regular">剩余内存</div>
            </div>

            <div class="item mb-4">
              <div class="text-4xl mb-3">
                {{ info.mem.usage ? `${info.mem.usage}%` : '-' }}
              </div>
              <div class="text-tx-regular">使用率</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    <el-card class="card mb-4" shadow="never">
      <div>服务器信息</div>
      <div class="mt-4">
        <el-table :data="[info.sys]" size="large">
          <el-table-column prop="computerName" label="服务器名称" min-width="150" />
          <el-table-column prop="computerIp" label="服务器IP" min-width="120" />
          <el-table-column prop="osName" label="操作系统" min-width="100" />
          <el-table-column prop="osArch" label="系统架构" min-width="100" />
          <el-table-column prop="userDir" label="项目路径" min-width="250" />
        </el-table>
      </div>
    </el-card>

    <el-card class="card mb-4" shadow="never">
      <div>Java虚拟机信息</div>
      <div class="mt-4">
        <el-table :data="[info.jvm]" size="large">
          <el-table-column prop="name" label="Java名称" min-width="120" />
          <el-table-column prop="startTime" label="启动时间" min-width="120" />
          <el-table-column prop="home" label="安装路径" min-width="120" />
          <el-table-column prop="inputArgs" label="运行参数" min-width="120" />
          <el-table-column prop="version" label="Java版本" min-width="120" />
          <el-table-column prop="runTime" label="运行时长" min-width="120" />
        </el-table>
      </div>
    </el-card>

    <el-card class="card mb-4" shadow="never">
      <div>硬盘状态</div>
      <div class="mt-4">
        <el-table :data="info.disk" size="large">
          <el-table-column prop="dirName" label="盘符路径" min-width="100" />
          <el-table-column prop="sysTypeName" label="文件系统" min-width="100" />
          <el-table-column prop="typeName" label="盘符类型" min-width="100" />
          <el-table-column prop="total" label="总大小" min-width="100" />
          <el-table-column prop="free" label="可用大小" min-width="100" />
          <el-table-column prop="used" label="已用大小" min-width="100" />
          <el-table-column prop="usage" label="已用百分比" min-width="100">
            <template #default="{ row }"> {{ row.usage }}%</template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup name="environment">
import { getSystemInfos } from '@/api/environment'
import { ref } from 'vue'

const loading = ref(false)
const info = ref({
  cpu: {} as any,
  disk: [],
  jvm: {},
  mem: {} as any,
  sys: {}
})

const getSystemInfo = async () => {
  try {
    loading.value = true
    const data = await getSystemInfos()
    console.log(data.data.data)
    info.value = data.data.data

    loading.value = false
  } catch (error) {
    loading.value = false
  }
}

getSystemInfo()
</script>

<style lang="scss" scoped>
.system-environment {
  width: 100%;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.card {
  border: none;
  flex: 1;
  margin-bottom: 16px;
  margin-right: 16px;

  &:last-child {
    margin-right: 0;
  }
}

.card-margin-right {
  margin-right: 16px;
}

.item {
  flex: 1;
  width: 50%;
}

.text-4xl {
  font-size: 2rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.text-tx-regular {
  font-size: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

@media (max-width: 1024px) {
  .card {
    width: 100%;
    margin-right: 0;
  }
}
</style>
```

