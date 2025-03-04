---
title: C++快速入门
createTime: 2025/03/04 09:25:15
permalink: /article/bcow3ffh/
tags:
  - C++
---
> 本文作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://flycode.icu)

## 简单上手

编译输入HelloWorld

```c++
#include<iostream>
using namespace std;

int main() {
	cout << "hello world" << endl;
}
```

`std`:命名空间，为了和其他的类里面的`cout`和`endl`输入输出区分开

`cout`: 输入流

`endl`: 输出流

`return 0`可以省略不写



![image-20240209174001674](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240209174001674.png)

但是可以看出目前输出了很多无用的东西，我们可以调整输出格式，工具->调式->调式停止时自动关闭控制台

![image-20240209174151019](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240209174151019.png)

但是这样运行后一闪而过，我们看不到对应的输出

1. 使用系统底层命令,`system("pause")`，不推荐

![image-20240209174508774](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240209174508774.png)

2. 使用`cin.get()`等待键盘输入

![image-20240209174621912](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240209174621912.png)



##  C++编译运行

![image-20240209174711265](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240209174711265.png)



1. 编译.cpp文件

![image-20240209175018364](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240209175018364.png)

2. 点击项目生成exe文件

![image-20240209175105117](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240209175105117.png)

3. 文件地址，在对应的文件夹里面可以看见exe运行程序

![image-20240209175220969](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240209175220969.png)



## 函数

编写一个简单的用户交互程序

```c++
/*
*	主函数运行
*/
int main() {
	cout << "hello world" << endl;

	// 提示用户输入信息
	cout << "输入姓名：" << endl;
	// 用户姓名
	string name;
	// 输入姓名
	cin >> name;
	// 输出信息
	cout << "姓名：" << name  << endl;
	// 等待键盘输入
	cin.get();
	cin.get();
}
```

但是此时我们会发现，代码比较混乱，所以我们需要抽离出一个方法，但是这个方法一定要在main方法的上面，因为C++是逐行执行的，如皋放在下面，就会读取不到这个函数.

```C++
// 定义函数
void welcome() {

	// 提示用户输入信息
	cout << "输入姓名：" << endl;
	// 用户姓名
	string name;
	// 输入姓名
	cin >> name;
	// 输出信息
	cout << "姓名：" << name << endl;
}
```

我们定义了一个函数，可以直接调用

```c++
/*
*	主函数运行
*/
int main() {
	cout << "hello world" << endl;
	// 调用函数
	welcome();
	// 等待键盘输入
	cin.get();
	cin.get();
}
```

## 导入函数

我们可以在其他的文件里面定义好这个`welcome`,然后引入当前文件。

![image-20240209180436236](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240209180436236.png)



```C++
#include<iostream>
using namespace std;

// 调用其他文件函数
void welcome();

/*
*	主函数运行
*/
int main() {
	cout << "hello world" << endl;
	// 调用函数
	welcome();
	// 等待键盘输入
	cin.get();
	cin.get();
}

```





## 变量

### 定义变量

局部变量必须要赋值

需要区分局部变量和全局变量

```c++
#include<iostream>
using namespace std;

int number;

int main() {
	int number = 1;
	cout << "局部变量number" << number << endl;
	cout << "全局变量number" << ::number << endl;
	cin.get();
}
```

通过`::`就是获取全局变量

![image-20240209202006113](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240209202006113.png)





## 常量

### 1. 使用标识符,预处理（不推荐）

```C++
#define PI = 3.14;
```

### 2. 使用const限定符

```C++
const float pi = 3.14;
```





## 基本数据类型

### 整型

char、short、int，long，long long（11里面新增）、bool



| 类型      | 字节 | 范围             |
| --------- | ---- | ---------------- |
| char      | 1    |                  |
| short     | 2    | -32768-----32767 |
| int       | 4    | -2^31-----2^31-1 |
| long      | 4或8 |                  |
| long long | 8    |                  |

```C++
int main() {
	short a = 20;
	cout << "short size=" << sizeof a << endl;

	int a2 = 20;
	cout << "int size=" << sizeof a2 << endl;

	long a3 = 20;
	cout << "long size=" << sizeof a3 << endl;

	long long a4 = 20;
	cout << "long long  size=" << sizeoasf a4 << endl;

}

}
```

![image-20240210162400367](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240210162400367.png)





