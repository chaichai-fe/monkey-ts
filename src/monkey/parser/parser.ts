/**
 * Parser模块（语法分析器）
 * 
 * 语法分析器负责将Token流转换为抽象语法树(AST)
 * 使用Pratt解析法（优先级爬升法）来解析表达式
 * 
 * 核心概念：
 * - 前缀解析函数(prefixParseFn)：解析前缀表达式，如 -5, !true
 * - 中缀解析函数(infixParseFn)：解析中缀表达式，如 5 + 3, a * b
 * - 运算符优先级：用于决定表达式的结合顺序
 */

import { Lexer } from "../lexer/lexer";
import * as token from "../token/token";
import * as ast from "../ast/ast";

/**
 * 运算符优先级常量
 * 数值越大，优先级越高
 */
const enum Precedence {
  LOWEST = 1,      // 最低优先级
  EQUALS,          // == 或 !=
  LESSGREATER,     // < 或 >
  SUM,             // + 或 -
  PRODUCT,         // * 或 /
  PREFIX,          // -X 或 !X
  CALL,            // myFunction(X)
  INDEX,           // array[index]
}

/**
 * Token类型到优先级的映射表
 * 用于确定运算符的优先级
 */
const precedences: Record<token.TokenType, Precedence> = {
  [token.EQ]: Precedence.EQUALS,
  [token.NOT_EQ]: Precedence.EQUALS,
  [token.LT]: Precedence.LESSGREATER,
  [token.GT]: Precedence.LESSGREATER,
  [token.PLUS]: Precedence.SUM,
  [token.MINUS]: Precedence.SUM,
  [token.SLASH]: Precedence.PRODUCT,
  [token.ASTERISK]: Precedence.PRODUCT,
  [token.LPAREN]: Precedence.CALL,
  [token.LBRACKET]: Precedence.INDEX,
};

/**
 * 前缀解析函数类型
 * 用于解析前缀位置的表达式
 */
type PrefixParseFn = () => ast.Expression | null;

/**
 * 中缀解析函数类型
 * 用于解析中缀位置的表达式，接收左侧表达式作为参数
 */
type InfixParseFn = (left: ast.Expression) => ast.Expression | null;

/**
 * Parser类
 * 
 * 语法分析器的核心类，负责将Token流转换为AST
 */
export class Parser {
  private lexer: Lexer;                                           // 词法分析器
  private errors: string[] = [];                                  // 解析错误列表
  
  private curToken: token.Token;                                  // 当前Token
  private peekToken: token.Token;                                 // 下一个Token（预读）
  
  private prefixParseFns: Map<token.TokenType, PrefixParseFn>;   // 前缀解析函数映射
  private infixParseFns: Map<token.TokenType, InfixParseFn>;     // 中缀解析函数映射

