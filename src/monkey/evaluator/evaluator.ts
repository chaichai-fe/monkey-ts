/**
 * Evaluator模块（求值器）
 *
 * 求值器负责遍历AST并执行代码
 * 它是解释器的核心部分，将AST转换为实际的运行时值
 *
 * 求值策略：
 * - 树遍历解释器（Tree-Walking Interpreter）
 * - 使用递归下降方式遍历AST
 * - 每个节点类型都有对应的求值逻辑
 */

import * as ast from '../ast/ast'
import * as obj from '../object/object'
import { Environment, newEnclosedEnvironment } from '../object/environment'
import { builtins } from './builtins'

/**
 * 全局单例对象
 * 为了性能和内存效率，某些对象在整个程序中只创建一次
 */
const NULL = new obj.NullObject()
const TRUE = new obj.BooleanObject(true)
const FALSE = new obj.BooleanObject(false)

/**
 * eval函数
 *
 * 求值器的入口函数，对AST节点进行求值
 *
 * @param node - 要求值的AST节点
 * @param env - 当前的环境（变量作用域）
 * @returns 求值结果对象
 */
export function evalNode(
  node: ast.Node | null,
  env: Environment
): obj.MonkeyObject | null {
  if (node === null) {
    return null
  }

  // ==================== 语句节点 ====================

  // 程序节点：依次求值所有语句
  if (node instanceof ast.Program) {
    return evalProgram(node, env)
  }

  // 表达式语句：求值表达式
  if (node instanceof ast.ExpressionStatement) {
    return evalNode(node.expression, env)
  }

  // 代码块语句：依次求值块中的所有语句
  if (node instanceof ast.BlockStatement) {
    return evalBlockStatement(node, env)
  }

  // return语句：求值返回值并包装为ReturnValue对象
  if (node instanceof ast.ReturnStatement) {
    const val = evalNode(node.returnValue, env)
    if (isError(val)) {
      return val
    }
    return new obj.ReturnValue(val!)
  }

  // let语句：求值右侧表达式并绑定到标识符
  if (node instanceof ast.LetStatement) {
    const val = evalNode(node.value, env)
    if (isError(val)) {
      return val
    }
    env.set(node.name.value, val!)
    return val
  }

  // ==================== 表达式节点 ====================

  // 整数字面量：直接返回整数对象
  if (node instanceof ast.IntegerLiteral) {
    return new obj.IntegerObject(node.value)
  }

  // 字符串字面量：直接返回字符串对象
  if (node instanceof ast.StringLiteral) {
    return new obj.StringObject(node.value)
  }

  // 布尔值：返回全局单例
  if (node instanceof ast.BooleanLiteral) {
    return nativeBoolToBooleanObject(node.value)
  }

  // 前缀表达式：求值右侧，然后应用运算符
  if (node instanceof ast.PrefixExpression) {
    const right = evalNode(node.right, env)
    if (isError(right)) {
      return right
    }
    return evalPrefixExpression(node.operator, right!)
  }

  // 中缀表达式：求值左右两侧，然后应用运算符
  if (node instanceof ast.InfixExpression) {
    const left = evalNode(node.left, env)
    if (isError(left)) {
      return left
    }

    const right = evalNode(node.right, env)
    if (isError(right)) {
      return right
    }

    return evalInfixExpression(node.operator, left!, right!)
  }

  // if表达式：根据条件选择分支
  if (node instanceof ast.IfExpression) {
    return evalIfExpression(node, env)
  }

  // 标识符：从环境中查找变量
  if (node instanceof ast.Identifier) {
    return evalIdentifier(node, env)
  }

  // 函数字面量：创建函数对象
  if (node instanceof ast.FunctionLiteral) {
    return new obj.FunctionObject(node.parameters, node.body, env)
  }

  // 函数调用：求值函数和参数，然后执行
  if (node instanceof ast.CallExpression) {
    const func = evalNode(node.func, env)
    if (isError(func)) {
      return func
    }

    const args = evalExpressions(node.args, env)
    if (args.length === 1 && isError(args[0])) {
      return args[0]
    }

    return applyFunction(func!, args)
  }

  // 数组字面量：求值所有元素
  if (node instanceof ast.ArrayLiteral) {
    const elements = evalExpressions(node.elements, env)
    if (elements.length === 1 && isError(elements[0])) {
      return elements[0]
    }
    return new obj.ArrayObject(elements)
  }

  // 索引表达式：求值左侧和索引，然后访问
  if (node instanceof ast.IndexExpression) {
    const left = evalNode(node.left, env)
    if (isError(left)) {
      return left
    }

    const index = evalNode(node.index, env)
    if (isError(index)) {
      return index
    }

    return evalIndexExpression(left!, index!)
  }

  // 哈希字面量：求值所有键值对
  if (node instanceof ast.HashLiteral) {
    return evalHashLiteral(node, env)
  }

  return null
}

