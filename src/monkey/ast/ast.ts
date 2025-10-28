/**
 * AST（抽象语法树）模块
 * 
 * 该模块定义了Monkey语言的抽象语法树节点类型
 * AST是Parser（语法分析器）的输出，用于表示程序的结构化形式
 * 
 * AST的层次结构：
 * - Node（节点）：所有AST节点的基础接口
 *   - Statement（语句）：不返回值的程序结构
 *   - Expression（表达式）：会产生值的程序结构
 */

import * as token from "../token/token";

/**
 * Node接口
 * 
 * 所有AST节点都必须实现此接口
 * 提供获取Token字面量和字符串表示的方法
 */
export interface Node {
  /**
   * 返回与该节点关联的Token的字面量值
   * 主要用于调试和错误信息
   */
  tokenLiteral(): string;
  
  /**
   * 返回该节点的字符串表示
   * 用于打印和调试AST
   */
  toString(): string;
}

/**
 * Statement接口
 * 
 * 所有语句节点都实现此接口
 * 语句是执行某些操作但不产生值的程序结构
 * 例如：let语句、return语句
 */
export interface Statement extends Node {
  statementNode(): void;  // 标记方法，用于类型区分
}

/**
 * Expression接口
 * 
 * 所有表达式节点都实现此接口
 * 表达式会计算并产生一个值
 * 例如：字面量、算术表达式、函数调用
 */
export interface Expression extends Node {
  expressionNode(): void;  // 标记方法，用于类型区分
}

/**
 * Program类
 * 
 * AST的根节点，表示整个程序
 * 一个程序由多个语句组成
 */
export class Program implements Node {
  statements: Statement[] = [];

  /**
   * 获取程序的Token字面量
   * 返回第一个语句的Token字面量，如果没有语句则返回空字符串
   */
  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    }
    return "";
  }

  /**
   * 将程序转换为字符串
   * 依次连接所有语句的字符串表示
   */
  toString(): string {
    let out = "";
    for (const stmt of this.statements) {
      out += stmt.toString();
    }
    return out;
  }
}

// ==================== 语句节点 ====================

/**
 * LetStatement类
 * 
 * 表示变量声明语句：let <identifier> = <expression>;
 * 例如：let x = 5;
 */
export class LetStatement implements Statement {
  token: token.Token;        // LET token
  name: Identifier;          // 变量名
  value: Expression;         // 变量值表达式

  constructor(token: token.Token, name: Identifier, value: Expression) {
    this.token = token;
    this.name = name;
    this.value = value;
  }

  statementNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    let out = this.tokenLiteral() + " ";
    out += this.name.toString();
    out += " = ";
    if (this.value) {
      out += this.value.toString();
    }
    out += ";";
    return out;
  }
}

/**
 * ReturnStatement类
 * 
 * 表示返回语句：return <expression>;
 * 例如：return 5;
 */
export class ReturnStatement implements Statement {
  token: token.Token;           // RETURN token
  returnValue: Expression;      // 返回值表达式

  constructor(token: token.Token, returnValue: Expression) {
    this.token = token;
    this.returnValue = returnValue;
  }

  statementNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    let out = this.tokenLiteral() + " ";
    if (this.returnValue) {
      out += this.returnValue.toString();
    }
    out += ";";
    return out;
  }
}

/**
 * ExpressionStatement类
 * 
 * 表示表达式语句，即一个表达式单独作为语句
 * 例如：x + 10;
 */
export class ExpressionStatement implements Statement {
  token: token.Token;        // 表达式的第一个token
  expression: Expression;    // 表达式

  constructor(token: token.Token, expression: Expression) {
    this.token = token;
    this.expression = expression;
  }

  statementNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    if (this.expression) {
      return this.expression.toString();
    }
    return "";
  }
}

/**
 * BlockStatement类
 * 
 * 表示代码块，由多个语句组成，用花括号包围
 * 例如：{ let x = 5; return x; }
 */
export class BlockStatement implements Statement {
  token: token.Token;           // { token
  statements: Statement[] = []; // 代码块中的语句列表

  constructor(token: token.Token) {
    this.token = token;
  }

  statementNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    let out = "";
    for (const stmt of this.statements) {
      out += stmt.toString();
    }
    return out;
  }
}

// ==================== 表达式节点 ====================

/**
 * Identifier类
 * 
 * 表示标识符（变量名、函数名等）
 * 例如：x, add, foobar
 */
export class Identifier implements Expression {
  token: token.Token;  // IDENT token
  value: string;       // 标识符名称

  constructor(token: token.Token, value: string) {
    this.token = token;
    this.value = value;
  }

  expressionNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    return this.value;
  }
}

/**
 * IntegerLiteral类
 * 
 * 表示整数字面量
 * 例如：5, 42, 100
 */
export class IntegerLiteral implements Expression {
  token: token.Token;  // INT token
  value: number;       // 整数值

  constructor(token: token.Token, value: number) {
    this.token = token;
    this.value = value;
  }

  expressionNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    return this.token.Literal;
  }
}

/**
 * StringLiteral类
 * 
 * 表示字符串字面量
 * 例如："hello", "world"
 */
export class StringLiteral implements Expression {
  token: token.Token;  // STRING token
  value: string;       // 字符串值

  constructor(token: token.Token, value: string) {
    this.token = token;
    this.value = value;
  }

  expressionNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    return this.token.Literal;
  }
}

