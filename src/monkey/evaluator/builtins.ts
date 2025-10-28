/**
 * Builtins模块
 *
 * 定义了Monkey语言的内置函数
 * 这些函数是用TypeScript实现的，可以直接被Monkey代码调用
 *
 * 内置函数列表：
 * - len: 获取字符串或数组的长度
 * - first: 获取数组的第一个元素
 * - last: 获取数组的最后一个元素
 * - rest: 获取数组除第一个元素外的所有元素
 * - push: 向数组添加元素（返回新数组）
 * - puts: 打印输出到控制台
 * - write: 输出内容（可在不同环境中自定义实现）
 */

import * as obj from '../object/object'

/**
 * 内置函数映射表
 * 将函数名映射到BuiltinObject
 */
export const builtins = new Map<string, obj.BuiltinObject>([
  /**
   * len函数
   *
   * 返回字符串的长度或数组的元素个数
   *
   * @example
   * ```monkey
   * len("hello")      // 返回 5
   * len([1, 2, 3])    // 返回 3
   * ```
   */
  [
    'len',
    new obj.BuiltinObject((...args: obj.MonkeyObject[]): obj.MonkeyObject => {
      // 检查参数个数
      if (args.length !== 1) {
        return new obj.ErrorObject(
          `wrong number of arguments. got=${args.length}, want=1`
        )
      }

      const arg = args[0]

      // 处理字符串
      if (arg instanceof obj.StringObject) {
        return new obj.IntegerObject(arg.value.length)
      }

      // 处理数组
      if (arg instanceof obj.ArrayObject) {
        return new obj.IntegerObject(arg.elements.length)
      }

      // 不支持的类型
      return new obj.ErrorObject(
        `argument to 'len' not supported, got ${arg.type()}`
      )
    }),
  ],

  /**
   * first函数
   *
   * 返回数组的第一个元素
   * 如果数组为空，返回null
   *
   * @example
   * ```monkey
   * first([1, 2, 3])   // 返回 1
   * first([])          // 返回 null
   * ```
   */
  [
    'first',
    new obj.BuiltinObject((...args: obj.MonkeyObject[]): obj.MonkeyObject => {
      // 检查参数个数
      if (args.length !== 1) {
        return new obj.ErrorObject(
          `wrong number of arguments. got=${args.length}, want=1`
        )
      }

      // 检查参数类型
      if (args[0].type() !== obj.ARRAY_OBJ) {
        return new obj.ErrorObject(
          `argument to 'first' must be ARRAY, got ${args[0].type()}`
        )
      }

      const arr = args[0] as obj.ArrayObject

      // 返回第一个元素，或null
      if (arr.elements.length > 0) {
        return arr.elements[0]
      }

      return new obj.NullObject()
    }),
  ],

  /**
   * last函数
   *
   * 返回数组的最后一个元素
   * 如果数组为空，返回null
   *
   * @example
   * ```monkey
   * last([1, 2, 3])    // 返回 3
   * last([])           // 返回 null
   * ```
   */
  [
    'last',
    new obj.BuiltinObject((...args: obj.MonkeyObject[]): obj.MonkeyObject => {
      // 检查参数个数
      if (args.length !== 1) {
        return new obj.ErrorObject(
          `wrong number of arguments. got=${args.length}, want=1`
        )
      }

      // 检查参数类型
      if (args[0].type() !== obj.ARRAY_OBJ) {
        return new obj.ErrorObject(
          `argument to 'last' must be ARRAY, got ${args[0].type()}`
        )
      }

      const arr = args[0] as obj.ArrayObject
      const length = arr.elements.length

      // 返回最后一个元素，或null
      if (length > 0) {
        return arr.elements[length - 1]
      }

      return new obj.NullObject()
    }),
  ],

  /**
   * rest函数
   *
   * 返回数组除第一个元素外的所有元素组成的新数组
   * 如果数组为空或只有一个元素，返回null
   *
   * 注意：这是函数式编程中常见的操作，不会修改原数组
   *
   * @example
   * ```monkey
   * rest([1, 2, 3, 4])   // 返回 [2, 3, 4]
   * rest([1])            // 返回 null
   * ```
   */
  [
    'rest',
    new obj.BuiltinObject((...args: obj.MonkeyObject[]): obj.MonkeyObject => {
      // 检查参数个数
      if (args.length !== 1) {
        return new obj.ErrorObject(
          `wrong number of arguments. got=${args.length}, want=1`
        )
      }

      // 检查参数类型
      if (args[0].type() !== obj.ARRAY_OBJ) {
        return new obj.ErrorObject(
          `argument to 'rest' must be ARRAY, got ${args[0].type()}`
        )
      }

      const arr = args[0] as obj.ArrayObject
      const length = arr.elements.length

      // 如果数组有元素，返回除第一个外的所有元素
      if (length > 0) {
        const newElements = arr.elements.slice(1)
        return new obj.ArrayObject(newElements)
      }

      return new obj.NullObject()
    }),
  ],

  /**
   * push函数
   *
   * 向数组添加一个元素，返回新数组
   *
   * 注意：不会修改原数组，返回的是包含新元素的新数组
   * 这符合函数式编程的不可变性原则
   *
   * @example
   * ```monkey
   * push([1, 2], 3)    // 返回 [1, 2, 3]
   * ```
   */
  [
    'push',
    new obj.BuiltinObject((...args: obj.MonkeyObject[]): obj.MonkeyObject => {
      // 检查参数个数
      if (args.length !== 2) {
        return new obj.ErrorObject(
          `wrong number of arguments. got=${args.length}, want=2`
        )
      }

      // 检查第一个参数类型
      if (args[0].type() !== obj.ARRAY_OBJ) {
        return new obj.ErrorObject(
          `argument to 'push' must be ARRAY, got ${args[0].type()}`
        )
      }

      const arr = args[0] as obj.ArrayObject

      // 创建新数组，包含原数组的所有元素加上新元素
      const newElements = [...arr.elements, args[1]]
      return new obj.ArrayObject(newElements)
    }),
  ],

  /**
   * puts函数
   *
   * 打印一个或多个值到标准输出（控制台）
   * 总是返回null
   *
   * @example
   * ```monkey
   * puts("Hello, World!")
   * puts(1, 2, 3)
   * ```
   */
  [
    'puts',
    new obj.BuiltinObject((...args: obj.MonkeyObject[]): obj.MonkeyObject => {
      // 打印所有参数
      for (const arg of args) {
        console.log(arg.inspect())
      }

      return new obj.NullObject()
    }),
  ],

  /**
   * write函数
   *
   * 输出一个或多个值
   * 可以在不同环境中自定义实现（浏览器中显示在页面，命令行中打印到终端）
   * 总是返回null
   *
   * @example
   * ```monkey
   * write("Hello, World!")
   * write(1, 2, 3)
   * ```
   */
  [
    'write',
    new obj.BuiltinObject((...args: obj.MonkeyObject[]): obj.MonkeyObject => {
      // 默认实现：打印到控制台
      for (const arg of args) {
        console.log(arg.inspect())
      }

      return new obj.NullObject()
    }),
  ],
])
