/**
 * Lexer模块（词法分析器）
 * 
 * 词法分析器负责将源代码字符串转换为Token流
 * 它逐字符扫描输入，识别出各种词法单元（标识符、数字、运算符等）
 */

import * as token from "../token/token";

/**
 * Lexer类
 * 
 * 词法分析器的核心类，维护了扫描源代码所需的状态信息
 */
export class Lexer {
  private input: string;        // 输入的源代码字符串
  private position: number;     // 当前字符在输入中的位置（指向当前字符）
  private readPosition: number; // 下一个字符的位置（指向当前字符之后的字符）
  private ch: string;           // 当前正在检查的字符

  /**
   * 构造函数
   * 
   * @param input - 要进行词法分析的源代码字符串
   */
  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.readPosition = 0;
    this.ch = "";
    
    // 初始化时读取第一个字符
    this.readChar();
  }

  /**
   * 读取下一个字符
   * 
   * 该方法会移动position和readPosition指针，并更新ch为下一个字符
   * 如果已经到达输入的末尾，ch会被设置为空字符串（表示EOF）
   */
  private readChar(): void {
    // 检查是否已经读取到输入末尾
    if (this.readPosition >= this.input.length) {
      this.ch = "";  // 用空字符串表示EOF
    } else {
      this.ch = this.input[this.readPosition];  // 读取下一个字符
    }
    
    // 更新位置指针
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  /**
   * 查看下一个字符但不移动指针
   * 
   * 用于预读(lookahead)，判断多字符运算符（如==、!=）
   * 
   * @returns 下一个字符，如果已到末尾则返回空字符串
   */
  private peekChar(): string {
    if (this.readPosition >= this.input.length) {
      return "";
    }
    return this.input[this.readPosition];
  }

  /**
   * 跳过空白字符
   * 
   * 持续读取字符直到遇到非空白字符
   * 空白字符包括：空格、制表符、换行符、回车符
   */
  private skipWhitespace(): void {
    while (
      this.ch === " " ||
      this.ch === "\t" ||
      this.ch === "\n" ||
      this.ch === "\r"
    ) {
      this.readChar();
    }
  }

  /**
   * 读取标识符
   * 
   * 从当前位置开始读取连续的字母或下划线，直到遇到非标识符字符
   * 
   * @returns 读取到的标识符字符串
   */
  private readIdentifier(): string {
    const startPosition = this.position;
    
    // 持续读取字母或下划线
    while (isLetter(this.ch)) {
      this.readChar();
    }
    
    // 返回从起始位置到当前位置的子字符串
    return this.input.slice(startPosition, this.position);
  }

  /**
   * 读取数字
   * 
   * 从当前位置开始读取连续的数字字符
   * 
   * @returns 读取到的数字字符串
   */
  private readNumber(): string {
    const startPosition = this.position;
    
    // 持续读取数字字符
    while (isDigit(this.ch)) {
      this.readChar();
    }
    
    // 返回从起始位置到当前位置的子字符串
    return this.input.slice(startPosition, this.position);
  }

  /**
   * 读取字符串字面量
   * 
   * 读取双引号之间的所有字符（不包括引号本身）
   * 
   * @returns 字符串内容（不包括引号）
   */
  private readString(): string {
    // 跳过开始的引号，从下一个字符开始
    const startPosition = this.position + 1;
    
    // 读取字符直到遇到结束引号或文件末尾
    while (true) {
      this.readChar();
      if (this.ch === '"' || this.ch === "") {
        break;
      }
    }
    
    // 返回引号之间的内容
    return this.input.slice(startPosition, this.position);
  }

  /**
   * 获取下一个Token
   * 
   * 这是Lexer的核心方法，负责识别并返回下一个词法单元
   * 该方法会跳过空白字符，然后根据当前字符决定Token的类型
   * 
   * @returns 识别出的Token对象
   */
  public nextToken(): token.Token {
    let tok: token.Token;

    // 跳过所有空白字符
    this.skipWhitespace();

    // 根据当前字符判断Token类型
    switch (this.ch) {
      // 赋值运算符或相等比较运算符
      case "=":
        // 预读下一个字符，判断是 = 还是 ==
        if (this.peekChar() === "=") {
          const ch = this.ch;
          this.readChar();
          tok = { Type: token.EQ, Literal: ch + this.ch };
        } else {
          tok = newToken(token.ASSIGN, this.ch);
        }
        break;

      // 加法运算符
      case "+":
        tok = newToken(token.PLUS, this.ch);
        break;

      // 减法运算符
      case "-":
        tok = newToken(token.MINUS, this.ch);
        break;

      // 逻辑非运算符或不等比较运算符
      case "!":
        // 预读下一个字符，判断是 ! 还是 !=
        if (this.peekChar() === "=") {
          const ch = this.ch;
          this.readChar();
          tok = { Type: token.NOT_EQ, Literal: ch + this.ch };
        } else {
          tok = newToken(token.BANG, this.ch);
        }
        break;

      // 除法运算符
      case "/":
        tok = newToken(token.SLASH, this.ch);
        break;

      // 乘法运算符
      case "*":
        tok = newToken(token.ASTERISK, this.ch);
        break;

      // 小于运算符
      case "<":
        tok = newToken(token.LT, this.ch);
        break;

      // 大于运算符
      case ">":
        tok = newToken(token.GT, this.ch);
        break;

      // 分号
      case ";":
        tok = newToken(token.SEMICOLON, this.ch);
        break;

      // 冒号（用于哈希表）
      case ":":
        tok = newToken(token.COLON, this.ch);
        break;

      // 逗号
      case ",":
        tok = newToken(token.COMMA, this.ch);
        break;

      // 左花括号
      case "{":
        tok = newToken(token.LBRACE, this.ch);
        break;

      // 右花括号
      case "}":
        tok = newToken(token.RBRACE, this.ch);
        break;

      // 左圆括号
      case "(":
        tok = newToken(token.LPAREN, this.ch);
        break;

      // 右圆括号
      case ")":
        tok = newToken(token.RPAREN, this.ch);
        break;

      // 字符串字面量
      case '"':
        tok = {
          Type: token.STRING,
          Literal: this.readString(),
        };
        break;

      // 左方括号
      case "[":
        tok = newToken(token.LBRACKET, this.ch);
        break;

      // 右方括号
      case "]":
        tok = newToken(token.RBRACKET, this.ch);
        break;

      // 文件结束
      case "":
        tok = { Type: token.EOF, Literal: "" };
        break;

      // 默认情况：标识符、数字或非法字符
      default:
        if (isLetter(this.ch)) {
          // 读取标识符
          const literal = this.readIdentifier();
          // 查找是关键字还是普通标识符
          const tokenType = token.lookupIdent(literal);
          // 注意：这里直接返回，不需要调用readChar()，因为readIdentifier已经移动了指针
          return { Type: tokenType, Literal: literal };
        } else if (isDigit(this.ch)) {
          // 读取数字
          // 注意：这里直接返回，不需要调用readChar()，因为readNumber已经移动了指针
          return { Type: token.INT, Literal: this.readNumber() };
        } else {
          // 无法识别的字符
          tok = newToken(token.ILLEGAL, this.ch);
        }
    }

    // 移动到下一个字符
    this.readChar();
    return tok;
  }
}

/**
 * 创建一个新的Token
 * 
 * 辅助函数，用于创建单字符Token
 * 
 * @param tokenType - Token的类型
 * @param ch - 字符
 * @returns Token对象
 */
function newToken(tokenType: token.TokenType, ch: string): token.Token {
  return { Type: tokenType, Literal: ch };
}

/**
 * 判断字符是否为字母或下划线
 * 
 * 在Monkey语言中，标识符可以由字母（大小写）和下划线组成
 * 
 * @param ch - 要判断的字符
 * @returns 如果是字母或下划线返回true，否则返回false
 */
function isLetter(ch: string): boolean {
  return (
    ("a" <= ch && ch <= "z") ||
    ("A" <= ch && ch <= "Z") ||
    ch === "_"
  );
}

/**
 * 判断字符是否为数字
 * 
 * @param ch - 要判断的字符
 * @returns 如果是数字字符（0-9）返回true，否则返回false
 */
function isDigit(ch: string): boolean {
  return "0" <= ch && ch <= "9";
}

