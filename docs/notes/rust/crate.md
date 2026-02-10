---
title: crate
createTime: 2026/02/10 20:33:32
permalink: /notes/rust/crate/
---
title: Rust 模块系统（上）：Package / Crate / Module / Path / use / pub
createTime: 2026/02/10
permalink: /notes/rust/module-system-1/
## 0. 你要记住的一个心智模型

把 Rust 的模块系统当成两层结构：

- 包（Package）：Cargo 的项目单位（有 Cargo.toml），用于组织一个或多个 crate。

- crate：Rust 编译时最小单位（一个 crate 编成一个库或一个可执行文件）。

- 模块（module）：crate 内部的目录树/命名空间，用来分组代码 + 控制可见性。

- 路径（path）：在“模块树”里定位某个东西的方式。

- use/pub：让路径更好用、对外暴露 API 的工具。

## 1. Package 与 Crate
### 1.1 crate 是什么？

crate 是 Rust 编译器的最小编译单元。

就算你用 rustc foo.rs 编译单文件，编译器也会把它当成一个 crate。

crate 有两种：

- Binary crate（二进制 crate）
  - 会编译成可执行程序 
  - 必须有 fn main()

- Library crate（库 crate）

  - 不会生成可执行文件

  - 没有 main

  - 用于提供可复用功能（类似其他语言里的 library）

### 1.2 crate root 是什么？

crate root 是编译器构建模块树的起点文件：

- 库 crate 通常是 src/lib.rs

- 二进制 crate 通常是 src/main.rs

crate root 文件的内容会构成一个隐式的根模块：crate

### 1.3 package 是什么？

package 是一个或多个 crate 的打包单位，由 Cargo.toml 描述构建方式。

一个 package：

- 最多包含 1 个库 crate（src/lib.rs）

