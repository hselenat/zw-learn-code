/**
 * 封装一个兼容多个浏览器的绑定事件函数
 */
class CommonEvent {
  constructor(element) {

    if (!element) {
      throw new Error('请传入一个元素')
    }
    this.element = element;
  }
  /**
   * 添加事件监听器
   * @param {*} type 事件类型
   * @param {*} handler 事件处理函数
   */
  addEvent(type, handler)  {
    if (this.element.addEventListener) {
      this.element.addEventListener(type, handler, false);
    } else if(this.element.attachEvent) {
      this.element.attachEvent('on' + type, () => handler.call(this.element))
    } else {
      this.element['on' + type] = handler;
    }
  }
  /**
   * 移除事件监听器
   */
  removeEvent(type, handler) {
    if (this.element.removeEventListener) {
      this.element.removeEventListener(type, handler, false);
    } else if(this.element.detachEvent) {
      this.element.detachEvent('on' + type, handler)
    } else {
      this.element['on' + type] = null;
    }
  }
  /**
   * 阻止事件冒泡
   * @param {*} e 事件对象
   */
  static stopPropagation(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true; // iE
    }
  }
  /**
   * 取消事件的默认行为
   */
  static preventDefault(e) {
    if (e.preventDefault) {
      e.preventDefault(); // 标准w3c
    } else {
      e.returnValue = false; // IE
    }
  }
}


module.exports = CommonEvent;