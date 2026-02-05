---
title: MySQL 全量回顾与深度手册（SQL + 优化器 + 索引 + 事务锁）
createTime: 2026/02/05
permalink: /notes/mysql/handbook-deep/
---

# MySQL 全量回顾与深度手册：从写对 SQL 到写快 SQL

定位：
- **回顾**：把 SQL 语法与 MySQL 核心概念一次性串起来
- **查阅**：按场景快速定位（分页慢、JOIN 慢、死锁、幻读、索引失效）
- **进阶**：能读懂 EXPLAIN / EXPLAIN ANALYZE、理解 InnoDB 的 MVCC 与锁

本文以 MySQL 官方参考手册为主，关键机制均给出官方出处。

---

## 目录
1. SQL 全景：DDL / DML / DQL / DCL / TCL
2. 数据类型与建模：类型选择、字符集、时间字段
3. SELECT 深水区：执行顺序、过滤、排序、分页、聚合、窗口函数、CTE
4. JOIN 与子查询：写法、等价改写、优化器行为
5. 索引体系（InnoDB）：聚簇索引、二级索引、联合索引、覆盖索引、回表
6. 执行计划：EXPLAIN / FORMAT=TREE / EXPLAIN ANALYZE
7. 优化器关键优化：ICP、派生表/CTE 优化、BKA/BNL、Hash Join（版本相关）
8. 事务与一致性：隔离级别、MVCC、undo/redo、长事务危害
9. 锁与死锁：行锁、间隙锁、Next-Key Lock、如何定位与规避
10. 工程级排查与最佳实践：慢查询、索引设计、写 SQL 规范、面试题要点
11. 速查清单（可打印）

---

## 1) SQL 全景：你每天在用的到底是哪一类

- **DDL**（Data Definition）：CREATE / ALTER / DROP（定义结构）
- **DML**（Data Manipulation）：INSERT / UPDATE / DELETE（改数据）
- **DQL**（Data Query）：SELECT（查数据）
- **DCL**（Data Control）：GRANT / REVOKE（权限）
- **TCL**（Transaction Control）：START TRANSACTION / COMMIT / ROLLBACK（事务）

工程上 80% 的性能问题，最终都会落在：
- SELECT 的访问路径（走不走索引、扫描多少行、是否临时表/排序）
- 事务期间的锁等待（并发写、范围更新、长事务）

---

## 2) 数据类型与建模：写对 SQL 之前先把类型选对

### 2.1 数值类型：精度与范围优先
- 金额、比率等需要精确表示：优先 **DECIMAL**
- 计数、主键：常用 INT/BIGINT（按规模选）
- 近似数值：FLOAT/DOUBLE（允许误差的场景）
  官方数据类型总览：:contentReference[oaicite:0]{index=0}

### 2.2 字符串：VARCHAR/CHAR/TEXT 与字符集
- 业务字段（用户名、标题）：VARCHAR
- 定长编码（国家码、状态码）：CHAR
- 大字段：TEXT（注意索引限制与排序代价）
  字符集建议全局统一 `utf8mb4`，并把 collation 固化在库/表层，避免跨表比较触发隐式转换。

### 2.3 时间类型：DATETIME vs TIMESTAMP 的工程取舍
MySQL 日期时间类型官方定义见手册：:contentReference[oaicite:1]{index=1}  
常用原则：
- **DATETIME**：存“业务发生时间”（不随时区转换）
- **TIMESTAMP**：更贴近“时间点”，可能受到时区/自动更新行为影响（需要你明确约定）

---

## 3) SELECT 深水区：从“能查”到“查得又快又稳”

官方 SELECT 语法是所有查询能力的基座：:contentReference[oaicite:2]{index=2}

### 3.1 SELECT 的逻辑执行顺序（必须背）
> 写 SQL 时按这个顺序“想”，能减少 80% 误判