- 可以包含多个二进制 crate（src/main.rs + src/bin/*.rs）

- 但至少要有 1 个 crate（库或二进制）

### 1.4 cargo new 创建了什么？

运行：
```rus
cargo new my-project
```

通常会得到：
```
my-project
├── Cargo.toml
└── src
    └── main.rs
```

这表示：package 名叫 my-project，里面有一个同名的二进制 crate，其 crate root 是 src/main.rs。

如果你再加一个 src/lib.rs：
```
src/
    main.rs   # binary crate root
    lib.rs    # library crate root
```

这表示：同一个 package 内含 一个库 crate + 一个二进制 crate（两个 crate 的名字默认都跟 package 名相同）。

## 2. 模块（module）与模块树（module tree）
   ### 2.1 为什么要模块？

模块主要解决两件事：

- 把相关代码组织到一起（可读性、可维护性）

- 控制可见性（默认私有，细节封装）

### 2.2 模块树是什么？

模块是嵌套的，会形成一棵树，比如：
```rust
mod front_of_house {
mod hosting {
    fn add_to_waitlist() {}
        }
}
```

对应模块树（简化）：
```
crate
└── front_of_house
└── hosting
    └── add_to_waitlist
```
## 3. 模块声明与“文件怎么对应模块”
   ### 3.1 在 crate root 里声明模块

在 src/main.rs 或 src/lib.rs：
```rust
pub mod garden;
``` 

编译器会按规则找模块代码（常见新风格）：
```rust
src/garden.rs
```
或 src/garden/mod.rs（旧风格，仍支持但不推荐混用）

### 3.2 子模块怎么找？

如果 src/garden.rs 里写：
```rust
pub mod vegetables;
```

编译器会找：
```rust
src/garden/vegetables.rs

或 src/garden/vegetables/mod.rs
```
## 4. 路径（Path）：如何定位模块树里的东西

路径分两种：

### 4.1 绝对路径

当前 crate：从 crate:: 开始

外部 crate：从 crate 名开始（例如 rand::、std::）

例子：
```rust
crate::front_of_house::hosting::add_to_waitlist();
std::collections::HashMap;
rand::thread_rng();
```
### 4.2 相对路径

从当前模块出发：
```
self::...（当前模块）

super::...（父模块）
```
或直接以当前模块下的标识符开头

例子：
```rust
front_of_house::hosting::add_to_waitlist();
super::deliver_order();
```
## 5. 可见性：private vs pub（这块最容易卡）
   ### 5.1 默认规则：一切默认私有

模块、函数、结构体、枚举、方法、常量……默认对父模块私有。

所以你写：
```rust
mod front_of_house {
mod hosting {
    fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    crate::front_of_house::hosting::add_to_waitlist();
}

```
会报错：hosting 是 private。

### 5.2 pub 只“打开门”，不“开箱子”

你把模块改成公有：
```rust
mod front_of_house {
    pub mod hosting {
        fn add_to_waitlist() {}
    }
}

```
仍然会报错：add_to_waitlist 是 private。

要能调用，必须两层都 pub：
```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}
```
## 6. use：把长路径变短（但作用域很重要）
  ### 6.1 use 是“在当前作用域创建捷径”
```rust   
use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```
### 6.2 use 只在它所在的作用域生效

如果 use 在根模块，但函数在子模块里：
```rust
use crate::front_of_house::hosting;

mod customer {
    pub fn eat_at_restaurant() {
        hosting::add_to_waitlist(); // ❌ 这里看不到 hosting
    }
}

```
解决方法：

把 use 放到 mod customer 里面

或者在子模块用完整路径

或者在子模块用 super:: 访问父模块中已存在的东西（注意：这需要父模块里确实有对应名字）

## 7. 惯用法：use 怎么写更“Rust”
  ### 7.1 引入函数：通常引入父模块

推荐（更清晰地表明函数来源）：
```rust
use crate::front_of_house::hosting;

hosting::add_to_waitlist();
```

不太推荐：
```rust
use crate::front_of_house::hosting::add_to_waitlist;

add_to_waitlist();
```
### 7.2 引入类型（struct/enum/trait）：通常引入完整路径
```rust
use std::collections::HashMap;
```
### 7.3 同名冲突：两种解法

解法 A：用父模块区分
```rust
use std::fmt;
use std::io;

fn f1() -> fmt::Result { Ok(()) }
fn f2() -> io::Result<()> { Ok(()) }
```

解法 B：用 as 起别名
```rust
use std::io::Result as IoResult;
```
## 8. pub use：重导出（对外 API 很重要）

如果你的内部结构是：
```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}
```

但你希望用户写：
```rust
restaurant::hosting::add_to_waitlist()
```

而不是：
```rust
restaurant::front_of_house::hosting::add_to_waitlist()
```

你可以在 crate root：
```rust
pub use crate::front_of_house::hosting;
```

这叫 重导出（re-export）：既在当前作用域用，也对外暴露。

## 9. struct / enum 的 pub 细节（很容易记错）
   ### 9.1 pub struct：结构体公有 ≠ 字段公有
```rust   
pub struct Breakfast {
   pub toast: String,
        seasonal_fruit: String, // 仍是私有
   }
```   

要创建实例，如果有私有字段，你通常要提供一个公共构造函数（关联函数）：
```rust
impl Breakfast {
    pub fn summer(toast: &str) -> Breakfast {
        Breakfast { toast: toast.into(), seasonal_fruit: "peaches".into() }
    }
}
```
### 9.2 pub enum：枚举公有 ⇒ 变体全公有（默认就这样）
```rust
pub enum Appetizer {
    Soup,
    Salad,
}
```
## 10. 二进制 + 库 crate 的最佳实践（强烈推荐）

当一个 package 同时有：
```rust
src/main.rs（binary）

src/lib.rs（library）
```
建议：

绝大多数逻辑写在 lib crate

`main.rs` 只做“入口”和少量参数解析/启动逻辑

好处：

- 你的逻辑可复用（以后写测试、写另一个二进制入口都方便）

- main.rs 像“库的用户”一样使用 public API，更容易保持 API 稳定

## 11. 分文件组织：从单文件到多文件的正确姿势
   ### 11.1 从 crate root 声明模块（lib.rs 或 main.rs）
```rust
src/lib.rs：

mod front_of_house;

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```
### 11.2 新建模块文件
```rust
src/front_of_house.rs：

pub mod hosting;
```

### 11.3 子模块放在同名目录
```rust
src/front_of_house/hosting.rs：

pub fn add_to_waitlist() {}

```
最终目录：
```rust
src/
    lib.rs
    front_of_house.rs
    front_of_house/
        hosting.rs
```

旧风格 mod.rs 仍支持，但不建议同项目混用两套风格，否则容易让团队迷惑。

## 12. 模块小抄（Cheat Sheet）

- crate root：src/lib.rs 或 src/main.rs

- mod x; 会让编译器去找 x.rs 或 x/mod.rs

- 默认 私有，要外部可见必须 pub

- pub mod 只让“模块名可见”，模块内部内容仍需 pub

- use 只在当前作用域创建捷径

pub use = 捷径 + 对外暴露（重导出）

pub struct 字段仍默认私有；pub enum 变体默认公有