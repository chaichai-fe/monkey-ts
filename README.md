# Monkey-TS

一个用 TypeScript 实现的 Monkey 语言解释器。

## 📖 关于

这是《Writing An Interpreter In Go》一书的 TypeScript 实现版本。Monkey 是一个简洁而强大的编程语言，具有 C 风格的语法、一等公民函数、闭包、数组和哈希表等特性。

## ✨ 特性

- **完整的解释器**：包含词法分析器、语法分析器和求值器
- **丰富的数据类型**：整数、布尔值、字符串、数组、哈希表
- **函数式编程**：一等公民函数、高阶函数、闭包
- **内置函数**：len、first、last、rest、push、puts 等
- **Web 演示界面**：在线体验 Monkey 语言
- **完整的测试套件**：使用 Vitest 测试框架
- **TypeScript 类型安全**：充分利用 TypeScript 的类型系统

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 运行测试

```bash
pnpm test
```

### 启动 Web 演示

```bash
pnpm dev
```

然后访问 http://localhost:5173

### 构建项目

```bash
pnpm build
```

## 💡 使用示例

### 作为库使用

```typescript
import { Lexer, Parser, evalNode, Environment } from './src/monkey'

const code = `
let add = fn(a, b) {
  a + b
};

add(5, 10)
`

const lexer = new Lexer(code)
const parser = new Parser(lexer)
const program = parser.parseProgram()
const env = new Environment()
const result = evalNode(program, env)

console.log(result?.inspect()) // "15"
```

### Monkey 代码示例

```monkey
// 变量和函数
let name = "Monkey";
let age = 1;

let greet = fn(name) {
  "Hello, " + name + "!"
};

greet(name); // "Hello, Monkey!"

// 数组
let numbers = [1, 2, 3, 4, 5];
let first = first(numbers);
let rest = rest(numbers);

// 哈希表
let person = {
  "name": "John",
  "age": 30,
  "active": true
};

person["name"]; // "John"

// 高阶函数
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
map([1, 2, 3], double); // [2, 4, 6]

// 闭包
let newAdder = fn(x) {
  fn(y) { x + y };
};

let addTwo = newAdder(2);
addTwo(3); // 5
```

## 📚 详细文档

完整的实现文档位于 [`docs/`](./docs/) 目录：

- **[文档主页](./docs/README.md)** - 文档概览和导航
- **[第一章：词法分析](./docs/01-lexing.md)** - 如何将源代码转换为词法单元流
- **[第二章：语法分析](./docs/02-parsing.md)** - 使用 Pratt 解析法构建 AST
- **[第三章：求值](./docs/03-evaluation.md)** - 树遍历解释器的实现
- **[第四章：扩展解释器](./docs/04-extending.md)** - 添加字符串、数组和哈希表
- **[附录：快速参考](./docs/appendix.md)** - 语法参考、内置函数、常见问题

## 🏗️ 项目结构

```
monkey-ts/
├── src/
│   ├── monkey/              # 解释器核心模块
│   │   ├── token/           # 词法单元定义
│   │   ├── lexer/           # 词法分析器
│   │   ├── ast/             # 抽象语法树
│   │   ├── parser/          # 语法分析器
│   │   ├── object/          # 对象系统
│   │   └── evaluator/       # 求值器
│   └── playground/          # Web 演示界面
├── docs/                    # 详细文档
├── dist/                    # 构建输出
└── tests/                   # 测试文件
```

## 🧪 测试

项目包含完整的测试套件，覆盖所有核心功能：

```bash
# 运行所有测试
pnpm test

# 运行特定模块测试
pnpm test lexer
pnpm test parser
pnpm test evaluator

# 查看测试覆盖率
pnpm test -- --coverage

# 使用 UI 界面
pnpm test:ui
```

## 📖 核心组件

### Lexer（词法分析器）

将源代码字符串转换为词法单元流。

```typescript
const lexer = new Lexer('let x = 5;')
lexer.nextToken() // { Type: "LET", Literal: "let" }
```

### Parser（语法分析器）

将词法单元流转换为抽象语法树（AST）。

```typescript
const parser = new Parser(lexer)
const program = parser.parseProgram()
```

### Evaluator（求值器）

遍历 AST 并执行代码。

```typescript
const env = new Environment()
const result = evalNode(program, env)
```

### Environment（环境）

管理变量作用域和闭包。

```typescript
const env = new Environment()
env.set('x', new IntegerObject(5))
const [value, ok] = env.get('x')
```

## 🎯 实现特性

- ✅ 整数运算
- ✅ 布尔运算
- ✅ 字符串操作
- ✅ 变量绑定
- ✅ 函数定义和调用
- ✅ 闭包
- ✅ 高阶函数
- ✅ 数组
- ✅ 哈希表
- ✅ 内置函数
- ✅ 错误处理
- ✅ 条件表达式
- ✅ 返回语句

## 🔧 技术栈

- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 现代化的前端构建工具
- **Vitest** - 快速的单元测试框架

## 📝 开发指南

### 添加新特性

1. **更新 Token 定义**（如果需要新的词法单元）
2. **扩展 Lexer**（识别新的语法元素）
3. **添加 AST 节点**（定义新的语法结构）
4. **扩展 Parser**（实现解析逻辑）
5. **添加 Object 类型**（定义运行时对象）
6. **扩展 Evaluator**（实现求值逻辑）
7. **添加测试**（确保功能正确）
8. **更新文档**（记录新特性）

### 代码风格

- 使用 TypeScript 类型注解
- 遵循函数式编程原则
- 添加详细的注释和文档
- 为新功能编写测试

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

本项目仅供学习和研究使用。

## 🙏 致谢

- [Thorsten Ball](https://twitter.com/thorstenball) - 原书《Writing An Interpreter In Go》作者
- [Monkey 语言](https://monkeylang.org/) - 原始 Go 实现

## 📚 相关资源

- [《Writing An Interpreter In Go》](https://interpreterbook.com/)
- [《Crafting Interpreters》](https://craftinginterpreters.com/)
- [项目文档](./docs/README.md)

---

**开始你的解释器之旅吧！** 🚀

从[文档主页](./docs/README.md)开始学习，或者直接运行 `pnpm dev` 体验 Monkey 语言！
