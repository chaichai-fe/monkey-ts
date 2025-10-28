# 附录：快速参考

> 本附录提供 Monkey 语言和解释器实现的快速查阅手册。

## 目录

- [A.1 语言参考](#a1-语言参考)
  - [A.1.1 语法速查](#a11-语法速查)
  - [A.1.2 数据类型](#a12-数据类型)
  - [A.1.3 运算符](#a13-运算符)
  - [A.1.4 内置函数](#a14-内置函数)
- [A.2 实现参考](#a2-实现参考)
  - [A.2.1 Token 类型](#a21-token-类型)
  - [A.2.2 AST 节点](#a22-ast-节点)
  - [A.2.3 对象类型](#a23-对象类型)
  - [A.2.4 运算符优先级](#a24-运算符优先级)
- [A.3 API 参考](#a3-api-参考)
- [A.4 错误信息](#a4-错误信息)
- [A.5 示例集锦](#a5-示例集锦)
- [A.6 常见问题](#a6-常见问题)

---

## A.1 语言参考

### A.1.1 语法速查

#### 变量绑定

```monkey
let <identifier> = <expression>;
```

**示例：**

```monkey
let x = 5;
let y = x + 10;
let name = "Monkey";
```

#### 函数定义

```monkey
fn(<parameters>) { <statements> }
```

**示例：**

```monkey
let add = fn(a, b) { a + b };
let greet = fn(name) { "Hello, " + name + "!" };
```

#### 函数调用

```monkey
<expression>(<arguments>)
```

**示例：**

```monkey
add(5, 3);
greet("World");
```

#### 条件表达式

```monkey
if (<condition>) { <consequence> } else { <alternative> }
```

**示例：**

```monkey
if (x > 5) {
  return true;
} else {
  return false;
}
```

#### 返回语句

```monkey
return <expression>;
```

**示例：**

```monkey
return 42;
return x + y;
```

#### 数组字面量

```monkey
[<expression>, <expression>, ...]
```

**示例：**

```monkey
[1, 2, 3, 4, 5]
["hello", "world"]
[1, "mixed", true, fn(x) { x }]
```

#### 哈希字面量

```monkey
{<expression>: <expression>, ...}
```

**示例：**

```monkey
{"name": "Monkey", "age": 1}
{1: "one", 2: "two", 3: "three"}
{true: "yes", false: "no"}
```

#### 索引访问

```monkey
<expression>[<expression>]
```

**示例：**

```monkey
arr[0]
hash["key"]
[1, 2, 3][1]
{"name": "Monkey"}["name"]
```

### A.1.2 数据类型

| 类型       | 描述       | 字面量示例           |
| ---------- | ---------- | -------------------- |
| **整数**   | 整数值     | `42`, `-10`, `0`     |
| **布尔**   | 真假值     | `true`, `false`      |
| **字符串** | 文本       | `"hello"`, `"world"` |
| **空值**   | 无值       | `null`               |
| **数组**   | 有序集合   | `[1, 2, 3]`          |
| **哈希表** | 键值对映射 | `{"key": "value"}`   |
| **函数**   | 函数对象   | `fn(x) { x * 2 }`    |

### A.1.3 运算符

#### 算术运算符

| 运算符 | 描述 | 示例    | 结果 |
| ------ | ---- | ------- | ---- |
| `+`    | 加法 | `5 + 3` | `8`  |
| `-`    | 减法 | `5 - 3` | `2`  |
| `*`    | 乘法 | `5 * 3` | `15` |
| `/`    | 整除 | `5 / 3` | `1`  |

#### 比较运算符

| 运算符 | 描述   | 示例     | 结果   |
| ------ | ------ | -------- | ------ |
| `==`   | 等于   | `5 == 5` | `true` |
| `!=`   | 不等于 | `5 != 3` | `true` |
| `<`    | 小于   | `3 < 5`  | `true` |
| `>`    | 大于   | `5 > 3`  | `true` |

#### 逻辑运算符

| 运算符 | 描述   | 示例    | 结果    |
| ------ | ------ | ------- | ------- |
| `!`    | 逻辑非 | `!true` | `false` |

#### 字符串运算符

| 运算符 | 描述       | 示例                 | 结果            |
| ------ | ---------- | -------------------- | --------------- |
| `+`    | 字符串拼接 | `"hello" + " world"` | `"hello world"` |

#### 运算符优先级（从低到高）

1. `LOWEST` - 最低
2. `EQUALS` - `==`, `!=`
3. `LESSGREATER` - `<`, `>`
4. `SUM` - `+`, `-`
5. `PRODUCT` - `*`, `/`
6. `PREFIX` - `-x`, `!x`
7. `CALL` - `myFunction(x)`
8. `INDEX` - `array[index]`

### A.1.4 内置函数

#### len(arg)

返回字符串或数组的长度。

```monkey
len("hello")     // 5
len([1, 2, 3])   // 3
len([])          // 0
```

#### first(array)

返回数组的第一个元素，如果数组为空返回 `null`。

```monkey
first([1, 2, 3]) // 1
first([])        // null
```

#### last(array)

返回数组的最后一个元素，如果数组为空返回 `null`。

```monkey
last([1, 2, 3])  // 3
last([])         // null
```

#### rest(array)

返回数组除第一个元素外的其余元素，如果数组为空返回 `null`。

```monkey
rest([1, 2, 3])  // [2, 3]
rest([1])        // []
rest([])         // null
```

#### push(array, element)

向数组末尾添加元素，返回新数组（不修改原数组）。

```monkey
push([1, 2], 3)  // [1, 2, 3]
```

#### puts(...args)

打印参数到控制台，返回 `null`。

```monkey
puts("Hello, World!")
puts(1, 2, 3)
puts([1, 2, 3], {"name": "Monkey"})
```

## A.2 实现参考

### A.2.1 Token 类型

```typescript
// 特殊类型
ILLEGAL = 'ILLEGAL' // 非法字符
EOF = 'EOF' // 文件结束

// 标识符和字面量
IDENT = 'IDENT' // 标识符
INT = 'INT' // 整数
STRING = 'STRING' // 字符串

// 运算符
ASSIGN = '=' // 赋值
PLUS = '+' // 加
MINUS = '-' // 减
BANG = '!' // 逻辑非
ASTERISK = '*' // 乘
SLASH = '/' // 除
LT = '<' // 小于
GT = '>' // 大于
EQ = '==' // 等于
NOT_EQ = '!=' // 不等于

// 分隔符
COMMA = ',' // 逗号
SEMICOLON = ';' // 分号
COLON = ':' // 冒号
LPAREN = '(' // 左圆括号
RPAREN = ')' // 右圆括号
LBRACE = '{' // 左花括号
RBRACE = '}' // 右花括号
LBRACKET = '[' // 左方括号
RBRACKET = ']' // 右方括号

// 关键字
FUNCTION = 'FUNCTION' // fn
LET = 'LET' // let
TRUE = 'TRUE' // true
FALSE = 'FALSE' // false
IF = 'IF' // if
ELSE = 'ELSE' // else
RETURN = 'RETURN' // return
```

### A.2.2 AST 节点

#### 语句节点

```typescript
Program // 程序根节点
LetStatement // let 语句
ReturnStatement // return 语句
ExpressionStatement // 表达式语句
BlockStatement // 代码块
```

#### 表达式节点

```typescript
Identifier // 标识符
IntegerLiteral // 整数字面量
StringLiteral // 字符串字面量
BooleanLiteral // 布尔字面量
ArrayLiteral // 数组字面量
HashLiteral // 哈希字面量
PrefixExpression // 前缀表达式
InfixExpression // 中缀表达式
IfExpression // if 表达式
FunctionLiteral // 函数字面量
CallExpression // 函数调用表达式
IndexExpression // 索引表达式
```

### A.2.3 对象类型

```typescript
INTEGER_OBJ = 'INTEGER' // 整数对象
BOOLEAN_OBJ = 'BOOLEAN' // 布尔对象
STRING_OBJ = 'STRING' // 字符串对象
NULL_OBJ = 'NULL' // 空值对象
ARRAY_OBJ = 'ARRAY' // 数组对象
HASH_OBJ = 'HASH' // 哈希对象
FUNCTION_OBJ = 'FUNCTION' // 函数对象
BUILTIN_OBJ = 'BUILTIN' // 内置函数对象
RETURN_VALUE_OBJ = 'RETURN_VALUE' // 返回值对象
ERROR_OBJ = 'ERROR' // 错误对象
```

### A.2.4 运算符优先级

```typescript
const enum Precedence {
  LOWEST = 1, // 最低优先级
  EQUALS, // == 或 !=
  LESSGREATER, // < 或 >
  SUM, // + 或 -
  PRODUCT, // * 或 /
  PREFIX, // -X 或 !X
  CALL, // myFunction(X)
  INDEX, // array[index]
}
```

**映射表：**

```typescript
const precedences: Record<TokenType, Precedence> = {
  [EQ]: Precedence.EQUALS,
  [NOT_EQ]: Precedence.EQUALS,
  [LT]: Precedence.LESSGREATER,
  [GT]: Precedence.LESSGREATER,
  [PLUS]: Precedence.SUM,
  [MINUS]: Precedence.SUM,
  [SLASH]: Precedence.PRODUCT,
  [ASTERISK]: Precedence.PRODUCT,
  [LPAREN]: Precedence.CALL,
  [LBRACKET]: Precedence.INDEX,
}
```

## A.3 API 参考

### Lexer API

```typescript
class Lexer {
  constructor(input: string)
  nextToken(): Token
}
```

**使用示例：**

```typescript
import { Lexer } from './lexer/lexer'

const lexer = new Lexer('let x = 5;')
let token = lexer.nextToken()

while (token.Type !== 'EOF') {
  console.log(token)
  token = lexer.nextToken()
}
```

### Parser API

```typescript
class Parser {
  constructor(lexer: Lexer)
  parseProgram(): Program
  getErrors(): string[]
}
```

**使用示例：**

```typescript
import { Lexer } from './lexer/lexer'
import { Parser } from './parser/parser'

const input = 'let x = 5;'
const lexer = new Lexer(input)
const parser = new Parser(lexer)

const program = parser.parseProgram()

if (parser.getErrors().length > 0) {
  console.error('Parser errors:', parser.getErrors())
} else {
  console.log(program.toString())
}
```

### Evaluator API

```typescript
function evalNode(node: Node | null, env: Environment): MonkeyObject | null
```

**使用示例：**

```typescript
import { Lexer } from './lexer/lexer'
import { Parser } from './parser/parser'
import { evalNode } from './evaluator/evaluator'
import { Environment } from './object/environment'

const input = `
let x = 5;
let y = x + 3;
y;
`

const lexer = new Lexer(input)
const parser = new Parser(lexer)
const program = parser.parseProgram()

const env = new Environment()
const result = evalNode(program, env)

console.log(result?.inspect()) // 输出: 8
```

### Environment API

```typescript
class Environment {
  constructor(outer?: Environment)
  get(name: string): MonkeyObject | undefined
  set(name: string, val: MonkeyObject): MonkeyObject
}

function newEnclosedEnvironment(outer: Environment): Environment
```

**使用示例：**

```typescript
import { Environment } from './object/environment'
import { IntegerObject } from './object/object'

const env = new Environment()

// 设置变量
env.set('x', new IntegerObject(5))

// 获取变量
const x = env.get('x')
console.log(x?.inspect()) // 输出: 5

// 创建嵌套环境
const innerEnv = newEnclosedEnvironment(env)
innerEnv.set('y', new IntegerObject(10))

// 可以访问外层环境的变量
const x2 = innerEnv.get('x')
console.log(x2?.inspect()) // 输出: 5
```

## A.4 错误信息

### 词法错误

```
未实现（Lexer 会为无法识别的字符返回 ILLEGAL token）
```

### 语法错误

```
expected next token to be <type>, got <actual> instead
no prefix parse function for <type> found
```

**示例：**

```
输入: let x 5;
错误: expected next token to be =, got INT instead

输入: @invalid
错误: no prefix parse function for ILLEGAL found
```

### 运行时错误

```
// 类型错误
type mismatch: <type1> <operator> <type2>

// 未知运算符
unknown operator: <type> <operator> <type>
unknown operator: <operator><type>

// 标识符未定义
identifier not found: <name>

// 不可调用
not a function: <type>

// 索引错误
index operator not supported: <type>
unusable as hash key: <type>

// 参数错误
wrong number of arguments. got=<actual>, want=<expected>

// 类型错误（内置函数）
argument to '<function>' not supported, got <type>
argument to '<function>' must be <expected>, got <type>
```

**示例：**

```monkey
// 类型错误
5 + "hello"
// ERROR: type mismatch: INTEGER + STRING

// 未知运算符
true - false
// ERROR: unknown operator: BOOLEAN - BOOLEAN

// 标识符未定义
x
// ERROR: identifier not found: x

// 不可调用
let x = 5; x(1)
// ERROR: not a function: INTEGER

// 索引错误
5[0]
// ERROR: index operator not supported: INTEGER

// 参数错误
len(1, 2)
// ERROR: wrong number of arguments. got=2, want=1

// 类型错误
len(5)
// ERROR: argument to 'len' not supported, got INTEGER
```

## A.5 示例集锦

### 变量和算术

```monkey
let x = 10;
let y = 15;
let result = x + y * 2;
result;  // 40
```

### 函数和闭包

```monkey
let newAdder = fn(x) {
  fn(y) { x + y };
};

let addTwo = newAdder(2);
addTwo(3);  // 5
```

### 递归

```monkey
let fibonacci = fn(n) {
  if (n < 2) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
};

fibonacci(10);  // 55
```

### 高阶函数

```monkey
let map = fn(arr, f) {
  let iter = fn(arr, accumulated) {
    if (len(arr) == 0) {
      return accumulated;
    }
    return iter(rest(arr), push(accumulated, f(first(arr))));
  };
  return iter(arr, []);
};

let double = fn(x) { x * 2 };
map([1, 2, 3, 4], double);  // [2, 4, 6, 8]
```

### 数据结构

```monkey
// 数组
let arr = [1, 2, 3, 4, 5];
first(arr);     // 1
last(arr);      // 5
rest(arr);      // [2, 3, 4, 5]

// 哈希表
let person = {
  "name": "Monkey",
  "age": 1,
  "hobbies": ["programming", "bananas"]
};

person["name"];         // "Monkey"
person["hobbies"][0];   // "programming"
```

### 条件和逻辑

```monkey
let max = fn(a, b) {
  if (a > b) {
    return a;
  } else {
    return b;
  }
};

max(10, 20);  // 20
```

### 字符串操作

```monkey
let greeting = "Hello";
let name = "World";
let message = greeting + ", " + name + "!";
message;  // "Hello, World!"

len(message);  // 13
```

## A.6 常见问题

### Q: Monkey 支持浮点数吗？

**A:** 不支持。Monkey 只支持整数。如果需要浮点数，需要修改词法分析器和求值器。

### Q: 为什么没有循环语句？

**A:** Monkey 鼓励使用递归而不是循环。大多数循环都可以用递归或高阶函数（如 `map`、`reduce`）替代。

### Q: 可以重新赋值变量吗？

**A:** 不可以。Monkey 中的变量一旦绑定就不能更改。但可以在函数内部创建同名变量来"遮蔽"外层变量。

```monkey
let x = 5;
let f = fn() {
  let x = 10;  // 新的变量，不影响外层的 x
  x;
};
f();  // 10
x;    // 5
```

### Q: Monkey 支持注释吗？

**A:** 当前实现不支持注释。如果需要，可以在词法分析器中添加对 `//` 或 `/* */` 的支持。

### Q: 如何实现 while 循环？

**A:** 使用递归：

```monkey
let whileLoop = fn(condition, body, state) {
  if (!condition(state)) {
    return state;
  }
  let newState = body(state);
  return whileLoop(condition, body, newState);
};

// 示例：计数到 10
let result = whileLoop(
  fn(x) { x < 10 },
  fn(x) { x + 1 },
  0
);
result;  // 10
```

### Q: 数组和哈希表是可变的吗？

**A:** 不是。所有内置函数（如 `push`、`rest`）都返回新的对象而不修改原对象。这遵循了函数式编程的不可变性原则。

### Q: 错误处理机制是什么？

**A:** Monkey 使用错误对象（`ErrorObject`）来表示错误。一旦产生错误，它会沿着求值链向上传播，直到返回给用户。

### Q: 支持类和面向对象编程吗？

**A:** Monkey 不支持类，但可以使用闭包和哈希表模拟面向对象：

```monkey
let newPerson = fn(name, age) {
  return {
    "getName": fn() { name },
    "getAge": fn() { age }
  };
};

let person = newPerson("Alice", 30);
person["getName"]();  // "Alice"
```

### Q: 如何调试 Monkey 程序？

**A:** 使用 `puts` 函数打印中间结果：

```monkey
let factorial = fn(n) {
  puts("factorial called with:", n);

  if (n == 0) {
    return 1;
  }

  let result = n * factorial(n - 1);
  puts("factorial(", n, ") =", result);

  return result;
};

factorial(5);
```

### Q: 性能如何？

**A:** Monkey 是一个教学用解释器，性能不是主要目标。它使用树遍历求值，没有字节码编译或 JIT 优化。对于学习目的来说足够快，但不适合生产环境。

### Q: 如何扩展 Monkey？

**A:** 主要扩展点：

1. **词法分析器**：添加新的 Token 类型
2. **解析器**：注册新的前缀/中缀解析函数
3. **AST**：定义新的节点类型
4. **对象系统**：添加新的对象类型
5. **求值器**：添加求值逻辑
6. **内置函数**：在 `builtins.ts` 中添加新函数

---

## 总结

本附录提供了 Monkey 语言和解释器实现的完整参考。

**核心特性：**

✅ 简洁的语法
✅ 一等函数和闭包
✅ 灵活的数据结构（数组、哈希表）
✅ 函数式编程风格
✅ 表达式优先的设计

**学习价值：**

- 理解编译器/解释器的工作原理
- 掌握递归下降解析和 Pratt 解析法
- 学习环境和闭包的实现
- 体验函数式编程思想

**进一步学习：**

- 实现字节码编译器
- 添加虚拟机
- 实现垃圾回收
- 添加类型系统
- 实现宏系统

---

**回到文档首页**：[README](./README.md)

**源代码**：[GitHub](https://github.com/your-username/monkey-ts)

**原书**：[Writing An Interpreter In Go](https://interpreterbook.com/)
