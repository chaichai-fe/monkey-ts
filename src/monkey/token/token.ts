/**
 * Token模块
 * 
 * 该模块定义了Monkey语言中的所有词法单元(Token)类型
 * Token是词法分析器(Lexer)输出的基本单位，代表源代码中有意义的最小单元
 */

/**
 * TokenType类型
 * 使用字符串字面量类型来定义所有可能的Token类型
 */
export type TokenType = string;

/**
 * Token类型常量定义
 * 这些常量代表了Monkey语言中所有可能的词法单元类型
 */

// 特殊类型
export const ILLEGAL = "ILLEGAL";  // 非法字符，用于表示词法分析器无法识别的字符
export const EOF = "EOF";          // 文件结束标记，表示源代码的末尾

// 标识符和字面量
export const IDENT = "IDENT";      // 标识符，如变量名：add, foobar, x, y 等
export const INT = "INT";          // 整数字面量，如：1343456
export const STRING = "STRING";    // 字符串字面量，如："foobar"

// 运算符
export const ASSIGN = "=";         // 赋值运算符
export const PLUS = "+";           // 加法运算符
export const MINUS = "-";          // 减法运算符或负号
export const BANG = "!";           // 逻辑非运算符
export const ASTERISK = "*";       // 乘法运算符
export const SLASH = "/";          // 除法运算符

export const LT = "<";             // 小于运算符
export const GT = ">";             // 大于运算符

export const EQ = "==";            // 相等比较运算符
export const NOT_EQ = "!=";        // 不等比较运算符

// 分隔符
export const COMMA = ",";          // 逗号，用于分隔参数或数组元素
export const SEMICOLON = ";";      // 分号，用于语句结束标记
export const COLON = ":";          // 冒号，用于哈希表键值对

export const LPAREN = "(";         // 左圆括号，用于函数调用或分组表达式
export const RPAREN = ")";         // 右圆括号
export const LBRACE = "{";         // 左花括号，用于代码块或哈希表
export const RBRACE = "}";         // 右花括号
export const LBRACKET = "[";       // 左方括号，用于数组字面量或索引访问
export const RBRACKET = "]";       // 右方括号

// 关键字
export const FUNCTION = "FUNCTION"; // 函数定义关键字 fn
export const LET = "LET";          // 变量声明关键字 let
export const TRUE = "TRUE";        // 布尔值 true
export const FALSE = "FALSE";      // 布尔值 false
export const IF = "IF";            // 条件语句关键字 if
export const ELSE = "ELSE";        // 条件语句关键字 else
export const RETURN = "RETURN";    // 返回语句关键字 return

/**
 * Token接口
 * 表示一个词法单元，包含类型和字面量值
 */
export interface Token {
  Type: TokenType;    // Token的类型，如IDENT、INT、PLUS等
  Literal: string;    // Token的字面量值，即源代码中的原始字符串
}

/**
 * 关键字映射表
 * 将Monkey语言的关键字字符串映射到对应的TokenType
 * 用于区分标识符和关键字
 */
const keywords: Record<string, TokenType> = {
  "fn": FUNCTION,      // 函数定义
  "let": LET,          // 变量声明
  "true": TRUE,        // 布尔真值
  "false": FALSE,      // 布尔假值
  "if": IF,            // 条件判断
  "else": ELSE,        // 条件分支
  "return": RETURN,    // 返回语句
};

/**
 * 查找标识符的类型
 * 
 * 该函数用于判断一个标识符是关键字还是普通的用户定义标识符
 * 
 * @param ident - 要查找的标识符字符串
 * @returns 如果是关键字，返回对应的关键字TokenType；否则返回IDENT
 * 
 * @example
 * ```typescript
 * lookupIdent("let")    // 返回 "LET"
 * lookupIdent("fn")     // 返回 "FUNCTION"
 * lookupIdent("myVar")  // 返回 "IDENT"
 * ```
 */
export function lookupIdent(ident: string): TokenType {
  // 尝试在关键字表中查找
  const tokenType = keywords[ident];
  
  // 如果找到了关键字，返回关键字类型；否则返回普通标识符类型
  if (tokenType !== undefined) {
    return tokenType;
  }
  
  return IDENT;
}