/**
 * 求值程序
 *
 * 依次执行所有语句，遇到return或error时立即返回
 */
function evalProgram(
  program: ast.Program,
  env: Environment
): obj.MonkeyObject | null {
  let result: obj.MonkeyObject | null = null

  for (const statement of program.statements) {
    result = evalNode(statement, env)

    // 遇到return语句，解包返回值
    if (result && result.type() === obj.RETURN_VALUE_OBJ) {
      return (result as obj.ReturnValue).value
    }

    // 遇到错误，立即返回
    if (result && result.type() === obj.ERROR_OBJ) {
      return result
    }
  }

  return result
}

/**
 * 求值代码块
 *
 * 依次执行块中的所有语句
 * 与evalProgram不同的是，遇到return时不解包，直接返回ReturnValue对象
 * 这样可以让return在函数中正确工作
 */
function evalBlockStatement(
  block: ast.BlockStatement,
  env: Environment
): obj.MonkeyObject | null {
  let result: obj.MonkeyObject | null = null

  for (const statement of block.statements) {
    result = evalNode(statement, env)

    // 遇到return或error，立即返回（不解包）
    if (result !== null) {
      const rt = result.type()
      if (rt === obj.RETURN_VALUE_OBJ || rt === obj.ERROR_OBJ) {
        return result
      }
    }
  }

  return result
}

/**
 * 将JavaScript布尔值转换为Monkey布尔对象
 * 使用全局单例以提高性能
 */
function nativeBoolToBooleanObject(input: boolean): obj.BooleanObject {
  return input ? TRUE : FALSE
}

/**
 * 求值前缀表达式
 *
 * @param operator - 运算符（! 或 -）
 * @param right - 右侧操作数
 */
function evalPrefixExpression(
  operator: string,
  right: obj.MonkeyObject
): obj.MonkeyObject {
  switch (operator) {
    case '!':
      return evalBangOperatorExpression(right)
    case '-':
      return evalMinusPrefixOperatorExpression(right)
    default:
      return newError(`unknown operator: ${operator}${right.type()}`)
  }
}

/**
 * 求值中缀表达式
 *
 * @param operator - 运算符（+, -, *, /, <, >, ==, !=）
 * @param left - 左侧操作数
 * @param right - 右侧操作数
 */
function evalInfixExpression(
  operator: string,
  left: obj.MonkeyObject,
  right: obj.MonkeyObject
): obj.MonkeyObject {
  // 两个操作数都是整数
  if (left.type() === obj.INTEGER_OBJ && right.type() === obj.INTEGER_OBJ) {
    return evalIntegerInfixExpression(operator, left, right)
  }

  // 两个操作数都是字符串
  if (left.type() === obj.STRING_OBJ && right.type() === obj.STRING_OBJ) {
    return evalStringInfixExpression(operator, left, right)
  }

  // == 和 != 运算符：使用引用相等性（对于单例对象有效）
  if (operator === '==') {
    return nativeBoolToBooleanObject(left === right)
  }
  if (operator === '!=') {
    return nativeBoolToBooleanObject(left !== right)
  }

  // 类型不匹配
  if (left.type() !== right.type()) {
    return newError(`type mismatch: ${left.type()} ${operator} ${right.type()}`)
  }

  return newError(
    `unknown operator: ${left.type()} ${operator} ${right.type()}`
  )
}

/**
 * 求值逻辑非运算符
 *
 * Monkey的truthiness规则：
 * - false 和 null 为假
 * - 其他所有值为真
 */
function evalBangOperatorExpression(right: obj.MonkeyObject): obj.MonkeyObject {
  if (right === TRUE) {
    return FALSE
  }
  if (right === FALSE) {
    return TRUE
  }
  if (right === NULL) {
    return TRUE
  }
  return FALSE
}

