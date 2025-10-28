/**
 * Parser模块的单元测试
 * 
 * 测试语法分析器是否能正确解析各种语法结构
 */

import { describe, it, expect } from "vitest";
import { Lexer } from "../lexer/lexer";
import { Parser } from "./parser";
import * as ast from "../ast/ast";

describe("Parser", () => {
  /**
   * 辅助函数：检查解析错误
   */
  function checkParserErrors(parser: Parser): void {
    const errors = parser.getErrors();
    if (errors.length === 0) {
      return;
    }

    console.error(`parser has ${errors.length} errors`);
    for (const error of errors) {
      console.error(`parser error: ${error}`);
    }
    
    throw new Error(`Parser has ${errors.length} errors`);
  }

  it("应该正确解析let语句", () => {
    const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`;

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);

    expect(program.statements.length).toBe(3);

    const expectedIdentifiers = ["x", "y", "foobar"];

    for (let i = 0; i < expectedIdentifiers.length; i++) {
      const stmt = program.statements[i];
      expect(stmt).toBeInstanceOf(ast.LetStatement);
      
      const letStmt = stmt as ast.LetStatement;
      expect(letStmt.tokenLiteral()).toBe("let");
      expect(letStmt.name.value).toBe(expectedIdentifiers[i]);
    }
  });

  it("应该正确解析return语句", () => {
    const input = `
return 5;
return 10;
return 993322;
`;

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);

    expect(program.statements.length).toBe(3);

    for (const stmt of program.statements) {
      expect(stmt).toBeInstanceOf(ast.ReturnStatement);
      expect(stmt.tokenLiteral()).toBe("return");
    }
  });

  it("应该正确解析标识符表达式", () => {
    const input = "foobar;";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);

    expect(program.statements.length).toBe(1);
    
    const stmt = program.statements[0] as ast.ExpressionStatement;
    expect(stmt).toBeInstanceOf(ast.ExpressionStatement);
    
    const ident = stmt.expression as ast.Identifier;
    expect(ident).toBeInstanceOf(ast.Identifier);
    expect(ident.value).toBe("foobar");
    expect(ident.tokenLiteral()).toBe("foobar");
  });

  it("应该正确解析整数字面量", () => {
    const input = "5;";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);

    expect(program.statements.length).toBe(1);
    
    const stmt = program.statements[0] as ast.ExpressionStatement;
    const literal = stmt.expression as ast.IntegerLiteral;
    expect(literal).toBeInstanceOf(ast.IntegerLiteral);
    expect(literal.value).toBe(5);
    expect(literal.tokenLiteral()).toBe("5");
  });

  it("应该正确解析前缀表达式", () => {
    const tests = [
      { input: "!5;", operator: "!", value: 5 },
      { input: "-15;", operator: "-", value: 15 },
    ];

    for (const test of tests) {
      const lexer = new Lexer(test.input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();
      
      checkParserErrors(parser);

      expect(program.statements.length).toBe(1);
      
      const stmt = program.statements[0] as ast.ExpressionStatement;
      const exp = stmt.expression as ast.PrefixExpression;
      
      expect(exp).toBeInstanceOf(ast.PrefixExpression);
      expect(exp.operator).toBe(test.operator);
      
      const right = exp.right as ast.IntegerLiteral;
      expect(right.value).toBe(test.value);
    }
  });

  it("应该正确解析中缀表达式", () => {
    const tests = [
      { input: "5 + 5;", leftValue: 5, operator: "+", rightValue: 5 },
      { input: "5 - 5;", leftValue: 5, operator: "-", rightValue: 5 },
      { input: "5 * 5;", leftValue: 5, operator: "*", rightValue: 5 },
      { input: "5 / 5;", leftValue: 5, operator: "/", rightValue: 5 },
      { input: "5 > 5;", leftValue: 5, operator: ">", rightValue: 5 },
      { input: "5 < 5;", leftValue: 5, operator: "<", rightValue: 5 },
      { input: "5 == 5;", leftValue: 5, operator: "==", rightValue: 5 },
      { input: "5 != 5;", leftValue: 5, operator: "!=", rightValue: 5 },
    ];

    for (const test of tests) {
      const lexer = new Lexer(test.input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();
      
      checkParserErrors(parser);

      expect(program.statements.length).toBe(1);
      
      const stmt = program.statements[0] as ast.ExpressionStatement;
      const exp = stmt.expression as ast.InfixExpression;
      
      expect(exp).toBeInstanceOf(ast.InfixExpression);
      
      const left = exp.left as ast.IntegerLiteral;
      expect(left.value).toBe(test.leftValue);
      
      expect(exp.operator).toBe(test.operator);
      
      const right = exp.right as ast.IntegerLiteral;
      expect(right.value).toBe(test.rightValue);
    }
  });

  it("应该正确处理运算符优先级", () => {
    const tests = [
      { input: "-a * b", expected: "((-a) * b)" },
      { input: "!-a", expected: "(!(-a))" },
      { input: "a + b + c", expected: "((a + b) + c)" },
      { input: "a + b - c", expected: "((a + b) - c)" },
      { input: "a * b * c", expected: "((a * b) * c)" },
      { input: "a * b / c", expected: "((a * b) / c)" },
      { input: "a + b / c", expected: "(a + (b / c))" },
      { input: "a + b * c + d / e - f", expected: "(((a + (b * c)) + (d / e)) - f)" },
      { input: "3 + 4; -5 * 5", expected: "(3 + 4)((-5) * 5)" },
      { input: "5 > 4 == 3 < 4", expected: "((5 > 4) == (3 < 4))" },
      { input: "5 < 4 != 3 > 4", expected: "((5 < 4) != (3 > 4))" },
      {
        input: "3 + 4 * 5 == 3 * 1 + 4 * 5",
        expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
      },
    ];

    for (const test of tests) {
      const lexer = new Lexer(test.input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();
      
      checkParserErrors(parser);

      const actual = program.toString();
      expect(actual).toBe(test.expected);
    }
  });

  it("应该正确解析布尔值", () => {
    const tests = [
      { input: "true;", expected: true },
      { input: "false;", expected: false },
    ];

    for (const test of tests) {
      const lexer = new Lexer(test.input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();
      
      checkParserErrors(parser);

      expect(program.statements.length).toBe(1);
      
      const stmt = program.statements[0] as ast.ExpressionStatement;
      const boolean = stmt.expression as ast.BooleanLiteral;
      
      expect(boolean).toBeInstanceOf(ast.BooleanLiteral);
      expect(boolean.value).toBe(test.expected);
    }
  });

  it("应该正确解析if表达式", () => {
    const input = "if (x < y) { x }";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);

    expect(program.statements.length).toBe(1);
    
    const stmt = program.statements[0] as ast.ExpressionStatement;
    const exp = stmt.expression as ast.IfExpression;
    
    expect(exp).toBeInstanceOf(ast.IfExpression);
    
    // 检查条件
    const condition = exp.condition as ast.InfixExpression;
    expect(condition).toBeInstanceOf(ast.InfixExpression);
    expect((condition.left as ast.Identifier).value).toBe("x");
    expect(condition.operator).toBe("<");
    expect((condition.right as ast.Identifier).value).toBe("y");
    
    // 检查consequence
    expect(exp.consequence.statements.length).toBe(1);
  });

  it("应该正确解析函数字面量", () => {
    const input = "fn(x, y) { x + y; }";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);

    expect(program.statements.length).toBe(1);
    
    const stmt = program.statements[0] as ast.ExpressionStatement;
    const func = stmt.expression as ast.FunctionLiteral;
    
    expect(func).toBeInstanceOf(ast.FunctionLiteral);
    
    // 检查参数
    expect(func.parameters.length).toBe(2);
    expect(func.parameters[0].value).toBe("x");
    expect(func.parameters[1].value).toBe("y");
    
    // 检查函数体
    expect(func.body.statements.length).toBe(1);
  });

  it("应该正确解析函数调用表达式", () => {
    const input = "add(1, 2 * 3, 4 + 5);";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);

    expect(program.statements.length).toBe(1);
    
    const stmt = program.statements[0] as ast.ExpressionStatement;
    const exp = stmt.expression as ast.CallExpression;
    
    expect(exp).toBeInstanceOf(ast.CallExpression);
    
    // 检查函数名
    const func = exp.func as ast.Identifier;
    expect(func.value).toBe("add");
    
    // 检查参数
    expect(exp.args.length).toBe(3);
  });

  it("应该正确解析字符串字面量", () => {
    const input = '"hello world";';

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);

    const stmt = program.statements[0] as ast.ExpressionStatement;
    const literal = stmt.expression as ast.StringLiteral;
    
    expect(literal).toBeInstanceOf(ast.StringLiteral);
    expect(literal.value).toBe("hello world");
  });

  it("应该正确解析数组字面量", () => {
    const input = "[1, 2 * 2, 3 + 3]";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);

    const stmt = program.statements[0] as ast.ExpressionStatement;
    const array = stmt.expression as ast.ArrayLiteral;
    
    expect(array).toBeInstanceOf(ast.ArrayLiteral);
    expect(array.elements.length).toBe(3);
  });

  it("应该正确解析索引表达式", () => {
    const input = "myArray[1 + 1]";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);

    const stmt = program.statements[0] as ast.ExpressionStatement;
    const indexExp = stmt.expression as ast.IndexExpression;
    
    expect(indexExp).toBeInstanceOf(ast.IndexExpression);
    
    const left = indexExp.left as ast.Identifier;
    expect(left.value).toBe("myArray");
  });

  it("应该正确解析哈希字面量", () => {
    const input = '{"one": 1, "two": 2, "three": 3}';

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);

    const stmt = program.statements[0] as ast.ExpressionStatement;
    const hash = stmt.expression as ast.HashLiteral;
    
    expect(hash).toBeInstanceOf(ast.HashLiteral);
    expect(hash.pairs.size).toBe(3);
  });
});

