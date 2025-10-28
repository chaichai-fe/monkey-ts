/**
 * Evaluator模块的单元测试
 * 
 * 测试求值器是否能正确执行各种表达式和语句
 */

import { describe, it, expect } from "vitest";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { evalNode } from "./evaluator";
import { Environment } from "../object/environment";
import * as obj from "../object/object";

/**
 * 辅助函数：解析并求值输入
 */
function testEval(input: string): obj.MonkeyObject | null {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();
  const env = new Environment();
  return evalNode(program, env);
}

describe("Evaluator", () => {
  it("应该正确求值整数表达式", () => {
    const tests = [
      { input: "5", expected: 5 },
      { input: "10", expected: 10 },
      { input: "-5", expected: -5 },
      { input: "-10", expected: -10 },
      { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
      { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
      { input: "-50 + 100 + -50", expected: 0 },
      { input: "5 * 2 + 10", expected: 20 },
      { input: "5 + 2 * 10", expected: 25 },
      { input: "20 + 2 * -10", expected: 0 },
      { input: "50 / 2 * 2 + 10", expected: 60 },
      { input: "2 * (5 + 10)", expected: 30 },
      { input: "3 * 3 * 3 + 10", expected: 37 },
      { input: "3 * (3 * 3) + 10", expected: 37 },
      { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50 },
    ];

    for (const test of tests) {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(obj.IntegerObject);
      expect((evaluated as obj.IntegerObject).value).toBe(test.expected);
    }
  });

  it("应该正确求值布尔表达式", () => {
    const tests = [
      { input: "true", expected: true },
      { input: "false", expected: false },
      { input: "1 < 2", expected: true },
      { input: "1 > 2", expected: false },
      { input: "1 < 1", expected: false },
      { input: "1 > 1", expected: false },
      { input: "1 == 1", expected: true },
      { input: "1 != 1", expected: false },
      { input: "1 == 2", expected: false },
      { input: "1 != 2", expected: true },
      { input: "true == true", expected: true },
      { input: "false == false", expected: true },
      { input: "true == false", expected: false },
      { input: "true != false", expected: true },
      { input: "(1 < 2) == true", expected: true },
      { input: "(1 < 2) == false", expected: false },
      { input: "(1 > 2) == true", expected: false },
      { input: "(1 > 2) == false", expected: true },
    ];

    for (const test of tests) {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(obj.BooleanObject);
      expect((evaluated as obj.BooleanObject).value).toBe(test.expected);
    }
  });

  it("应该正确求值逻辑非运算符", () => {
    const tests = [
      { input: "!true", expected: false },
      { input: "!false", expected: true },
      { input: "!5", expected: false },
      { input: "!!true", expected: true },
      { input: "!!false", expected: false },
      { input: "!!5", expected: true },
    ];

    for (const test of tests) {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(obj.BooleanObject);
      expect((evaluated as obj.BooleanObject).value).toBe(test.expected);
    }
  });

  it("应该正确求值if表达式", () => {
    const tests = [
      { input: "if (true) { 10 }", expected: 10 },
      { input: "if (false) { 10 }", expected: null },
      { input: "if (1) { 10 }", expected: 10 },
      { input: "if (1 < 2) { 10 }", expected: 10 },
      { input: "if (1 > 2) { 10 }", expected: null },
      { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
      { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 },
    ];

    for (const test of tests) {
      const evaluated = testEval(test.input);
      if (test.expected === null) {
        expect(evaluated).toBeInstanceOf(obj.NullObject);
      } else {
        expect(evaluated).toBeInstanceOf(obj.IntegerObject);
        expect((evaluated as obj.IntegerObject).value).toBe(test.expected);
      }
    }
  });

  it("应该正确求值return语句", () => {
    const tests = [
      { input: "return 10;", expected: 10 },
      { input: "return 10; 9;", expected: 10 },
      { input: "return 2 * 5; 9;", expected: 10 },
      { input: "9; return 2 * 5; 9;", expected: 10 },
      {
        input: `
if (10 > 1) {
  if (10 > 1) {
    return 10;
  }
  return 1;
}
`,
        expected: 10,
      },
    ];

    for (const test of tests) {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(obj.IntegerObject);
      expect((evaluated as obj.IntegerObject).value).toBe(test.expected);
    }
  });

  it("应该正确处理错误", () => {
    const tests = [
      { input: "5 + true;", expectedMessage: "type mismatch: INTEGER + BOOLEAN" },
      { input: "5 + true; 5;", expectedMessage: "type mismatch: INTEGER + BOOLEAN" },
      { input: "-true", expectedMessage: "unknown operator: -BOOLEAN" },
      { input: "true + false;", expectedMessage: "unknown operator: BOOLEAN + BOOLEAN" },
      { input: "5; true + false; 5", expectedMessage: "unknown operator: BOOLEAN + BOOLEAN" },
      {
        input: "if (10 > 1) { true + false; }",
        expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
      },
      { input: "foobar", expectedMessage: "identifier not found: foobar" },
      { input: '"Hello" - "World"', expectedMessage: "unknown operator: STRING - STRING" },
    ];

    for (const test of tests) {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(obj.ErrorObject);
      expect((evaluated as obj.ErrorObject).message).toBe(test.expectedMessage);
    }
  });

  it("应该正确求值let语句", () => {
    const tests = [
      { input: "let a = 5; a;", expected: 5 },
      { input: "let a = 5 * 5; a;", expected: 25 },
      { input: "let a = 5; let b = a; b;", expected: 5 },
      { input: "let a = 5; let b = a; let c = a + b + 5; c;", expected: 15 },
    ];

    for (const test of tests) {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(obj.IntegerObject);
      expect((evaluated as obj.IntegerObject).value).toBe(test.expected);
    }
  });

  it("应该正确求值函数对象", () => {
    const input = "fn(x) { x + 2; };";
    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(obj.FunctionObject);
    
    const func = evaluated as obj.FunctionObject;
    expect(func.parameters.length).toBe(1);
    expect(func.parameters[0].toString()).toBe("x");
    expect(func.body.toString()).toBe("(x + 2)");
  });

  it("应该正确执行函数调用", () => {
    const tests = [
      { input: "let identity = fn(x) { x; }; identity(5);", expected: 5 },
      { input: "let identity = fn(x) { return x; }; identity(5);", expected: 5 },
      { input: "let double = fn(x) { x * 2; }; double(5);", expected: 10 },
      { input: "let add = fn(x, y) { x + y; }; add(5, 5);", expected: 10 },
      { input: "let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));", expected: 20 },
      { input: "fn(x) { x; }(5)", expected: 5 },
    ];

    for (const test of tests) {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(obj.IntegerObject);
      expect((evaluated as obj.IntegerObject).value).toBe(test.expected);
    }
  });

  it("应该正确处理闭包", () => {
    const input = `
let newAdder = fn(x) {
  fn(y) { x + y };
};
let addTwo = newAdder(2);
addTwo(2);
`;

    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(obj.IntegerObject);
    expect((evaluated as obj.IntegerObject).value).toBe(4);
  });

  it("应该正确求值字符串字面量", () => {
    const input = '"Hello World!"';
    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(obj.StringObject);
    expect((evaluated as obj.StringObject).value).toBe("Hello World!");
  });

  it("应该正确连接字符串", () => {
    const input = '"Hello" + " " + "World!"';
    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(obj.StringObject);
    expect((evaluated as obj.StringObject).value).toBe("Hello World!");
  });

  it("应该正确求值内置函数", () => {
    const tests = [
      { input: 'len("")', expected: 0 },
      { input: 'len("four")', expected: 4 },
      { input: 'len("hello world")', expected: 11 },
      { input: "len([1, 2, 3])", expected: 3 },
      { input: 'first([1, 2, 3])', expected: 1 },
      { input: 'last([1, 2, 3])', expected: 3 },
    ];

    for (const test of tests) {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(obj.IntegerObject);
      expect((evaluated as obj.IntegerObject).value).toBe(test.expected);
    }
  });

  it("应该正确求值数组字面量", () => {
    const input = "[1, 2 * 2, 3 + 3]";
    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(obj.ArrayObject);
    
    const array = evaluated as obj.ArrayObject;
    expect(array.elements.length).toBe(3);
    expect((array.elements[0] as obj.IntegerObject).value).toBe(1);
    expect((array.elements[1] as obj.IntegerObject).value).toBe(4);
    expect((array.elements[2] as obj.IntegerObject).value).toBe(6);
  });

  it("应该正确访问数组元素", () => {
    const tests = [
      { input: "[1, 2, 3][0]", expected: 1 },
      { input: "[1, 2, 3][1]", expected: 2 },
      { input: "[1, 2, 3][2]", expected: 3 },
      { input: "let i = 0; [1][i];", expected: 1 },
      { input: "[1, 2, 3][1 + 1];", expected: 3 },
      { input: "let myArray = [1, 2, 3]; myArray[2];", expected: 3 },
      {
        input: "let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];",
        expected: 6,
      },
      {
        input: "let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]",
        expected: 2,
      },
    ];

    for (const test of tests) {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(obj.IntegerObject);
      expect((evaluated as obj.IntegerObject).value).toBe(test.expected);
    }
  });

  it("应该正确求值哈希字面量", () => {
    const input = `
let two = "two";
{
  "one": 10 - 9,
  two: 1 + 1,
  "thr" + "ee": 6 / 2,
  4: 4,
  true: 5,
  false: 6
}
`;
    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(obj.HashObject);
    
    const hash = evaluated as obj.HashObject;
    
    const expected = new Map([
      [new obj.StringObject("one").hashKey().toString(), 1],
      [new obj.StringObject("two").hashKey().toString(), 2],
      [new obj.StringObject("three").hashKey().toString(), 3],
      [new obj.IntegerObject(4).hashKey().toString(), 4],
      [new obj.BooleanObject(true).hashKey().toString(), 5],
      [new obj.BooleanObject(false).hashKey().toString(), 6],
    ]);

    expect(hash.pairs.size).toBe(expected.size);

    expected.forEach((expectedValue, expectedKey) => {
      const pair = hash.pairs.get(expectedKey);
      expect(pair).toBeDefined();
      expect((pair!.value as obj.IntegerObject).value).toBe(expectedValue);
    });
  });

  it("应该正确访问哈希表元素", () => {
    const tests = [
      { input: '{"foo": 5}["foo"]', expected: 5 },
      { input: 'let key = "foo"; {"foo": 5}[key]', expected: 5 },
      { input: '{5: 5}[5]', expected: 5 },
      { input: '{true: 5}[true]', expected: 5 },
      { input: '{false: 5}[false]', expected: 5 },
    ];

    for (const test of tests) {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(obj.IntegerObject);
      expect((evaluated as obj.IntegerObject).value).toBe(test.expected);
    }
  });
});

