/**
 * 阿里云 PNVS 图形验证码 SDK 类型声明
 * 文档：https://help.aliyun.com/zh/pnvs/developer-reference/integrate-the-sdk-with-h5-pages
 */

/** 验证成功后获取的验证结果 */
export interface PnvsValidateResult {
  /** 验证流水号 */
  lot_number: string
  /** 验证输出信息 */
  captcha_output: string
  /** 验证通过标识 */
  pass_token: string
  /** 验证通过时间戳 */
  gen_time: string
}

/** 验证失败对象 */
export interface PnvsFailObject {
  /** 验证ID (appId) */
  captcha_id: string
  /** 验证形式：icon(图标点选)、word(文字点选)、phrase(字序点选)、slide(滑动拼图)、nine(九宫格) */
  captcha_type: string
  /** 验证流水号 */
  lotNumber: string
}

/** 错误对象 */
export interface PnvsErrorObject {
  /** 错误码 */
  code: string
  /** 提示信息 */
  msg: string
  /** 详细错误信息 */
  desc: {
    detail: string
  }
}

/** 初始化配置参数 */
export interface PnvsConfig {
  /** 验证ID (appId) - 必填 */
  captchaId: string
  /** 产品类型，默认值 "bind" - 必填 */
  product: 'bind'
  /** 语言设置，默认跟随浏览器 */
  language?: string
  /** 页面缩放比例，默认 1 */
  rem?: number
}

/** 验证码实例对象 */
export interface PnvsCaptchaObject {
  /** 监听验证按钮 DOM 生成完毕事件 */
  onReady(callback: () => void): PnvsCaptchaObject
  /** 监听验证码下一步资源加载完毕事件 */
  onNextReady(callback: () => void): PnvsCaptchaObject
  /** 监听验证成功事件 */
  onSuccess(callback: () => void): PnvsCaptchaObject
  /** 监听验证失败事件 */
  onFail(callback: (failObj: PnvsFailObject) => void): PnvsCaptchaObject
  /** 监听验证出错事件 */
  onError(callback: (error: PnvsErrorObject) => void): PnvsCaptchaObject
  /** 监听用户关闭验证事件 */
  onClose(callback: () => void): PnvsCaptchaObject
  /** 调起验证码 */
  showCaptcha(): void
  /** 获取验证结果（用于服务端二次校验） */
  getValidate(): PnvsValidateResult | false
  /** 重置验证状态 */
  reset(): void
  /** 销毁验证实例 */
  destroy(): void
}

/** 初始化回调函数 */
export type PnvsInitCallback = (captchaObj: PnvsCaptchaObject) => void

/** 全局 initAlicom4 函数 */
declare global {
  interface Window {
    initAlicom4: (config: PnvsConfig, callback: PnvsInitCallback) => void
  }
}

export {}
