/**
 * Object类型定义
 * 
 * 该模块定义了Monkey语言的运行时对象系统的基础类型
 * 将类型定义独立出来以避免循环依赖
 */

/**
 * ObjectType类型
 * 用字符串表示对象的类型
 */
export type ObjectType = string;

// 对象类型常量定义
export const NULL_OBJ = "NULL";              // 空值类型
export const ERROR_OBJ = "ERROR";            // 错误类型
export const INTEGER_OBJ = "INTEGER";        // 整数类型
export const BOOLEAN_OBJ = "BOOLEAN";        // 布尔值类型
export const STRING_OBJ = "STRING";          // 字符串类型
export const RETURN_VALUE_OBJ = "RETURN_VALUE";  // 返回值类型
export const FUNCTION_OBJ = "FUNCTION";      // 函数类型
export const BUILTIN_OBJ = "BUILTIN";        // 内置函数类型
export const ARRAY_OBJ = "ARRAY";            // 数组类型
export const HASH_OBJ = "HASH";              // 哈希表类型

/**
 * Object接口
 * 
 * 所有运行时对象都必须实现此接口
 */
export interface MonkeyObject {
  /**
   * 返回对象的类型
   */
  type(): ObjectType;
  
  /**
   * 返回对象的字符串表示
   * 用于打印和调试
   */
  inspect(): string;
}