### 无符号整型

只会表示0和正数，使用`unsigned`

```C++
int main() {
	short a = 40000;
	cout << "short=" <<  a << endl;

	unsigned short a2 = 4000;
	cout << "unsigned short" <<  a2 << endl;
}
```

![image-20240210163246414](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240210163246414.png)

如果超出了固定的最大范围，值就会从最小值开始，但是使用`unsigned`表示后，范围就扩大了，第一位就不是表示正负了，而是表示值



**一般推荐int，超出了int使用long long，确定值不能小于0使用`unsigned`**



### 字符类型

`char`

一般会将数字转换成对应的ASCII

```C++
	char s1 = 65;
	cout << "s1 = " << s1 << endl;
```

输出`s1 = A`



### bool类型

1表示真，0表示假

```C++
bool b1 = true;
cout << "b1=" << b1 << endl;
```



### 浮点类型

单精度float: 4字节

双精度double： 8字节，可以使用科学计数法

```C++
float f = 2.1;
double pi = 3.14e-23;
```



### 字面值常量

1. 整型

2. 浮点型

![image-20240210170711916](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240210170711916.png)

```C++
// 整型
30;
036L;
0x1ELL;

// 浮点类型
3.14f;
1.25L;
```

3. 字符类型

```C++
'A'
'11'
"AS"
```

4. 转义类型

![image-20240210171001805](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240210171001805.png)

4. 布尔类型



## 类型转换

![image-20240210171438303](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240210171438303.png)

![image-20240210174640385](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240210174640385.png)

类型转换注意事项

1. 进行计算的时候，计算结果的数据类型会向上对齐
2. short和char运算的时候，会自动转换为int类型
3. 浮点数向整数转型的时候，会舍去小数点后面的数，只保留整数



## 控制台输入

### 1. 单个输入

```c++
int num1, num2, num3;
cin >> num1;
cin >> num2;
cin >> num3;
cout << "num1=" << num1 << "\t num2=" << num2 << "\t num3=" << num3 << endl;
```

上面运行可以换行输入也可以空格分开，因为cin里面有个缓冲区，数据缓存在里面，然后拿出来进行操作。



### 2. 连续输入

支持连续的输入参数，但是需要使用空格分开

```c++
	int num1, num2, num3;
	cin >> num1 >> num2 >> num3;
```



### 3. 错误处理

比如用户输入了不符合条件的命令，程序无法识别。

cin里面有四个方法

- cin.good()：符合记录
- cin.fail():    不符合记录
- cin.bad():   
- cin.clear(): 恢复状态，清除错误状态

```c++
	int num4;
	cout << "输入整数" << endl;
	cin >> num4;
	cout << "num4=" <<num4 << endl;
	cout << "good = " << cin.good() << "\t fail= " << cin.fail() << endl;


	int num5;
	cout << "输入整数" << endl;
	cin >> num5;
	cout <<"num5=" << num5 << endl;
```

如果不满足这个第一次的int整数，而是字符串，此时的标志就是fail，并且此时会阻塞后续的命令执行

![image-20240219164853258](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240219164853258.png)

引入cin.clear()可以清除当前状态，但是依然阻塞后面的命令执行，因为缓冲区还是会影响后面的执行

```java
	int num4;
	cout << "输入整数" << endl;
	cin >> num4;
	cout << "num4=" <<num4 << endl;
	cout << "good = " << cin.good() << "\t fail= " << cin.fail() << endl;
	cin.clear();
	cout << "good = " << cin.good() << "\t fail= " << cin.fail() << endl;
```

![image-20240219165045793](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240219165045793.png)

可以使用ignore来忽略一整行

```c++
	cin.ignore(numeric_limits<streamsize>::max(), '\n');
```

![image-20240219165521935](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240219165521935.png)

## 宏定义

使用`#define`

```c++
#include<iostream>
using namespace std;
#define SUCCESS_CODE 0
#define EXPR 2+2

int main() {
	cout << SUCCESS_CODE << endl;

	cout << EXPR << endl;

	// 结果是 2 + 2 * 2 + 2
	cout << EXPR * EXPR << endl;
	return 0;
}
```

宏定义可以看作是静态字符串替换



## 命名空间(namespace)

为了避免不同的类库中的常量，变量，方法等等出现冲突，我们可以使用命名空间来更好的控制标志符的作用域

