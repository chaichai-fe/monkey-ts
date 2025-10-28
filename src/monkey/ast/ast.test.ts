/**
 * AST模块的单元测试
 * 
 * 测试AST节点的字符串表示功能
 */

import { describe, it, expect } from "vitest";
import * as ast from "./ast";
import * as token from "../token/token";

describe("AST", () => {
  it("应该正确生成字符串表示", () => {
    // 构建一个AST：let myVar = anotherVar;
    const program = new ast.Program();
    
    // 创建标识符 "myVar"
    const name = new ast.Identifier(
      { Type: token.IDENT, Literal: "myVar" },
      "myVar"
    );
    
    // 创建标识符 "anotherVar"
    const value = new ast.Identifier(
      { Type: token.IDENT, Literal: "anotherVar" },
      "anotherVar"
    );
    
    // 创建let语句
    const letStmt = new ast.LetStatement(
      { Type: token.LET, Literal: "let" },
      name,
      value
    );
    
    program.statements = [letStmt];

    // 验证字符串表示
    const programString = program.toString();
    expect(programString).toBe("let myVar = anotherVar;");
  });

  it("应该正确表示前缀表达式", () => {
    // 创建 -5 表达式
    const five = new ast.IntegerLiteral(
      { Type: token.INT, Literal: "5" },
      5
    );
    
    const prefixExpr = new ast.PrefixExpression(
      { Type: token.MINUS, Literal: "-" },
      "-",
      five
    );

    expect(prefixExpr.toString()).toBe("(-5)");
  });

  it("应该正确表示中缀表达式", () => {
    // 创建 5 + 3 表达式
    const left = new ast.IntegerLiteral(
      { Type: token.INT, Literal: "5" },
      5
    );
    
    const right = new ast.IntegerLiteral(
      { Type: token.INT, Literal: "3" },
      3
    );
    
    const infixExpr = new ast.InfixExpression(
      { Type: token.PLUS, Literal: "+" },
      left,
      "+",
      right
    );

    expect(infixExpr.toString()).toBe("(5 + 3)");
  });

  it("应该正确表示布尔值", () => {
    const trueExpr = new ast.BooleanLiteral(
      { Type: token.TRUE, Literal: "true" },
      true
    );
    
    const falseExpr = new ast.BooleanLiteral(
      { Type: token.FALSE, Literal: "false" },
      false
    );

    expect(trueExpr.toString()).toBe("true");
    expect(falseExpr.toString()).toBe("false");
  });
});

