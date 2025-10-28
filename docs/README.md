# Monkey 语言解释器文档

欢迎来到 Monkey 语言解释器的详细文档！本文档基于 Thorsten Ball 的著作《Writing An Interpreter In Go》，使用 TypeScript 实现。

## 📚 关于本文档

本文档系列将带你深入了解如何从零开始构建一个完整的编程语言解释器。我们将按照原书的逻辑结构，详细讲解每个组件的设计和实现，但所有代码示例都使用 TypeScript 编写。

## 🎯 Monkey 语言简介

Monkey 是一个简洁而强大的编程语言，具有以下特性：

- **C 风格的语法**：熟悉的表达式和语句结构
- **变量绑定**：使用 `let` 关键字声明变量
- **整数和布尔值**：基础数据类型
- **字符串**：支持字符串操作
- **数组和哈希表**：内置的数据结构
- **算术表达式**：支持加减乘除等运算
- **内置函数**：`len`、`first`、`last`、`push` 等
- **一等公民函数**：函数可以作为值传递
- **闭包**：支持函数闭包
- **高阶函数**：函数可以接收和返回函数

### Monkey 代码示例

```monkey
// 变量绑定
let age = 1;
let name = "Monkey";
let result = 10 * (20 / 2);

// 数组
let myArray = [1, 2, 3, 4, 5];
let first = myArray[0];

// 哈希表
let myHash = {"name": "Jimmy", "age": 72};
myHash["name"];

// 函数
let add = fn(a, b) { return a + b; };
add(1, 2);

// 高阶函数
let twice = fn(f, x) {
  return f(f(x));
};

let addTwo = fn(x) {
  return x + 2;
};

twice(addTwo, 2); // => 6

// 闭包
let newAdder = fn(x) {
  fn(y) { x + y };
};

let addTwo = newAdder(2);
addTwo(3); // => 5
```

## 📖 文档章节

### [第一章：词法分析](./01-lexing.md)

学习如何构建词法分析器（Lexer），将源代码字符串转换为词法单元流。

- 什么是词法分析
- 词法单元的定义
- 实现 Lexer 类
- 识别标识符、数字、运算符等

### [第二章：语法分析](./02-parsing.md)

深入理解语法分析器（Parser），使用 Pratt 解析法构建抽象语法树（AST）。

- 什么是语法分析和 AST
- Pratt 解析法（运算符优先级解析）
- 前缀、中缀和后缀表达式
- 实现完整的 Parser

### [第三章：求值](./03-evaluation.md)

学习如何遍历 AST 并执行代码，实现树遍历解释器。

- 对象系统的设计
- 环境和变量绑定
- 求值表达式和语句
- 函数调用和闭包
- 内置函数

### [第四章：扩展解释器](./04-extending.md)

扩展解释器以支持更多特性。

- 字符串类型
- 数组和数组操作
- 哈希表（字典）
- 索引表达式

### [附录：快速参考](./appendix.md)

实用的参考信息和快速指南。

- Monkey 语言语法参考
- 内置函数完整文档
- 对象类型参考
- 错误信息参考
- 常见问题解答
- 性能优化技巧
- 测试指南

## 🏗️ 解释器架构

```
源代码字符串
    ↓
[词法分析器 Lexer]
    ↓
词法单元流
    ↓
[语法分析器 Parser]
    ↓
抽象语法树 (AST)
    ↓
[求值器 Evaluator]
    ↓
执行结果
```

### 核心组件

1. **Token**：词法单元，源代码的最小有意义单位
2. **Lexer**：词法分析器，将源代码转换为词法单元流
3. **AST**：抽象语法树，表示程序的结构化形式
4. **Parser**：语法分析器，将词法单元流转换为 AST
5. **Object**：运行时对象系统，表示程序执行时的值
6. **Environment**：环境，管理变量的作用域
7. **Evaluator**：求值器，遍历 AST 并执行代码

## 🚀 快速开始

如果你想直接开始使用 Monkey 解释器：

```typescript
import { execute, Environment } from './monkey'

const env = new Environment()

// 执行 Monkey 代码
const result = execute('let x = 5; x * 2', env)

if (result.success) {
  console.log(result.value?.inspect()) // "10"
} else {
  console.error(result.errors)
}
```

## 💡 学习路径建议

1. **初学者**：按顺序阅读所有章节，从第一章开始
2. **有经验的开发者**：可以跳过基础概念，重点关注实现细节
3. **对特定主题感兴趣**：直接跳转到相关章节

## 📝 代码约定

本文档中的所有代码示例都遵循以下约定：

- 使用 TypeScript 类型注解
- 遵循函数式编程原则（尽可能不可变）
- 详细的注释和说明
- 完整的类型定义

## 🔗 相关资源

- [原书《Writing An Interpreter In Go》](https://interpreterbook.com/)
- [项目源代码](../src/monkey/)

## 🤝 贡献

如果你发现文档中的错误或有改进建议，欢迎提交 Issue 或 Pull Request！

---

让我们开始这段精彩的解释器实现之旅吧！从[第一章：词法分析](./01-lexing.md)开始。