命名空间的使用

命名空间 :: xxx

### 基础使用

```java
#include<iostream>

namespace A {
	int num = 10;
}

namespace B {
	int num = 20;
}


int main() {
	// 使用命名空间
	std::cout << A::num << std::endl;

}
```

命名空间是开放的，可以随时往里面添加

```c++
namespace B {
	int num = 20;
}

namespace B {
	int num2 = 20;
}

```



### 使用事项（范围）

定义namespace B

```c++
namespace B {
	const int MAX_SCORE = 1120;
}
```

```c++
using namespace std;
const int MAX_SCORE = 20;
cout << MAX_SCORE << endl;

using namespace B;
cout << MAX_SCORE << endl; // 依然是方法里面定义的常量 20
cout << B::MAX_SCORE << endl; // 只有这样才能使用命名空间里面的常量 1120
```

1. 如果引用的命名空间中存在和当前的命名空间中同名字的成员，默认采用当前命名空间里面的成员
2. 如果引用的多个命名空间里面有重复的成员且当前命名空间里面没有这个成员，需要明确指出究竟采用的哪个里面的成员。



命名空间的嵌套

```c++
#include<iostream>

namespace A {
	int num = 10;
	namespace AB {
		int num = 100;
	}
}

namespace B {
	int num = 20;
}


int main() {
	// 使用命名空间
	std::cout << A::num << std::endl;
	std::cout << B::num << std::endl;

	// 多级命名空间
	std::cout << A::AB::num << std::endl;

}
```

### using使用命名空间

```c++
// using使用指定命名空间里面的成员
using A::num;
std::cout << num << std::endl;

// 使用命名空间
using namespace A;
std::cout << num << std::endl;
```

## 位运算

![image-20240219173720472](https://flycodeu-1314556962.cos.ap-nanjing.myqcloud.com//codeCenterImg/image-20240219173720472.png)

负数使用位移是向下取整的，例如  -3.12 会转换成 -4



## 案例

### 1. 输出九九乘法表

```c++
bool isPrime(unsigned int num) {
	bool res = true;

	if (num <=2) {
		res = true;
	}

	for (int i = 2; i < num; i++) {
		if (num % i == 0) {
			res = false;
		}
	}

	return res;
}

int main() {
	int num;
	cout << "输入数字" << endl;
	cin >> num;
	cout << num << (isPrime(num) ? "是质数" : "不是质数") << endl;
	return 0;

}
```

### 2. 猜数字

随机生成0-100的数字，用户输入数字来猜是否正确，一共5次机会。

```c++
int main() {
	cout << "0-100整数数，有5次机会" << endl;
	// 当前时间的随机种子,伪随机
	srand(time(0));
	// 生成0-100整数
	int target = rand() % 100;
	// 循环次数
	int n = 0;
	while (n < 5) {
		int num;
		cout << "请输入数字：" << endl;

		cin >> num;
		if (num > target) {
			cout << "猜大了" << endl;
		}
		else if (num < target) {
			cout << "猜小了" << endl;
		}
		else {
			cout << "猜对了，幸运数字是："<<num<< endl;
			break;
		}

		n++;
	}
	if (n == 5) {
		cout << "没有猜中" << endl;
	}
	cin.get();
	cin.get();
}
```

### 3. 水仙花数字

水仙花数是指一个3位数，每个位上的数字的3次幂之和等于它本身。

> 1^3+5^3+3^3=153

```c++
#include<iostream>
using namespace std;

int main() {
	int num=999;
	do {
		int index1 = num / 100;
		int index2 = num / 10 % 10;
		int index3 = num % 10;

		int res = pow(index1, 3) + pow(index2, 3) + pow(index3, 3);
		if (res == num) {
			cout << "水仙花数字：" << res << endl;
		}
		num--;
	} while (num<=999 && num>=100);
}
```

### 4. 敲桌子

从1开始到数字100，如果个位有7或者十位有7，或者是7的倍数，打印敲桌子，其余数字正常输出。

```c++
#include<iostream>
using namespace std;

int main() {
	for (int i = 1; i < 100; i++) {
		// 十位，个位，7倍数
		if (i/10 == 7 || i%10 == 7 || i % 7 == 0) {
			cout << "敲桌子" << endl;
		}
		else {
			cout << i << endl;
		}
	}
}
```

