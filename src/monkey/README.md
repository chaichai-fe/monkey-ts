# Monkey 语言解释器核心模块

这个目录包含了 Monkey 语言解释器的所有核心模块。

## 📂 目录结构

```
src/monkey/
├── index.ts              # 统一导出入口
├── token/                # 词法单元
│   └── token.ts
├── lexer/                # 词法分析器
│   ├── lexer.ts
│   └── lexer.test.ts
├── ast/                  # 抽象语法树
│   ├── ast.ts
│   └── ast.test.ts
├── parser/               # 语法分析器
│   ├── parser.ts
│   └── parser.test.ts
├── object/               # 对象系统
│   ├── object.ts
│   ├── types.ts
│   └── environment.ts
└── evaluator/            # 求值器
    ├── evaluator.ts
    ├── evaluator.test.ts
    └── builtins.ts
```

## 🚀 使用方式

### 方式一：直接导入核心模块

```typescript
import { Lexer } from './monkey/lexer/lexer'
import { Parser } from './monkey/parser/parser'
import { evalNode } from './monkey/evaluator/evaluator'
import { Environment } from './monkey/object/environment'

const code = 'let x = 5; x * 2'
const lexer = new Lexer(code)
const parser = new Parser(lexer)
const program = parser.parseProgram()
const env = new Environment()
const result = evalNode(program, env)

console.log(result?.inspect()) // "10"
```

### 方式二：使用统一导出接口（推荐）

```typescript
import { execute, Environment } from './monkey'

const env = new Environment()
const result = execute('let x = 5; x * 2', env)

if (result.success) {
  console.log(result.value?.inspect()) // "10"
} else {
  console.error(result.errors)
}
```

### 方式三：使用所有导出

```typescript
import * as Monkey from './monkey'

const env = new Monkey.Environment()
const result = Monkey.execute('let x = 5; x * 2', env)
```

## 📦 导出内容

- **Lexer**: 词法分析器，将源代码转换为 Token 流
- **Parser**: 语法分析器，将 Token 流转换为 AST
- **evalNode**: 求值器，执行 AST 并返回结果
- **Environment**: 环境对象，管理变量作用域
- **builtins**: 内置函数集合
- **execute**: 便捷函数，一次性执行完整的解释流程
- **各种 AST 节点类**: `Program`, `LetStatement`, `FunctionLiteral` 等
- **各种 Object 类**: `IntegerObject`, `StringObject`, `FunctionObject` 等

## 🧪 运行测试

```bash
npm test
```

所有测试文件都位于对应的模块目录中，使用 Vitest 测试框架。

## 📖 了解更多

这个解释器基于《Writing An Interpreter In Go》一书实现，是一个功能完整的树遍历解释器。