  /**
   * 构造函数
   * 
   * @param lexer - 词法分析器实例
   */
  constructor(lexer: Lexer) {
    this.lexer = lexer;
    
    // 初始化Token为空
    this.curToken = { Type: "", Literal: "" };
    this.peekToken = { Type: "", Literal: "" };
    
    // 初始化解析函数映射
    this.prefixParseFns = new Map();
    this.infixParseFns = new Map();
    
    // 注册前缀解析函数
    this.registerPrefix(token.IDENT, this.parseIdentifier.bind(this));
    this.registerPrefix(token.INT, this.parseIntegerLiteral.bind(this));
    this.registerPrefix(token.STRING, this.parseStringLiteral.bind(this));
    this.registerPrefix(token.BANG, this.parsePrefixExpression.bind(this));
    this.registerPrefix(token.MINUS, this.parsePrefixExpression.bind(this));
    this.registerPrefix(token.TRUE, this.parseBoolean.bind(this));
    this.registerPrefix(token.FALSE, this.parseBoolean.bind(this));
    this.registerPrefix(token.LPAREN, this.parseGroupedExpression.bind(this));
    this.registerPrefix(token.IF, this.parseIfExpression.bind(this));
    this.registerPrefix(token.FUNCTION, this.parseFunctionLiteral.bind(this));
    this.registerPrefix(token.LBRACKET, this.parseArrayLiteral.bind(this));
    this.registerPrefix(token.LBRACE, this.parseHashLiteral.bind(this));
    
    // 注册中缀解析函数
    this.registerInfix(token.PLUS, this.parseInfixExpression.bind(this));
    this.registerInfix(token.MINUS, this.parseInfixExpression.bind(this));
    this.registerInfix(token.SLASH, this.parseInfixExpression.bind(this));
    this.registerInfix(token.ASTERISK, this.parseInfixExpression.bind(this));
    this.registerInfix(token.EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(token.NOT_EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(token.LT, this.parseInfixExpression.bind(this));
    this.registerInfix(token.GT, this.parseInfixExpression.bind(this));
    this.registerInfix(token.LPAREN, this.parseCallExpression.bind(this));
    this.registerInfix(token.LBRACKET, this.parseIndexExpression.bind(this));
    
    // 读取两个Token，设置curToken和peekToken
    this.nextToken();
    this.nextToken();
  }

  /**
   * 获取所有解析错误
   */
  public getErrors(): string[] {
    return this.errors;
  }

  /**
   * 读取下一个Token
   * 将peekToken移动到curToken，从lexer读取新的peekToken
   */
  private nextToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  /**
   * 检查当前Token是否为指定类型
   */
  private curTokenIs(t: token.TokenType): boolean {
    return this.curToken.Type === t;
  }

  /**
   * 检查下一个Token是否为指定类型
   */
  private peekTokenIs(t: token.TokenType): boolean {
    return this.peekToken.Type === t;
  }

  /**
   * 期望下一个Token为指定类型
   * 如果是，则前进一个Token；否则记录错误
   */
  private expectPeek(t: token.TokenType): boolean {
    if (this.peekTokenIs(t)) {
      this.nextToken();
      return true;
    }
    this.peekError(t);
    return false;
  }

  /**
   * 记录期望Token类型不匹配的错误
   */
  private peekError(t: token.TokenType): void {
    const msg = `expected next token to be ${t}, got ${this.peekToken.Type} instead`;
    this.errors.push(msg);
  }

  /**
   * 记录没有找到前缀解析函数的错误
   */
  private noPrefixParseFnError(t: token.TokenType): void {
    const msg = `no prefix parse function for ${t} found`;
    this.errors.push(msg);
  }

  /**
   * 获取下一个Token的优先级
   */
  private peekPrecedence(): Precedence {
    const p = precedences[this.peekToken.Type];
    return p !== undefined ? p : Precedence.LOWEST;
  }

  /**
   * 获取当前Token的优先级
   */
  private curPrecedence(): Precedence {
    const p = precedences[this.curToken.Type];
    return p !== undefined ? p : Precedence.LOWEST;
  }

  /**
   * 注册前缀解析函数
   */
  private registerPrefix(tokenType: token.TokenType, fn: PrefixParseFn): void {
    this.prefixParseFns.set(tokenType, fn);
  }

  /**
   * 注册中缀解析函数
   */
  private registerInfix(tokenType: token.TokenType, fn: InfixParseFn): void {
    this.infixParseFns.set(tokenType, fn);
  }

  /**
   * 解析程序
   * 
   * 这是Parser的入口方法，解析整个程序并返回AST
   */
  public parseProgram(): ast.Program {
    const program = new ast.Program();
    program.statements = [];

    // 持续解析语句直到文件结束
    while (!this.curTokenIs(token.EOF)) {
      const stmt = this.parseStatement();
      if (stmt !== null) {
        program.statements.push(stmt);
      }
      this.nextToken();
    }

    return program;
  }

  /**
   * 解析语句
   * 
   * 根据当前Token类型决定解析哪种语句
   */
  private parseStatement(): ast.Statement | null {
    switch (this.curToken.Type) {
      case token.LET:
        return this.parseLetStatement();
      case token.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  /**
   * 解析let语句
   * 格式：let <identifier> = <expression>;
   */
  private parseLetStatement(): ast.LetStatement | null {
    const stmtToken = this.curToken;

    // 期望下一个Token是标识符
    if (!this.expectPeek(token.IDENT)) {
      return null;
    }

    const name = new ast.Identifier(this.curToken, this.curToken.Literal);

    // 期望下一个Token是赋值符号
    if (!this.expectPeek(token.ASSIGN)) {
      return null;
    }

    this.nextToken();

    // 解析赋值表达式
    const value = this.parseExpression(Precedence.LOWEST);
    if (!value) {
      return null;
    }

    // 可选的分号
    if (this.peekTokenIs(token.SEMICOLON)) {
      this.nextToken();
    }

    return new ast.LetStatement(stmtToken, name, value);
  }

  /**
   * 解析return语句
   * 格式：return <expression>;
   */
  private parseReturnStatement(): ast.ReturnStatement | null {
    const stmtToken = this.curToken;

    this.nextToken();

    // 解析返回值表达式
    const returnValue = this.parseExpression(Precedence.LOWEST);
    if (!returnValue) {
      return null;
    }

    // 可选的分号
    if (this.peekTokenIs(token.SEMICOLON)) {
      this.nextToken();
    }

    return new ast.ReturnStatement(stmtToken, returnValue);
  }

  /**
   * 解析表达式语句
   * 格式：<expression>;
   */
  private parseExpressionStatement(): ast.ExpressionStatement | null {
    const stmtToken = this.curToken;

    const expression = this.parseExpression(Precedence.LOWEST);
    if (!expression) {
      return null;
    }

    // 可选的分号
    if (this.peekTokenIs(token.SEMICOLON)) {
      this.nextToken();
    }

    return new ast.ExpressionStatement(stmtToken, expression);
  }

  /**
   * 解析代码块
   * 格式：{ <statement>* }
   */
  private parseBlockStatement(): ast.BlockStatement {
    const block = new ast.BlockStatement(this.curToken);
    block.statements = [];

    this.nextToken();

    // 持续解析语句直到遇到右花括号或文件结束
    while (!this.curTokenIs(token.RBRACE) && !this.curTokenIs(token.EOF)) {
      const stmt = this.parseStatement();
      if (stmt !== null) {
        block.statements.push(stmt);
      }
      this.nextToken();
    }

    return block;
  }

  /**
   * 解析表达式
   * 
   * 使用Pratt解析法，根据优先级解析表达式
   * 这是解析器的核心方法
   * 
   * @param precedence - 当前表达式的优先级
   */
  private parseExpression(precedence: Precedence): ast.Expression | null {
    // 查找前缀解析函数
    const prefix = this.prefixParseFns.get(this.curToken.Type);
    if (!prefix) {
      this.noPrefixParseFnError(this.curToken.Type);
      return null;
    }

    // 调用前缀解析函数
    let leftExp = prefix();
    if (!leftExp) {
      return null;
    }

    // 如果下一个运算符的优先级更高，继续解析
    while (
      !this.peekTokenIs(token.SEMICOLON) &&
      precedence < this.peekPrecedence()
    ) {
      const infix = this.infixParseFns.get(this.peekToken.Type);
      if (!infix) {
        return leftExp;
      }

      this.nextToken();

      leftExp = infix(leftExp);
      if (!leftExp) {
        return null;
      }
    }

    return leftExp;
  }

  // ==================== 前缀解析函数 ====================

  /**
   * 解析标识符
   */
  private parseIdentifier(): ast.Expression {
    return new ast.Identifier(this.curToken, this.curToken.Literal);
  }

  /**
   * 解析整数字面量
   */
  private parseIntegerLiteral(): ast.Expression | null {
    const value = parseInt(this.curToken.Literal, 10);
    if (isNaN(value)) {
      const msg = `could not parse ${this.curToken.Literal} as integer`;
      this.errors.push(msg);
      return null;
    }
    return new ast.IntegerLiteral(this.curToken, value);
  }

  /**
   * 解析字符串字面量
   */
  private parseStringLiteral(): ast.Expression {
    return new ast.StringLiteral(this.curToken, this.curToken.Literal);
  }

  /**
   * 解析布尔值
   */
  private parseBoolean(): ast.Expression {
    return new ast.BooleanLiteral(
      this.curToken,
      this.curTokenIs(token.TRUE)
    );
  }

  /**
   * 解析数组字面量
   * 格式：[<expression>, <expression>, ...]
   */
  private parseArrayLiteral(): ast.Expression | null {
    const array = new ast.ArrayLiteral(this.curToken);
    const elements = this.parseExpressionList(token.RBRACKET);
    if (elements === null) {
      return null;
    }
    array.elements = elements;
    return array;
  }

  /**
   * 解析哈希字面量
   * 格式：{<expression>: <expression>, ...}
   */
  private parseHashLiteral(): ast.Expression | null {
    const hash = new ast.HashLiteral(this.curToken);

    while (!this.peekTokenIs(token.RBRACE)) {
      this.nextToken();
      
      // 解析键
      const key = this.parseExpression(Precedence.LOWEST);
      if (!key) {
        return null;
      }

      // 期望冒号
      if (!this.expectPeek(token.COLON)) {
        return null;
      }

      this.nextToken();
      
      // 解析值
      const value = this.parseExpression(Precedence.LOWEST);
      if (!value) {
        return null;
      }

      hash.pairs.set(key, value);

      // 检查是否还有更多键值对
      if (!this.peekTokenIs(token.RBRACE) && !this.expectPeek(token.COMMA)) {
        return null;
      }
    }

    if (!this.expectPeek(token.RBRACE)) {
      return null;
    }

    return hash;
  }

  /**
   * 解析前缀表达式
   * 格式：<operator><expression>
   * 例如：-5, !true
   */
  private parsePrefixExpression(): ast.Expression | null {
    const exprToken = this.curToken;
    const operator = this.curToken.Literal;

    this.nextToken();

    const right = this.parseExpression(Precedence.PREFIX);
    if (!right) {
      return null;
    }

    return new ast.PrefixExpression(exprToken, operator, right);
  }

  /**
   * 解析分组表达式
   * 格式：(<expression>)
   */
  private parseGroupedExpression(): ast.Expression | null {
    this.nextToken();

    const exp = this.parseExpression(Precedence.LOWEST);

    if (!this.expectPeek(token.RPAREN)) {
      return null;
    }

    return exp;
  }

  /**
   * 解析if表达式
   * 格式：if (<condition>) { <consequence> } else { <alternative> }
   */
  private parseIfExpression(): ast.Expression | null {
    const exprToken = this.curToken;

    if (!this.expectPeek(token.LPAREN)) {
      return null;
    }

    this.nextToken();
    
    // 解析条件表达式
    const condition = this.parseExpression(Precedence.LOWEST);
    if (!condition) {
      return null;
    }

    if (!this.expectPeek(token.RPAREN)) {
      return null;
    }

    if (!this.expectPeek(token.LBRACE)) {
      return null;
    }

    // 解析consequence块
    const consequence = this.parseBlockStatement();

    let alternative: ast.BlockStatement | undefined;
    
    // 检查是否有else块
    if (this.peekTokenIs(token.ELSE)) {
      this.nextToken();

      if (!this.expectPeek(token.LBRACE)) {
        return null;
      }

      alternative = this.parseBlockStatement();
    }

    return new ast.IfExpression(exprToken, condition, consequence, alternative);
  }

  /**
   * 解析函数字面量
   * 格式：fn(<parameters>) { <body> }
   */
  private parseFunctionLiteral(): ast.Expression | null {
    const litToken = this.curToken;

    if (!this.expectPeek(token.LPAREN)) {
      return null;
    }

    // 解析参数列表
    const parameters = this.parseFunctionParameters();
    if (parameters === null) {
      return null;
    }

    if (!this.expectPeek(token.LBRACE)) {
      return null;
    }

    // 解析函数体
    const body = this.parseBlockStatement();

    const func = new ast.FunctionLiteral(litToken, body);
    func.parameters = parameters;
    return func;
  }

  /**
   * 解析函数参数列表
   * 格式：(<identifier>, <identifier>, ...)
   */
  private parseFunctionParameters(): ast.Identifier[] | null {
    const identifiers: ast.Identifier[] = [];

    // 空参数列表
    if (this.peekTokenIs(token.RPAREN)) {
      this.nextToken();
      return identifiers;
    }

    this.nextToken();

    // 第一个参数
    identifiers.push(new ast.Identifier(this.curToken, this.curToken.Literal));

    // 其余参数
    while (this.peekTokenIs(token.COMMA)) {
      this.nextToken();
      this.nextToken();
      identifiers.push(new ast.Identifier(this.curToken, this.curToken.Literal));
    }

    if (!this.expectPeek(token.RPAREN)) {
      return null;
    }

    return identifiers;
  }

  // ==================== 中缀解析函数 ====================

  /**
   * 解析中缀表达式
   * 格式：<expression> <operator> <expression>
   * 例如：5 + 3, x * y
   */
  private parseInfixExpression(left: ast.Expression): ast.Expression | null {
    const exprToken = this.curToken;
    const operator = this.curToken.Literal;

    const precedence = this.curPrecedence();
    this.nextToken();
    
    const right = this.parseExpression(precedence);
    if (!right) {
      return null;
    }

    return new ast.InfixExpression(exprToken, left, operator, right);
  }

  /**
   * 解析函数调用表达式
   * 格式：<expression>(<arguments>)
   */
  private parseCallExpression(func: ast.Expression): ast.Expression | null {
    const exp = new ast.CallExpression(this.curToken, func);
    const args = this.parseExpressionList(token.RPAREN);
    if (args === null) {
      return null;
    }
    exp.args = args;
    return exp;
  }

  /**
   * 解析索引表达式
   * 格式：<expression>[<expression>]
   */
  private parseIndexExpression(left: ast.Expression): ast.Expression | null {
    const exprToken = this.curToken;

    this.nextToken();
    
    const index = this.parseExpression(Precedence.LOWEST);
    if (!index) {
      return null;
    }

    if (!this.expectPeek(token.RBRACKET)) {
      return null;
    }

    return new ast.IndexExpression(exprToken, left, index);
  }

  /**
   * 解析表达式列表
   * 用于解析函数参数或数组元素
   * 
   * @param end - 结束Token类型
   */
  private parseExpressionList(end: token.TokenType): ast.Expression[] | null {
    const list: ast.Expression[] = [];

    // 空列表
    if (this.peekTokenIs(end)) {
      this.nextToken();
      return list;
    }

    this.nextToken();
    
    // 第一个表达式
    const firstExpr = this.parseExpression(Precedence.LOWEST);
    if (!firstExpr) {
      return null;
    }
    list.push(firstExpr);

    // 其余表达式
    while (this.peekTokenIs(token.COMMA)) {
      this.nextToken();
      this.nextToken();
      const expr = this.parseExpression(Precedence.LOWEST);
      if (!expr) {
        return null;
      }
      list.push(expr);
    }

    if (!this.expectPeek(end)) {
      return null;
    }

    return list;
  }
}

