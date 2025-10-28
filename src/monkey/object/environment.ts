/**
 * Environment模块
 * 
 * 环境（Environment）用于存储和管理变量绑定
 * 实现了词法作用域（Lexical Scoping）
 * 
 * 环境的结构：
 * - 每个环境有自己的变量存储空间
 * - 环境可以有外层环境（outer），形成作用域链
 * - 查找变量时，先在当前环境查找，找不到则递归查找外层环境
 */

import type { MonkeyObject } from "./types";

/**
 * Environment类
 * 
 * 管理变量的存储和查找
 */
export class Environment {
  private store: Map<string, MonkeyObject>;  // 变量存储空间
  private outer?: Environment;                // 外层环境（父作用域）

  /**
   * 构造函数
   * 
   * @param outer - 可选的外层环境，用于实现作用域链
   */
  constructor(outer?: Environment) {
    this.store = new Map();
    this.outer = outer;
  }

  /**
   * 获取变量的值
   * 
   * 首先在当前环境中查找，如果找不到且存在外层环境，
   * 则递归地在外层环境中查找
   * 
   * @param name - 变量名
   * @returns 如果找到则返回[对象, true]，否则返回[null, false]
   * 
   * @example
   * ```typescript
   * const env = new Environment();
   * env.set("x", new IntegerObject(5));
   * const [value, ok] = env.get("x");  // value是IntegerObject(5), ok是true
   * ```
   */
  public get(name: string): [MonkeyObject | null, boolean] {
    let obj = this.store.get(name);
    
    // 如果在当前环境中找到了，直接返回
    if (obj !== undefined) {
      return [obj, true];
    }
    
    // 如果当前环境中没有，且存在外层环境，则在外层环境中查找
    if (this.outer !== undefined) {
      return this.outer.get(name);
    }
    
    // 在所有环境中都找不到
    return [null, false];
  }

  /**
   * 设置变量的值
   * 
   * 在当前环境中创建或更新变量绑定
   * 注意：这总是在当前环境中设置，不会影响外层环境
   * 
   * @param name - 变量名
   * @param val - 变量值
   * @returns 返回设置的值
   * 
   * @example
   * ```typescript
   * const env = new Environment();
   * env.set("x", new IntegerObject(10));
   * env.set("name", new StringObject("Monkey"));
   * ```
   */
  public set(name: string, val: MonkeyObject): MonkeyObject {
    this.store.set(name, val);
    return val;
  }
}

/**
 * 创建一个新的enclosed环境
 * 
 * 用于创建内层作用域（如函数调用时的局部作用域）
 * 新环境会将传入的环境作为其外层环境
 * 
 * @param outer - 外层环境
 * @returns 新的enclosed环境
 * 
 * @example
 * ```typescript
 * const globalEnv = new Environment();
 * globalEnv.set("x", new IntegerObject(10));
 * 
 * // 创建函数作用域
 * const funcEnv = newEnclosedEnvironment(globalEnv);
 * funcEnv.set("y", new IntegerObject(20));
 * 
 * // funcEnv可以访问x（来自外层）和y（本地定义）
 * const [x, ok1] = funcEnv.get("x");  // IntegerObject(10), true
 * const [y, ok2] = funcEnv.get("y");  // IntegerObject(20), true
 * 
 * // globalEnv只能访问x，不能访问y
 * const [x2, ok3] = globalEnv.get("x");  // IntegerObject(10), true
 * const [y2, ok4] = globalEnv.get("y");  // null, false
 * ```
 */
export function newEnclosedEnvironment(outer: Environment): Environment {
  return new Environment(outer);
}

