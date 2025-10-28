/**
 * Object模块
 * 
 * 该模块定义了Monkey语言的运行时对象系统
 * 在求值过程中，所有的值都被表示为Object类型
 * 
 * 对象类型包括：
 * - 基本类型：Integer（整数）、Boolean（布尔值）、String（字符串）、Null（空值）
 * - 复合类型：Array（数组）、Hash（哈希表）
 * - 函数类型：Function（函数）、Builtin（内置函数）
 * - 特殊类型：ReturnValue（返回值）、Error（错误）
 */

import * as ast from "../ast/ast";
import { Environment } from "./environment";
import type { 
  MonkeyObject, 
  ObjectType 
} from "./types";
import {
  NULL_OBJ,
  ERROR_OBJ,
  INTEGER_OBJ,
  BOOLEAN_OBJ,
  STRING_OBJ,
  RETURN_VALUE_OBJ,
  FUNCTION_OBJ,
  BUILTIN_OBJ,
  ARRAY_OBJ,
  HASH_OBJ
} from "./types";

// 重新导出类型以保持向后兼容
export type { MonkeyObject, ObjectType };
export {
  NULL_OBJ,
  ERROR_OBJ,
  INTEGER_OBJ,
  BOOLEAN_OBJ,
  STRING_OBJ,
  RETURN_VALUE_OBJ,
  FUNCTION_OBJ,
  BUILTIN_OBJ,
  ARRAY_OBJ,
  HASH_OBJ
};

/**
 * HashKey类
 * 
 * 用于哈希表的键，包含类型和哈希值
 * 确保不同类型的值即使哈希值相同也不会冲突
 */
export class HashKey {
  constructor(
    public type: ObjectType,
    public value: number
  ) {}

  /**
   * 生成唯一的字符串表示，用于Map的键
   */
  toString(): string {
    return `${this.type}:${this.value}`;
  }
}

/**
 * Hashable接口
 * 
 * 可以作为哈希表键的对象必须实现此接口
 */
export interface Hashable {
  hashKey(): HashKey;
}

// ==================== 基本类型 ====================

/**
 * IntegerObject类
 * 
 * 表示整数值
 */
export class IntegerObject implements MonkeyObject, Hashable {
  constructor(public value: number) {}

  type(): ObjectType {
    return INTEGER_OBJ;
  }

  inspect(): string {
    return this.value.toString();
  }

  /**
   * 整数的哈希键直接使用其值
   */
  hashKey(): HashKey {
    return new HashKey(this.type(), this.value);
  }
}

/**
 * BooleanObject类
 * 
 * 表示布尔值
 */
export class BooleanObject implements MonkeyObject, Hashable {
  constructor(public value: boolean) {}

  type(): ObjectType {
    return BOOLEAN_OBJ;
  }

  inspect(): string {
    return this.value.toString();
  }

  /**
   * 布尔值的哈希键：true为1，false为0
   */
  hashKey(): HashKey {
    const value = this.value ? 1 : 0;
    return new HashKey(this.type(), value);
  }
}

/**
 * StringObject类
 * 
 * 表示字符串值
 */
export class StringObject implements MonkeyObject, Hashable {
  constructor(public value: string) {}

  type(): ObjectType {
    return STRING_OBJ;
  }

  inspect(): string {
    return this.value;
  }

  /**
   * 字符串的哈希键使用简单的哈希算法
   */
  hashKey(): HashKey {
    // 简单的字符串哈希函数
    let hash = 0;
    for (let i = 0; i < this.value.length; i++) {
      hash = ((hash << 5) - hash) + this.value.charCodeAt(i);
      hash = hash & hash; // 转换为32位整数
    }
    return new HashKey(this.type(), Math.abs(hash));
  }
}

/**
 * NullObject类
 * 
 * 表示空值
 * 整个程序中只有一个实例（单例模式）
 */
export class NullObject implements MonkeyObject {
  type(): ObjectType {
    return NULL_OBJ;
  }

  inspect(): string {
    return "null";
  }
}

// ==================== 特殊类型 ====================

/**
 * ReturnValue类
 * 
 * 包装返回值，用于在函数执行中传递return语句的值
 * 通过包装可以在遇到return时立即停止执行
 */
export class ReturnValue implements MonkeyObject {
  constructor(public value: MonkeyObject) {}

  type(): ObjectType {
    return RETURN_VALUE_OBJ;
  }

  inspect(): string {
    return this.value.inspect();
  }
}

/**
 * ErrorObject类
 * 
 * 表示运行时错误
 */
export class ErrorObject implements MonkeyObject {
  constructor(public message: string) {}

  type(): ObjectType {
    return ERROR_OBJ;
  }

  inspect(): string {
    return "ERROR: " + this.message;
  }
}

// ==================== 函数类型 ====================

/**
 * FunctionObject类
 * 
 * 表示用户定义的函数
 */
export class FunctionObject implements MonkeyObject {
  /**
   * @param parameters - 函数参数列表
   * @param body - 函数体
   * @param env - 函数定义时的环境（用于闭包）
   */
  constructor(
    public parameters: ast.Identifier[],
    public body: ast.BlockStatement,
    public env: Environment
  ) {}

  type(): ObjectType {
    return FUNCTION_OBJ;
  }

  inspect(): string {
    const params = this.parameters.map(p => p.toString()).join(", ");
    return `fn(${params}) {\n${this.body.toString()}\n}`;
  }
}

/**
 * BuiltinFunction类型
 * 
 * 内置函数的签名：接收参数数组，返回对象
 */
export type BuiltinFunction = (...args: MonkeyObject[]) => MonkeyObject;

/**
 * BuiltinObject类
 * 
 * 表示内置函数（用TypeScript实现的函数）
 */
export class BuiltinObject implements MonkeyObject {
  constructor(public fn: BuiltinFunction) {}

  type(): ObjectType {
    return BUILTIN_OBJ;
  }

  inspect(): string {
    return "builtin function";
  }
}

// ==================== 复合类型 ====================

/**
 * ArrayObject类
 * 
 * 表示数组
 */
export class ArrayObject implements MonkeyObject {
  constructor(public elements: MonkeyObject[]) {}

  type(): ObjectType {
    return ARRAY_OBJ;
  }

  inspect(): string {
    const elements = this.elements.map(e => e.inspect()).join(", ");
    return `[${elements}]`;
  }
}

/**
 * HashPair类
 * 
 * 表示哈希表中的键值对
 * 保存原始的键对象和值对象
 */
export class HashPair {
  constructor(
    public key: MonkeyObject,
    public value: MonkeyObject
  ) {}
}

/**
 * HashObject类
 * 
 * 表示哈希表（字典）
 * 使用Map存储键值对，键是HashKey的字符串表示
 */
export class HashObject implements MonkeyObject {
  public pairs: Map<string, HashPair>;

  constructor() {
    this.pairs = new Map();
  }

  type(): ObjectType {
    return HASH_OBJ;
  }

  inspect(): string {
    const pairs: string[] = [];
    this.pairs.forEach(pair => {
      pairs.push(`${pair.key.inspect()}: ${pair.value.inspect()}`);
    });
    return `{${pairs.join(", ")}}`;
  }
}

/**
 * 类型守卫函数：检查对象是否可哈希
 */
export function isHashable(obj: MonkeyObject): obj is MonkeyObject & Hashable {
  return 'hashKey' in obj && typeof (obj as any).hashKey === 'function';
}

