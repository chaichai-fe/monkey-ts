/**
 * Monkey 语言解释器 - 统一导出模块
 *
 * 这个文件汇总了 Monkey 语言解释器的所有核心功能
 */

// ==================== 导入模块 ====================
import { Lexer as LexerClass } from './lexer/lexer'
import { Parser as ParserClass } from './parser/parser'
import { evalNode as evalNodeFunc } from './evaluator/evaluator'
import { Environment as EnvironmentClass } from './object/environment'

// ==================== Lexer (词法分析器) ====================
export { Lexer } from './lexer/lexer'

// ==================== Token (词法单元) ====================
export * from './token/token'

// ==================== AST (抽象语法树) ====================
export * from './ast/ast'

// ==================== Parser (语法分析器) ====================
export { Parser } from './parser/parser'

// ==================== Object (对象系统) ====================
export * from './object/object'
export * from './object/types'
export { Environment, newEnclosedEnvironment } from './object/environment'

// ==================== Evaluator (求值器) ====================
export { evalNode } from './evaluator/evaluator'
export { builtins } from './evaluator/builtins'

/**
 * 便捷函数：执行 Monkey 代码
 *
 * @param code - Monkey 源代码
 * @param env - 可选的环境，如果不提供则创建新环境
 * @returns 执行结果对象
 *
 * @example
 * ```typescript
 * import { execute, Environment } from './monkey'
 *
 * const env = new Environment()
 * const result = execute('let x = 5; x * 2', env)
 *
 * if (result.success) {
 *   console.log(result.value.inspect())
 * } else {
 *   console.error(result.errors)
 * }
 * ```
 */
export function execute(
  code: string,
  env?: EnvironmentClass
): {
  success: boolean
  value: import('./object/object').MonkeyObject | null
  errors: string[]
  program: import('./ast/ast').Program | null
} {
  try {
    // 词法分析
    const lexer = new LexerClass(code)

    // 语法分析
    const parser = new ParserClass(lexer)
    const program = parser.parseProgram()

    // 检查解析错误
    const parseErrors = parser.getErrors()
    if (parseErrors.length > 0) {
      return {
        success: false,
        value: null,
        errors: parseErrors,
        program: null,
      }
    }

    // 求值
    const environment = env || new EnvironmentClass()
    const evaluated = evalNodeFunc(program, environment)

    // 检查运行时错误
    if (evaluated && evaluated.type() === 'ERROR') {
      return {
        success: false,
        value: evaluated,
        errors: [evaluated.inspect()],
        program,
      }
    }

    return {
      success: true,
      value: evaluated,
      errors: [],
      program,
    }
  } catch (error) {
    return {
      success: false,
      value: null,
      errors: [error instanceof Error ? error.message : String(error)],
      program: null,
    }
  }
}
