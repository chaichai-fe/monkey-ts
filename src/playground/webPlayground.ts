/**
 * Web Playground - Monkey解释器在线演练场
 *
 * 提供浏览器中的交互式编程环境
 */

import './styles.css'
import { Lexer } from '../monkey/lexer/lexer'
import { Parser } from '../monkey/parser/parser'
import { evalNode } from '../monkey/evaluator/evaluator'
import { Environment } from '../monkey/object/environment'
import { builtins } from '../monkey/evaluator/builtins'
import * as obj from '../monkey/object/object'

// 全局环境，在页面生命周期内保持状态
const globalEnv = new Environment()

/**
 * 覆盖 write 函数，使其能在页面输出区域显示内容
 */
function setupWebWriteFunction() {
  builtins.set(
    'write',
    new obj.BuiltinObject((...args: obj.MonkeyObject[]): obj.MonkeyObject => {
      const outputDiv = document.getElementById('output') as HTMLDivElement
      const timestamp = new Date().toLocaleTimeString('zh-CN')

      // 将所有参数转换为字符串
      const content = args.map((arg) => arg.inspect()).join(' ')

      // 创建输出行
      const writeHTML = `
        <div class="output-line output-write">
          <div class="output-timestamp">⏰ ${timestamp}</div>
          <div class="output-result">📝 ${escapeHtml(content)}</div>
        </div>
      `
      outputDiv.innerHTML = writeHTML + outputDiv.innerHTML

      return new obj.NullObject()
    })
  )
}

/**
 * 示例代码
 */
const EXAMPLES = {
  hello: `
let greeting = "Hello, ";
let name = "Monkey";
write("欢迎使用 Monkey 语言!");
greeting + name + "!"`,

  fibonacci: `
let fibonacci = fn(x) {
  if (x == 0) {
    return 0;
  }
  if (x == 1) {
    return 1;
  }
  fibonacci(x - 1) + fibonacci(x - 2);
};

write("计算斐波那契数列第10项...");
fibonacci(10);`,

  array: `
let myArray = [1, 2, 3, 4, 5];

let doubled = fn(arr) {
  if (len(arr) == 0) {
    return [];
  }
  let head = first(arr) * 2;
  push(doubled(rest(arr)), head);
};

write("原始数组:", myArray);
write("每个元素翻倍:", doubled(myArray));
last(myArray);`,

  hash: `
let person = {
  "name": "Monkey",
  "age": 5,
  "language": "Monkey Language"
};

write("姓名:", person["name"]);
write("年龄:", person["age"]);
write("语言:", person["language"]);

person;`,
}

/**
 * 执行Monkey代码
 * @param code - 要执行的代码
 * @returns 执行结果或错误信息
 */
function executeCode(code: string): {
  success: boolean
  result: string
  errors?: string[]
} {
  try {
    // 词法分析
    const lexer = new Lexer(code)

    // 语法分析
    const parser = new Parser(lexer)
    const program = parser.parseProgram()

    // 检查解析错误
    const errors = parser.getErrors()
    if (errors.length > 0) {
      return {
        success: false,
        result: '',
        errors: errors,
      }
    }

    // 执行代码
    const evaluated = evalNode(program, globalEnv)

    if (evaluated === null) {
      return {
        success: true,
        result: 'null',
      }
    }

    // 检查是否是错误对象
    if (evaluated.type() === 'ERROR') {
      return {
        success: false,
        result: evaluated.inspect(),
        errors: [evaluated.inspect()],
      }
    }

    return {
      success: true,
      result: evaluated.inspect(),
    }
  } catch (error) {
    return {
      success: false,
      result: '',
      errors: [error instanceof Error ? error.message : String(error)],
    }
  }
}

/**
 * 在输出区域显示结果
 * @param result - 执行结果
 */
function displayResult(result: {
  success: boolean
  result: string
  errors?: string[]
}): void {
  const outputDiv = document.getElementById('output') as HTMLDivElement

  // 创建时间戳
  const timestamp = new Date().toLocaleTimeString('zh-CN')

  if (result.success) {
    // 成功执行
    const resultHTML = `
      <div class="output-line">
        <div class="output-timestamp">⏰ ${timestamp}</div>
        <div class="output-result">➜ ${escapeHtml(result.result)}</div>
      </div>
    `
    outputDiv.innerHTML = resultHTML + outputDiv.innerHTML
  } else {
    // 执行错误
    const errors = result.errors || [result.result]
    const errorHTML = `
      <div class="output-line output-error">
        <div class="output-timestamp">⏰ ${timestamp}</div>
        <div>
          <span class="output-error-icon">❌</span>
          <strong>错误:</strong>
        </div>
        ${errors
          .map(
            (err) =>
              `<div style="margin-left: 1.5rem;">• ${escapeHtml(err)}</div>`
          )
          .join('')}
      </div>
    `
    outputDiv.innerHTML = errorHTML + outputDiv.innerHTML
  }
}

/**
 * 转义HTML特殊字符
 * @param text - 要转义的文本
 * @returns 转义后的文本
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 清空输出区域
 */
function clearOutput(): void {
  const outputDiv = document.getElementById('output') as HTMLDivElement
  outputDiv.innerHTML = `
    <div class="welcome-message">
      <p>✨ 输出已清空</p>
      <p>准备执行新的代码...</p>
    </div>
  `
}

/**
 * 加载示例代码
 * @param exampleKey - 示例的键名
 */
function loadExample(exampleKey: keyof typeof EXAMPLES): void {
  const codeInput = document.getElementById('codeInput') as HTMLTextAreaElement
  codeInput.value = EXAMPLES[exampleKey]
  codeInput.focus()
}

/**
 * 初始化应用
 */
function init(): void {
  // 设置浏览器版本的 write 函数
  setupWebWriteFunction()
  // 获取DOM元素
  const runBtn = document.getElementById('runBtn') as HTMLButtonElement
  const codeInput = document.getElementById('codeInput') as HTMLTextAreaElement
  const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement
  const clearOutputBtn = document.getElementById(
    'clearOutputBtn'
  ) as HTMLButtonElement

  // 运行按钮点击事件
  runBtn.addEventListener('click', () => {
    const code = codeInput.value.trim()

    if (!code) {
      displayResult({
        success: false,
        result: '',
        errors: ['请输入要执行的代码'],
      })
      return
    }

    const result = executeCode(code)
    displayResult(result)
  })

  // 清空代码按钮
  clearBtn.addEventListener('click', () => {
    codeInput.value = ''
    codeInput.focus()
  })

  // 清空输出按钮
  clearOutputBtn.addEventListener('click', () => {
    clearOutput()
  })

  // 键盘快捷键 (Ctrl+Enter 或 Cmd+Enter)
  codeInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      runBtn.click()
    }
  })

  // 示例按钮点击事件
  const exampleBtns = document.querySelectorAll('.example-btn')
  exampleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const example = btn.getAttribute('data-example') as keyof typeof EXAMPLES
      if (example && EXAMPLES[example]) {
        loadExample(example)
      }
    })
  })

  // 聚焦到代码输入区
  codeInput.focus()

  console.log('🐵 Monkey 解释器已就绪！')
  console.log('提示：按 Ctrl+Enter (或 Cmd+Enter) 快速运行代码')
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