/**
 * 求值负号运算符
 */
function evalMinusPrefixOperatorExpression(
  right: obj.MonkeyObject
): obj.MonkeyObject {
  if (right.type() !== obj.INTEGER_OBJ) {
    return newError(`unknown operator: -${right.type()}`)
  }

  const value = (right as obj.IntegerObject).value
  return new obj.IntegerObject(-value)
}

/**
 * 求值整数中缀表达式
 */
function evalIntegerInfixExpression(
  operator: string,
  left: obj.MonkeyObject,
  right: obj.MonkeyObject
): obj.MonkeyObject {
  const leftVal = (left as obj.IntegerObject).value
  const rightVal = (right as obj.IntegerObject).value

  switch (operator) {
    case '+':
      return new obj.IntegerObject(leftVal + rightVal)
    case '-':
      return new obj.IntegerObject(leftVal - rightVal)
    case '*':
      return new obj.IntegerObject(leftVal * rightVal)
    case '/':
      return new obj.IntegerObject(Math.floor(leftVal / rightVal))
    case '<':
      return nativeBoolToBooleanObject(leftVal < rightVal)
    case '>':
      return nativeBoolToBooleanObject(leftVal > rightVal)
    case '==':
      return nativeBoolToBooleanObject(leftVal === rightVal)
    case '!=':
      return nativeBoolToBooleanObject(leftVal !== rightVal)
    default:
      return newError(
        `unknown operator: ${left.type()} ${operator} ${right.type()}`
      )
  }
}

/**
 * 求值字符串中缀表达式
 * 只支持 + 运算符（字符串连接）
 */
function evalStringInfixExpression(
  operator: string,
  left: obj.MonkeyObject,
  right: obj.MonkeyObject
): obj.MonkeyObject {
  if (operator !== '+') {
    return newError(
      `unknown operator: ${left.type()} ${operator} ${right.type()}`
    )
  }

  const leftVal = (left as obj.StringObject).value
  const rightVal = (right as obj.StringObject).value
  return new obj.StringObject(leftVal + rightVal)
}

/**
 * 求值if表达式
 *
 * 根据条件的真假选择执行consequence或alternative分支
 */
function evalIfExpression(
  ie: ast.IfExpression,
  env: Environment
): obj.MonkeyObject | null {
  const condition = evalNode(ie.condition, env)
  if (isError(condition)) {
    return condition
  }

  if (isTruthy(condition!)) {
    return evalNode(ie.consequence, env)
  } else if (ie.alternative) {
    return evalNode(ie.alternative, env)
  } else {
    return NULL
  }
}

/**
 * 判断对象是否为真
 *
 * Monkey的truthiness规则：
 * - null 和 false 为假
 * - 其他所有值为真
 */
function isTruthy(obj: obj.MonkeyObject): boolean {
  if (obj === NULL) {
    return false
  }
  if (obj === TRUE) {
    return true
  }
  if (obj === FALSE) {
    return false
  }
  return true
}

/**
 * 求值标识符
 *
 * 从环境中查找变量，如果找不到则查找内置函数
 */
function evalIdentifier(
  node: ast.Identifier,
  env: Environment
): obj.MonkeyObject {
  // 先在环境中查找
  const [val, ok] = env.get(node.value)
  if (ok) {
    return val!
  }

  // 查找内置函数
  const builtin = builtins.get(node.value)
  if (builtin) {
    return builtin
  }

  return newError(`identifier not found: ${node.value}`)
}

/**
 * 求值表达式列表
 *
 * 用于求值函数参数或数组元素
 * 如果任何一个表达式出错，立即返回错误
 */
function evalExpressions(
  exps: ast.Expression[],
  env: Environment
): obj.MonkeyObject[] {
  const result: obj.MonkeyObject[] = []

  for (const e of exps) {
    const evaluated = evalNode(e, env)
    if (isError(evaluated)) {
      return [evaluated!]
    }
    result.push(evaluated!)
  }

  return result
}

/**
 * 应用函数
 *
 * 执行函数调用，支持用户定义函数和内置函数
 */