1. FROM（确定数据源）
2. JOIN ... ON（连接与连接条件）
3. WHERE（行过滤）
4. GROUP BY（分组）
5. HAVING（对分组后的过滤）
6. SELECT（投影列）
7. ORDER BY（排序）
8. LIMIT（截断）

### 3.2 WHERE：让条件“可索引”
常见导致索引失效的写法（尽量避免）：
- 对索引列做函数：`WHERE DATE(created_at)=...`
- 隐式类型转换：字符串列与数字比较，或不同字符集/collation 的比较
- `OR` 混用：`a = ? OR b = ?` 往往需要改写/拆 UNION 才能稳定用索引（视实际计划）

推荐把时间过滤写成区间：
```sql
WHERE created_at >= '2026-02-05 00:00:00'
  AND created_at <  '2026-02-06 00:00:00'
3.3 ORDER BY / LIMIT：分页为什么会慢
典型慢分页：

SELECT * FROM t ORDER BY id DESC LIMIT 1000000, 20;
原因：需要跳过大量行（即便走索引，也要“走过”百万条），并可能触发回表。

工程上用 seek pagination：

SELECT *
FROM t
WHERE id < ?
ORDER BY id DESC
LIMIT 20;
如果排序键不是唯一，使用 (sort_key, id) 组合游标。

3.4 GROUP BY / HAVING：聚合的代价来自哪里
性能成本主要来自：

分组键是否可利用索引顺序（减少临时表）

聚合前过滤是否足够（WHERE 尽量前置）

分组后过滤必须用 HAVING（但尽量让 WHERE 做更多）

3.5 窗口函数：做报表别再自连接
MySQL 8+ 支持窗口函数，可用于排名、累计、分组内 TopN 等（建议在你的版本确认开启特性后使用）。

示例：每个用户最近一单

SELECT *
FROM (
  SELECT
    o.*,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
  FROM orders o
) x
WHERE x.rn = 1;
3.6 CTE（WITH）：可读性提升，但要理解“可能物化”
CTE 语法见官方：

关键点：CTE/派生表在优化器中可能 合并（merge） 或 物化（materialize）；一旦物化就是“先算出临时结果集再用”。官方对派生表/CTE 的优化与物化行为有专门章节：

4) JOIN 与子查询：写法正确只是起点，关键是“连接策略”
4.1 JOIN 类型与语义边界
INNER JOIN：只保留匹配行

LEFT JOIN：保留左表所有行（右表无匹配则为 NULL）

常见坑：LEFT JOIN 之后在 WHERE 写右表条件会“把 NULL 行过滤掉”，语义接近 INNER JOIN。应把右表过滤写进 ON：

LEFT JOIN b ON b.a_id = a.id AND b.status = 1
4.2 JOIN 性能取决于两件事
驱动表选择：先过滤更强、行更少的一侧做驱动通常更优

被驱动表的访问路径：能否用索引快速定位匹配行

4.3 BNL/BKA：当优化器用 join buffer 时意味着什么
MySQL 提供 Block Nested-Loop 与 Batched Key Access（BKA）等 join 优化机制，官方解释 BKA 使用索引访问 + join buffer：

工程解读：

你看到执行计划出现 join buffer 或相关提示，通常意味着：

连接条件不够“索引友好”，或

被驱动表缺少合适索引，或

需要批量访问以减少随机 IO

4.4 Hash Join：版本相关，别凭经验
在新版本 MySQL 中，EXPLAIN 的 TREE 格式会显示 hash join 的使用（官方说明 TREE 格式与 hash join 展示关系）：

结论：是否 hash join、何时 hash join，必须以你当前版本的执行计划为准。

4.5 子查询 IN vs EXISTS：语义与计划都要看
IN：适合子查询结果集较小、且可去重/索引良好

EXISTS：适合“相关子查询”，按外层行探测存在性

派生表/视图/CTE 的优化（合并或物化）是影响子查询性能的关键变量：

5) 索引体系（InnoDB）：把“为什么慢”拆成可验证的事实
核心认知：SQL 慢通常不是“算得慢”，而是“读得多、读得散、锁得久”。

5.1 聚簇索引与二级索引（必须理解）
InnoDB 的表数据按主键组织（聚簇索引）。二级索引叶子节点保存二级索引键 + 主键值；如果查询需要整行数据，通常需要“二次定位”（回表）。

结果：

主键范围扫描非常强

二级索引能过滤，但取整行可能产生大量回表随机访问

5.2 联合索引与最左前缀：你以为的“都能用”往往不成立
索引 (a, b, c)：

a = ? ✅

a = ? AND b = ? ✅

a = ? AND b > ? ✅（a 精确 + b 范围）

b = ? ❌（通常不走这个联合索引的前缀）

a > ? AND b = ?：走不走、走多少由优化器决定（通常 a 范围会限制后续列利用）

5.3 覆盖索引：让查询不回表
当 SELECT 的列都在索引中时，可能只扫索引就完成查询（减少随机 IO）。这是高并发系统里常用的“把读路径做薄”的手段。

6) 执行计划：从 EXPLAIN 到 EXPLAIN ANALYZE
官方 EXPLAIN 说明：

6.1 EXPLAIN 要看什么（通用）
访问类型（是否全表扫、是否范围扫、是否唯一定位）

使用了哪个索引 key

估算扫描行数 rows

Extra（是否临时表、是否 filesort、是否使用 join buffer）

6.2 FORMAT=TREE：更接近“执行树”的表述
官方说明 TREE 格式提供树状输出，并且更精确；且 EXPLAIN ANALYZE 总是使用 TREE：

6.3 EXPLAIN ANALYZE：用真实执行统计“打脸估算”
官方对 EXPLAIN ANALYZE 的定位：它会执行查询并输出执行过程中各步骤的耗时与行数统计，而不是返回结果集：

工程用法：

当 EXPLAIN 估算 rows 很小，但实际很慢 → 优先用 EXPLAIN ANALYZE 找“时间花在哪个迭代器节点”

发现某个节点输出行数远大于预期 → 往上追溯过滤条件是否没有下推、索引是否不匹配

7) 优化器关键优化：知道这些，你才能解释“为什么改写就快了”
7.1 ICP（Index Condition Pushdown）：把部分 WHERE 下推到存储引擎
ICP 官方定义：当 WHERE 条件的一部分仅依赖索引列时，MySQL 可把条件下推到存储引擎层，减少回表行数与上层过滤成本：

工程意义：

联合索引里包含过滤列时，ICP 常能显著减少“先取出再过滤”的成本

你在计划里看到 “Using index condition” 等提示，通常与 ICP 有关（以实际版本输出为准）

7.2 派生表/CTE：合并 vs 物化
官方说明：派生表与 CTE 可能被物化；若 CTE 被物化，在同一查询中引用多次仍只物化一次；递归 CTE 总是物化：

工程建议：

复杂查询先确认它到底被 merge 还是 materialize（EXPLAIN TREE 更直观）

物化会带来临时结果集成本（内存/磁盘），同时也可能带来“先算一次多处复用”的收益

7.3 BKA/BNL：join buffer 的性能权衡
BKA 官方说明其用于利用索引访问 + join buffer 的批量访问：

工程判断：

若 join buffer 出现且 rows 很大，通常意味着索引设计不足或驱动表选择不理想

优先考虑：补齐被驱动表连接键索引、提升驱动表过滤力度、改写连接顺序（必要时）

8) 事务与一致性：隔离级别只是表象，底层是 MVCC + undo
8.1 隔离级别（InnoDB 默认）
InnoDB 事务隔离级别与默认值：官方明确 InnoDB 默认隔离级别为 REPEATABLE READ：

8.2 MVCC：一致性读怎么做到“读到旧版本”
InnoDB MVCC 依赖 undo log：一致性读需要从 undo log 重建旧版本；官方对多版本机制与二级索引差异做了说明：聚簇索引记录会就地更新并通过隐藏系统列指向 undo log 以重建旧版本，而二级索引记录不包含隐藏系统列且不就地更新：

8.3 长事务的危害：undo 不可及时清理
官方说明：MVCC 必须保留 undo log 直到所有依赖该数据的事务完成；长事务会导致 History list length 增大：

工程结论：

长事务不仅拖慢自己，还会拖累整个系统（purge 压力、undo 膨胀、磁盘与性能抖动）

线上问题排查时，“有没有长事务”是必须先确认的一项

9) 锁与死锁：你要能解释“为什么会锁住没写到的行”
9.1 Next-Key Lock：行锁 + 间隙锁的组合
官方对 InnoDB 锁机制与 next-key locks 有专门章节：

工程上最常见的现象：

在 REPEATABLE READ 下做范围更新/范围查询并加锁（例如 SELECT ... FOR UPDATE），可能锁住“范围内的间隙”，阻止其他事务插入该范围的新行

这不是“锁表”，而是“范围锁语义”带来的并发限制

9.2 死锁三板斧（非常实用）
统一访问顺序：多行更新按主键排序

缩小事务：减少锁持有时间

用索引缩小锁范围：让 WHERE 能命中索引，避免锁扩大为范围锁/扫描锁

10) 工程级排查：慢 SQL、索引、并发，一次给出可执行流程
10.1 慢查询定位流程（推荐顺序）
复现 SQL（带上真实参数，确认返回行数级别）

EXPLAIN 看访问路径（是否 ALL、是否走错索引、是否 filesort/temporary）

EXPLAIN ANALYZE 看真实耗时节点（确认“时间花在哪里”）：

针对性优化：

索引：补齐过滤列、连接键、排序键的组合

改写：seek pagination、把过滤前置、减少回表列、拆分 OR、避免隐式转换

并发：缩短事务、降低范围锁冲突

10.2 索引设计的工程规则（可当 checklist）
联合索引优先满足：过滤（高选择性） + 排序/分组

对高频列表页：

列表查询尽量走覆盖索引

详情查询再回表（或单独接口）

对 JOIN：

被驱动表连接键必须有索引

驱动表必须尽可能先过滤小

11) 面试题深度版（标准回答 + 追问方向）
Q1：为什么同样是赋值/传参，有时会“很慢”？
答题点：不是语法慢，是读路径慢。看是否全表扫/大范围扫、是否回表、是否临时表、是否 filesort。用 EXPLAIN/ANALYZE 证明：

Q2：为什么 REPEATABLE READ 下“插入也被阻塞”？
答题点：next-key locks 会锁住范围间隙以防止幻读（范围锁语义）。需要结合具体 SQL（范围条件、是否 FOR UPDATE、是否走索引）解释：

Q3：CTE 一定更慢吗？
答题点：不一定。关键在于是否物化、是否被复用、是否可 merge。官方：CTE 可能被物化，且被物化时同一查询多次引用只物化一次；递归 CTE 总是物化：

Q4：ICP 是什么？什么时候有效？
答题点：把仅依赖索引列的过滤条件下推到存储引擎，减少回表与上层过滤。官方定义：

12) 速查清单（写 SQL 时的硬规则）
UPDATE/DELETE 必须带 WHERE；上线前先用同条件 SELECT 评估影响行数

时间过滤用区间，不对索引列套函数

列表页分页优先 seek pagination

JOIN：被驱动表连接键必须建索引；LEFT JOIN 的右表过滤放 ON

联合索引遵循最左前缀；索引列顺序按“过滤强度 + 排序需求”

EXPLAIN 只是估算，疑难必须上 EXPLAIN ANALYZE：

控制事务：短事务、固定更新顺序、避免范围锁冲突

排查并发问题先找长事务（undo/purge 压力会持续扩大）