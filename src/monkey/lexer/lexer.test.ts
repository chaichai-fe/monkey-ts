/**
 * Lexer模块的单元测试
 * 
 * 测试词法分析器是否能正确识别各种Token
 */

import { describe, it, expect } from "vitest";
import { Lexer } from "./lexer";
import * as token from "../token/token";

describe("Lexer", () => {
  it("应该正确识别各种Token", () => {
    // 测试输入：包含Monkey语言的各种语法元素
    const input = `let five = 5;
let ten = 10;

let add = fn(x, y) {
  x + y;
};

let result = add(five, ten);
!-/*5;
5 < 10 > 5;

if (5 < 10) {
	return true;
} else {
	return false;
}

10 == 10;
10 != 9;
"foobar"
"foo bar"
[1, 2];
{"foo": "bar"}
`;

    // 期望的Token序列
    const tests: Array<{ expectedType: token.TokenType; expectedLiteral: string }> = [
      { expectedType: token.LET, expectedLiteral: "let" },
      { expectedType: token.IDENT, expectedLiteral: "five" },
      { expectedType: token.ASSIGN, expectedLiteral: "=" },
      { expectedType: token.INT, expectedLiteral: "5" },
      { expectedType: token.SEMICOLON, expectedLiteral: ";" },
      { expectedType: token.LET, expectedLiteral: "let" },
      { expectedType: token.IDENT, expectedLiteral: "ten" },
      { expectedType: token.ASSIGN, expectedLiteral: "=" },
      { expectedType: token.INT, expectedLiteral: "10" },
      { expectedType: token.SEMICOLON, expectedLiteral: ";" },
      { expectedType: token.LET, expectedLiteral: "let" },
      { expectedType: token.IDENT, expectedLiteral: "add" },
      { expectedType: token.ASSIGN, expectedLiteral: "=" },
      { expectedType: token.FUNCTION, expectedLiteral: "fn" },
      { expectedType: token.LPAREN, expectedLiteral: "(" },
      { expectedType: token.IDENT, expectedLiteral: "x" },
      { expectedType: token.COMMA, expectedLiteral: "," },
      { expectedType: token.IDENT, expectedLiteral: "y" },
      { expectedType: token.RPAREN, expectedLiteral: ")" },
      { expectedType: token.LBRACE, expectedLiteral: "{" },
      { expectedType: token.IDENT, expectedLiteral: "x" },
      { expectedType: token.PLUS, expectedLiteral: "+" },
      { expectedType: token.IDENT, expectedLiteral: "y" },
      { expectedType: token.SEMICOLON, expectedLiteral: ";" },
      { expectedType: token.RBRACE, expectedLiteral: "}" },
      { expectedType: token.SEMICOLON, expectedLiteral: ";" },
      { expectedType: token.LET, expectedLiteral: "let" },
      { expectedType: token.IDENT, expectedLiteral: "result" },
      { expectedType: token.ASSIGN, expectedLiteral: "=" },
      { expectedType: token.IDENT, expectedLiteral: "add" },
      { expectedType: token.LPAREN, expectedLiteral: "(" },
      { expectedType: token.IDENT, expectedLiteral: "five" },
      { expectedType: token.COMMA, expectedLiteral: "," },
      { expectedType: token.IDENT, expectedLiteral: "ten" },
      { expectedType: token.RPAREN, expectedLiteral: ")" },
      { expectedType: token.SEMICOLON, expectedLiteral: ";" },
      { expectedType: token.BANG, expectedLiteral: "!" },
      { expectedType: token.MINUS, expectedLiteral: "-" },
      { expectedType: token.SLASH, expectedLiteral: "/" },
      { expectedType: token.ASTERISK, expectedLiteral: "*" },
      { expectedType: token.INT, expectedLiteral: "5" },
      { expectedType: token.SEMICOLON, expectedLiteral: ";" },
      { expectedType: token.INT, expectedLiteral: "5" },
      { expectedType: token.LT, expectedLiteral: "<" },
      { expectedType: token.INT, expectedLiteral: "10" },
      { expectedType: token.GT, expectedLiteral: ">" },
      { expectedType: token.INT, expectedLiteral: "5" },
      { expectedType: token.SEMICOLON, expectedLiteral: ";" },
      { expectedType: token.IF, expectedLiteral: "if" },
      { expectedType: token.LPAREN, expectedLiteral: "(" },
      { expectedType: token.INT, expectedLiteral: "5" },
      { expectedType: token.LT, expectedLiteral: "<" },
      { expectedType: token.INT, expectedLiteral: "10" },
      { expectedType: token.RPAREN, expectedLiteral: ")" },
      { expectedType: token.LBRACE, expectedLiteral: "{" },
      { expectedType: token.RETURN, expectedLiteral: "return" },
      { expectedType: token.TRUE, expectedLiteral: "true" },
      { expectedType: token.SEMICOLON, expectedLiteral: ";" },
      { expectedType: token.RBRACE, expectedLiteral: "}" },
      { expectedType: token.ELSE, expectedLiteral: "else" },
      { expectedType: token.LBRACE, expectedLiteral: "{" },
      { expectedType: token.RETURN, expectedLiteral: "return" },
      { expectedType: token.FALSE, expectedLiteral: "false" },
      { expectedType: token.SEMICOLON, expectedLiteral: ";" },
      { expectedType: token.RBRACE, expectedLiteral: "}" },
      { expectedType: token.INT, expectedLiteral: "10" },
      { expectedType: token.EQ, expectedLiteral: "==" },
      { expectedType: token.INT, expectedLiteral: "10" },
      { expectedType: token.SEMICOLON, expectedLiteral: ";" },
      { expectedType: token.INT, expectedLiteral: "10" },
      { expectedType: token.NOT_EQ, expectedLiteral: "!=" },
      { expectedType: token.INT, expectedLiteral: "9" },
      { expectedType: token.SEMICOLON, expectedLiteral: ";" },
      { expectedType: token.STRING, expectedLiteral: "foobar" },
      { expectedType: token.STRING, expectedLiteral: "foo bar" },
      { expectedType: token.LBRACKET, expectedLiteral: "[" },
      { expectedType: token.INT, expectedLiteral: "1" },
      { expectedType: token.COMMA, expectedLiteral: "," },
      { expectedType: token.INT, expectedLiteral: "2" },
      { expectedType: token.RBRACKET, expectedLiteral: "]" },
      { expectedType: token.SEMICOLON, expectedLiteral: ";" },
      { expectedType: token.LBRACE, expectedLiteral: "{" },
      { expectedType: token.STRING, expectedLiteral: "foo" },
      { expectedType: token.COLON, expectedLiteral: ":" },
      { expectedType: token.STRING, expectedLiteral: "bar" },
      { expectedType: token.RBRACE, expectedLiteral: "}" },
      { expectedType: token.EOF, expectedLiteral: "" },
    ];

    const lexer = new Lexer(input);

    // 逐个验证Token
    for (let i = 0; i < tests.length; i++) {
      const tok = lexer.nextToken();

      // 验证Token类型
      expect(tok.Type).toBe(tests[i].expectedType);

      // 验证Token字面量
      expect(tok.Literal).toBe(tests[i].expectedLiteral);
    }
  });
});

