# Monkey-TS 🐒

<div align="center">

**用 TypeScript 实现的 Monkey 语言解释器**

基于 Thorsten Ball 的《Writing An Interpreter In Go》

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4.0-6E9F18.svg)](https://vitest.dev/)

[在线演示](#) | [完整文档](./docs/) | [快速开始](#快速开始)

</div>

---

## 📖 项目简介

Monkey 是一个功能完整、设计优雅的编程语言，具有 C 风格的语法。本项目使用 TypeScript 实现了 Monkey 语言的完整解释器，包括：

- **词法分析器（Lexer）** - 将源代码转换为词法单元流
- **语法分析器（Parser）** - 使用 Pratt 解析法构建抽象语法树
- **求值器（Evaluator）** - 树遍历解释器，执行程序并返回结果
- **Web Playground** - 在线交互式编程环境

## ✨ 语言特性

### 🎯 核心特性

```monkey
// ✅ 变量绑定
let age = 1;
let name = "Monkey";

// ✅ 一等公民函数
let add = fn(a, b) {
  return a + b;
};

// ✅ 高阶函数
let twice = fn(f, x) {
  return f(f(x));
};

// ✅ 闭包
let newAdder = fn(x) {
  fn(y) { x + y };
};
let addTwo = newAdder(2);
addTwo(3); // => 5

// ✅ 条件表达式
let max = fn(a, b) {
  if (a > b) { a } else { b }
};

// ✅ 递归
let fibonacci = fn(n) {
  if (n < 2) {
    n
  } else {
    fibonacci(n - 1) + fibonacci(n - 2)
  }
};
```

### 📦 数据类型

| 类型       | 示例                              | 说明       |
| ---------- | --------------------------------- | ---------- |
| **整数**   | `42`, `-10`, `0`                  | 整数运算   |
| **布尔值** | `true`, `false`                   | 逻辑运算   |
| **字符串** | `"Hello"`, `"Monkey"`             | 支持连接   |
| **数组**   | `[1, 2, 3]`, `[1, "hello", true]` | 异构数组   |
| **哈希表** | `{"key": "value", 1: "one"}`      | 键值对存储 |
| **函数**   | `fn(x) { x * 2 }`                 | 一等公民   |
| **空值**   | `null`                            | 表示无值   |

### 🔧 内置函数

```monkey
len("hello")           // => 5
len([1, 2, 3])         // => 3
first([1, 2, 3])       // => 1
last([1, 2, 3])        // => 3
rest([1, 2, 3])        // => [2, 3]
push([1, 2], 3)        // => [1, 2, 3]
puts("Hello, World!")  // 输出到控制台
```

## 🚀 快速开始

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 运行 Web Playground

```bash
pnpm dev
```

然后访问 http://localhost:5173，在浏览器中体验 Monkey 语言！

### 运行测试

```bash
# 运行所有测试
pnpm test

# 以 UI 模式运行测试
pnpm test:ui

# 运行特定模块测试
pnpm test lexer
pnpm test parser
pnpm test evaluator
```

### 构建项目

```bash
pnpm build
```

构建产物将输出到 `dist/` 目录。

## 💡 使用示例

### 作为库使用

```typescript
import { Lexer, Parser, evalNode, Environment } from './src/monkey'

// Monkey 源代码
const code = `
let map = fn(arr, f) {
  let iter = fn(arr, accumulated) {
    if (len(arr) == 0) {
      accumulated
    } else {
      iter(rest(arr), push(accumulated, f(first(arr))))
    }
  };
  iter(arr, []);
};

let double = fn(x) { x * 2 };
map([1, 2, 3, 4], double);
`

// 1. 词法分析
const lexer = new Lexer(code)

// 2. 语法分析
const parser = new Parser(lexer)
const program = parser.parseProgram()

// 检查解析错误
if (parser.getErrors().length > 0) {
  console.error('解析错误:', parser.getErrors())
  process.exit(1)
}

// 3. 求值
const env = new Environment()
const result = evalNode(program, env)

console.log(result?.inspect()) // 输出: [2, 4, 6, 8]
```

### 使用便捷接口

```typescript
import { execute } from './src/monkey'

const result = execute('let x = 5; x * 2')

if (result.success) {
  console.log(result.value?.inspect()) // 输出: 10
} else {
  console.error('错误:', result.errors)
}
```

## 📂 项目结构

```
monkey-ts/
├── src/
│   ├── monkey/                 # 解释器核心模块
│   │   ├── token/              # 词法单元定义
│   │   │   └── token.ts        # Token 类型和常量
│   │   ├── lexer/              # 词法分析器
│   │   │   ├── lexer.ts        # Lexer 实现
│   │   │   └── lexer.test.ts   # Lexer 测试
│   │   ├── ast/                # 抽象语法树
│   │   │   ├── ast.ts          # AST 节点定义
│   │   │   └── ast.test.ts     # AST 测试
│   │   ├── parser/             # 语法分析器
│   │   │   ├── parser.ts       # Parser 实现（Pratt 解析法）
│   │   │   └── parser.test.ts  # Parser 测试
│   │   ├── object/             # 对象系统
│   │   │   ├── types.ts        # 对象类型定义
│   │   │   ├── object.ts       # 对象实现
│   │   │   └── environment.ts  # 环境（作用域）
│   │   ├── evaluator/          # 求值器
│   │   │   ├── evaluator.ts    # 求值器实现
│   │   │   ├── builtins.ts     # 内置函数
│   │   │   └── evaluator.test.ts # 求值器测试
│   │   ├── index.ts            # 统一导出
│   │   └── README.md           # 模块说明
│   └── playground/             # Web 演示界面
│       ├── webPlayground.ts    # Playground 实现
│       └── styles.css          # 样式
├── docs/                       # 详细文档
│   ├── 01-词法分析.md
│   ├── 02-语法分析.md
│   ├── 03-求值.md
│   ├── 04-扩展解释器.md
│   └── 附录-快速参考.md
├── public/                     # 静态资源
├── dist/                       # 构建输出
├── index.html                  # 入口 HTML
├── package.json                # 项目配置
├── tsconfig.json               # TypeScript 配置
├── vitest.config.ts            # 测试配置
└── README.md                   # 项目说明
```

## 📚 详细文档

完整的实现文档位于 [`docs/`](./docs/) 目录：

| 文档                                     | 内容                         |
| ---------------------------------------- | ---------------------------- |
| [01-词法分析](./docs/01-词法分析.md)     | 如何将源代码转换为词法单元流 |
| [02-语法分析](./docs/02-语法分析.md)     | 使用 Pratt 解析法构建 AST    |
| [03-求值](./docs/03-求值.md)             | 树遍历解释器的实现           |
| [04-扩展解释器](./docs/04-扩展解释器.md) | 添加字符串、数组和哈希表     |
| [附录-快速参考](./docs/附录-快速参考.md) | 语法参考、内置函数、常见问题 |

## 🧪 测试

项目包含完整的测试套件，使用 Vitest 测试框架。

### 测试统计

- ✅ **词法分析器测试** - 覆盖所有 Token 类型
- ✅ **语法分析器测试** - 覆盖所有语句和表达式
- ✅ **求值器测试** - 覆盖所有运算和内置函数
- ✅ **集成测试** - 完整的程序执行测试

### 运行特定测试

```bash
# 运行词法分析器测试
pnpm test lexer

# 运行语法分析器测试
pnpm test parser

# 运行求值器测试
pnpm test evaluator

# 以监听模式运行
pnpm test -- --watch

# 查看测试覆盖率
pnpm test -- --coverage
```

## 🎨 核心实现

### 1️⃣ 词法分析器（Lexer）

将源代码字符串转换为词法单元（Token）流：

```typescript
const lexer = new Lexer('let x = 5;')

lexer.nextToken() // { Type: 'LET', Literal: 'let' }
lexer.nextToken() // { Type: 'IDENT', Literal: 'x' }
lexer.nextToken() // { Type: '=', Literal: '=' }
lexer.nextToken() // { Type: 'INT', Literal: '5' }
```

**特性**：

- 识别关键字、标识符、数字、字符串
- 处理单字符和多字符运算符（`=` vs `==`）
- 跳过空白字符和注释

### 2️⃣ 语法分析器（Parser）

使用 Pratt 解析法（运算符优先级解析）将 Token 流转换为抽象语法树：

```typescript
const parser = new Parser(lexer)
const program = parser.parseProgram()
```

**特性**：

- Pratt 解析法处理表达式
- 自动处理运算符优先级
- 前缀、中缀、后缀表达式支持
- 详细的错误信息

### 3️⃣ 求值器（Evaluator）

树遍历解释器，递归执行 AST：

```typescript
const env = new Environment()
const result = evalNode(program, env)
```

**特性**：

- 词法作用域
- 闭包支持
- 错误传播机制
- 内置函数扩展

### 4️⃣ 环境（Environment）

管理变量作用域和闭包：

```typescript
const env = new Environment()
env.set('x', new IntegerObject(5))
const [value, ok] = env.get('x')
```

**特性**：

- 嵌套作用域
- 变量查找链
- 闭包环境捕获

## 🛠️ 技术栈

| 技术           | 版本 | 用途                       |
| -------------- | ---- | -------------------------- |
| **TypeScript** | 5.9+ | 类型安全的开发体验         |
| **Vite**       | 7.1+ | 快速的开发服务器和构建工具 |
| **Vitest**     | 4.0+ | 快速的单元测试框架         |

## 📊 实现特性清单

- ✅ 词法分析（Lexer）
- ✅ 语法分析（Parser with Pratt Parsing）
- ✅ 抽象语法树（AST）
- ✅ 树遍历求值器（Tree-Walking Interpreter）
- ✅ 整数运算
- ✅ 布尔运算
- ✅ 字符串操作
- ✅ 变量绑定
- ✅ 函数定义和调用
- ✅ 高阶函数
- ✅ 闭包
- ✅ 数组
- ✅ 哈希表
- ✅ 索引表达式
- ✅ 条件表达式（if/else）
- ✅ 返回语句
- ✅ 错误处理
- ✅ 内置函数
- ✅ Web Playground
- ✅ 完整的测试覆盖

## 🎓 学习路径

### 初学者

1. 阅读 [词法分析](./docs/01-词法分析.md)
2. 阅读 [语法分析](./docs/02-语法分析.md)
3. 阅读 [求值](./docs/03-求值.md)
4. 实践：修改和扩展解释器

### 进阶开发者

1. 直接查看源代码实现
2. 阅读测试用例理解行为
3. 参考 [扩展解释器](./docs/04-扩展解释器.md) 添加新特性

## 🤝 开发指南

### 添加新特性

1. **更新词法单元定义** - 如需要新的 Token 类型
2. **扩展 Lexer** - 识别新的语法元素
3. **定义 AST 节点** - 添加新的节点类型
4. **扩展 Parser** - 实现解析逻辑
5. **定义 Object 类型** - 添加运行时对象
6. **扩展 Evaluator** - 实现求值逻辑
7. **编写测试** - 确保功能正确
8. **更新文档** - 记录新特性

### 代码风格

- 使用 TypeScript 类型注解
- 遵循函数式编程原则
- 添加详细的注释和文档
- 为新功能编写测试

### Git 工作流

```bash
# 创建特性分支
git checkout -b feature/amazing-feature

# 提交更改
git commit -m '✨ 添加新特性: XXX'

# 推送到远程
git push origin feature/amazing-feature
```

## 🐛 常见问题

### Q: 为什么除法结果是整数？

A: Monkey 只支持整数类型，除法运算会向下取整。

### Q: 如何实现循环？

A: Monkey 没有内置循环语法，使用递归实现：

```monkey
let loop = fn(n) {
  if (n > 0) {
    puts(n);
    loop(n - 1);
  }
};
```

### Q: 数组和哈希表是可变的吗？

A: 内置函数遵循不可变性原则，返回新的数据结构而不是修改原数据。

### Q: 支持浮点数吗？

A: 当前版本仅支持整数。添加浮点数是很好的扩展练习。

更多问题请参考 [附录-快速参考](./docs/附录-快速参考.md)。

## 📜 许可证

本项目仅供学习和研究使用。

## 🙏 致谢

- **[Thorsten Ball](https://thorstenball.com/)** - 《Writing An Interpreter In Go》作者
- **[Monkey 语言](https://monkeylang.org/)** - 原始 Go 实现
- **TypeScript 社区** - 优秀的类型系统和工具链

## 📖 相关资源

### 推荐阅读

- 📕 [Writing An Interpreter In Go](https://interpreterbook.com/)
- 📗 [Crafting Interpreters](https://craftinginterpreters.com/)
- 📘 [Structure and Interpretation of Computer Programs](https://mitpress.mit.edu/sites/default/files/sicp/index.html)

### 在线资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Vite 官方文档](https://vitejs.dev/)
- [Vitest 官方文档](https://vitest.dev/)
- [Pratt Parsing 解析](https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html)

---

<div align="center">

**开始你的解释器之旅吧！** 🚀

如果这个项目对你有帮助，请给个 ⭐️ 支持一下！

[报告问题](../../issues) • [提出建议](../../issues) • [贡献代码](../../pulls)

</div>