/**
 * BooleanLiteral类
 * 
 * 表示布尔值字面量
 * 例如：true, false
 */
export class BooleanLiteral implements Expression {
  token: token.Token;  // TRUE 或 FALSE token
  value: boolean;      // 布尔值

  constructor(token: token.Token, value: boolean) {
    this.token = token;
    this.value = value;
  }

  expressionNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    return this.token.Literal;
  }
}

/**
 * ArrayLiteral类
 * 
 * 表示数组字面量
 * 例如：[1, 2, 3], [x, y, z]
 */
export class ArrayLiteral implements Expression {
  token: token.Token;           // [ token
  elements: Expression[] = [];  // 数组元素表达式列表

  constructor(token: token.Token) {
    this.token = token;
  }

  expressionNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    const elements = this.elements.map((el) => el.toString());
    return "[" + elements.join(", ") + "]";
  }
}

/**
 * HashLiteral类
 * 
 * 表示哈希表（字典）字面量
 * 例如：{"name": "Monkey", "age": 1}
 */
export class HashLiteral implements Expression {
  token: token.Token;                              // { token
  pairs: Map<Expression, Expression> = new Map();  // 键值对映射

  constructor(token: token.Token) {
    this.token = token;
  }

  expressionNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    const pairs: string[] = [];
    this.pairs.forEach((value, key) => {
      pairs.push(key.toString() + ":" + value.toString());
    });
    return "{" + pairs.join(", ") + "}";
  }
}

/**
 * PrefixExpression类
 * 
 * 表示前缀表达式（一元运算）
 * 例如：-5, !true
 */
export class PrefixExpression implements Expression {
  token: token.Token;     // 前缀运算符token（如!或-）
  operator: string;       // 运算符字符串
  right: Expression;      // 右侧表达式

  constructor(token: token.Token, operator: string, right: Expression) {
    this.token = token;
    this.operator = operator;
    this.right = right;
  }

  expressionNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    return "(" + this.operator + this.right.toString() + ")";
  }
}

/**
 * InfixExpression类
 * 
 * 表示中缀表达式（二元运算）
 * 例如：5 + 5, x * y, a == b
 */
export class InfixExpression implements Expression {
  token: token.Token;     // 运算符token
  left: Expression;       // 左侧表达式
  operator: string;       // 运算符字符串
  right: Expression;      // 右侧表达式

  constructor(
    token: token.Token,
    left: Expression,
    operator: string,
    right: Expression
  ) {
    this.token = token;
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  expressionNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    return (
      "(" +
      this.left.toString() +
      " " +
      this.operator +
      " " +
      this.right.toString() +
      ")"
    );
  }
}

/**
 * IfExpression类
 * 
 * 表示条件表达式
 * 例如：if (x > 5) { return true; } else { return false; }
 */
export class IfExpression implements Expression {
  token: token.Token;              // IF token
  condition: Expression;           // 条件表达式
  consequence: BlockStatement;     // 条件为真时执行的代码块
  alternative?: BlockStatement;    // 可选的else代码块

  constructor(
    token: token.Token,
    condition: Expression,
    consequence: BlockStatement,
    alternative?: BlockStatement
  ) {
    this.token = token;
    this.condition = condition;
    this.consequence = consequence;
    this.alternative = alternative;
  }

  expressionNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    let out = "if" + this.condition.toString() + " ";
    out += this.consequence.toString();
    if (this.alternative) {
      out += "else " + this.alternative.toString();
    }
    return out;
  }
}

/**
 * FunctionLiteral类
 * 
 * 表示函数字面量（函数定义）
 * 例如：fn(x, y) { return x + y; }
 */
export class FunctionLiteral implements Expression {
  token: token.Token;              // FN token
  parameters: Identifier[] = [];   // 参数列表
  body: BlockStatement;            // 函数体

  constructor(token: token.Token, body: BlockStatement) {
    this.token = token;
    this.body = body;
  }

  expressionNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    const params = this.parameters.map((p) => p.toString());
    let out = this.tokenLiteral();
    out += "(";
    out += params.join(", ");
    out += ") ";
    out += this.body.toString();
    return out;
  }
}

/**
 * CallExpression类
 * 
 * 表示函数调用表达式
 * 例如：add(2, 3), myFunction(x, y, z)
 */
export class CallExpression implements Expression {
  token: token.Token;            // ( token
  func: Expression;              // 函数标识符或函数字面量
  args: Expression[] = [];       // 参数表达式列表

  constructor(token: token.Token, func: Expression) {
    this.token = token;
    this.func = func;
  }

  expressionNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    const args = this.args.map((a) => a.toString());
    let out = this.func.toString();
    out += "(";
    out += args.join(", ");
    out += ")";
    return out;
  }
}

/**
 * IndexExpression类
 * 
 * 表示索引访问表达式
 * 例如：array[0], hash["key"]
 */
export class IndexExpression implements Expression {
  token: token.Token;     // [ token
  left: Expression;       // 被索引的表达式（数组或哈希表）
  index: Expression;      // 索引表达式

  constructor(token: token.Token, left: Expression, index: Expression) {
    this.token = token;
    this.left = left;
    this.index = index;
  }

  expressionNode(): void {}
  
  tokenLiteral(): string {
    return this.token.Literal;
  }

  toString(): string {
    return (
      "(" + this.left.toString() + "[" + this.index.toString() + "])"
    );
  }
}