function applyFunction(
  func: obj.MonkeyObject,
  args: obj.MonkeyObject[]
): obj.MonkeyObject {
  // 用户定义的函数
  if (func.type() === obj.FUNCTION_OBJ) {
    const funcObj = func as obj.FunctionObject
    const extendedEnv = extendFunctionEnv(funcObj, args)
    const evaluated = evalNode(funcObj.body, extendedEnv)
    return unwrapReturnValue(evaluated)
  }

  // 内置函数
  if (func.type() === obj.BUILTIN_OBJ) {
    const builtinObj = func as obj.BuiltinObject
    return builtinObj.fn(...args)
  }

  return newError(`not a function: ${func.type()}`)
}

/**
 * 扩展函数环境
 *
 * 创建一个新的enclosed环境，并将参数绑定到参数名
 * 这样函数就可以访问其参数和外层作用域的变量
 */
function extendFunctionEnv(
  func: obj.FunctionObject,
  args: obj.MonkeyObject[]
): Environment {
  const env = newEnclosedEnvironment(func.env)

  for (let i = 0; i < func.parameters.length; i++) {
    env.set(func.parameters[i].value, args[i])
  }

  return env
}

/**
 * 解包返回值
 *
 * 如果对象是ReturnValue，提取其内部值
 * 这样return语句就可以在嵌套的代码块中正确工作
 */
function unwrapReturnValue(
  objValue: obj.MonkeyObject | null
): obj.MonkeyObject {
  if (objValue && objValue.type() === obj.RETURN_VALUE_OBJ) {
    return (objValue as obj.ReturnValue).value
  }
  return objValue || NULL
}

/**
 * 求值索引表达式
 *
 * 支持数组索引和哈希表访问
 */
function evalIndexExpression(
  left: obj.MonkeyObject,
  index: obj.MonkeyObject
): obj.MonkeyObject {
  // 数组索引
  if (left.type() === obj.ARRAY_OBJ && index.type() === obj.INTEGER_OBJ) {
    return evalArrayIndexExpression(left, index)
  }

  // 哈希表访问
  if (left.type() === obj.HASH_OBJ) {
    return evalHashIndexExpression(left, index)
  }

  return newError(`index operator not supported: ${left.type()}`)
}

/**
 * 求值数组索引表达式
 */
function evalArrayIndexExpression(
  array: obj.MonkeyObject,
  index: obj.MonkeyObject
): obj.MonkeyObject {
  const arrayObject = array as obj.ArrayObject
  const idx = (index as obj.IntegerObject).value
  const max = arrayObject.elements.length - 1

  // 索引越界返回null
  if (idx < 0 || idx > max) {
    return NULL
  }

  return arrayObject.elements[idx]
}

/**
 * 求值哈希字面量
 */
function evalHashLiteral(
  node: ast.HashLiteral,
  env: Environment
): obj.MonkeyObject {
  const hash = new obj.HashObject()

  for (const [keyNode, valueNode] of node.pairs) {
    const key = evalNode(keyNode, env)
    if (isError(key)) {
      return key!
    }

    // 检查键是否可哈希
    if (!obj.isHashable(key!)) {
      return newError(`unusable as hash key: ${key!.type()}`)
    }

    const value = evalNode(valueNode, env)
    if (isError(value)) {
      return value!
    }

    const hashed = key!.hashKey()
    hash.pairs.set(hashed.toString(), new obj.HashPair(key!, value!))
  }

  return hash
}

/**
 * 求值哈希索引表达式
 */
function evalHashIndexExpression(
  hash: obj.MonkeyObject,
  index: obj.MonkeyObject
): obj.MonkeyObject {
  const hashObject = hash as obj.HashObject

  // 检查索引是否可哈希
  if (!obj.isHashable(index)) {
    return newError(`unusable as hash key: ${index.type()}`)
  }

  const hashed = index.hashKey()
  const pair = hashObject.pairs.get(hashed.toString())

  // 键不存在返回null
  if (!pair) {
    return NULL
  }

  return pair.value
}

/**
 * 创建错误对象
 */
function newError(message: string): obj.ErrorObject {
  return new obj.ErrorObject(message)
}

/**
 * 检查对象是否为错误
 */
function isError(objValue: obj.MonkeyObject | null): boolean {
  if (objValue !== null) {
    return objValue.type() === obj.ERROR_OBJ
  }
  return false
}
