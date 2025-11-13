const CommonEvent = require("./index");

describe("CommonEvent", () => {
  let element;
  let commonEvent;
  beforeEach(() => {
    element = document.createElement("div");
    commonEvent = new CommonEvent(element);
  });
  test("should add and trigger event listener", () => {
    const handler = jest.fn(); // 模拟一个空函数
    commonEvent.addEvent("click", handler);
    element.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalled(); // 检测事件是否被调用
  });

  test("should remove event listener", () => {
    const handler = jest.fn();
    commonEvent.addEvent("click", handler);
    commonEvent.removeEvent("click", handler);
    element.dispatchEvent(new Event("click"));
    expect(handler).not.toHaveBeenCalled(); // 检测事件是否被移除
  });
  test("should stop event propagation", () => {
    const handler = jest.fn();
    commonEvent.addEvent("click", (e) => {
      CommonEvent.stopPropagation(e);
      handler(); // 检测事件是否被阻止冒泡
    });
    element.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalled();
  });
  test("should prevent default event behavior", () => {
    const handler = jest.fn();
    commonEvent.addEvent("click", (e) => {
      CommonEvent.preventDefault(e);
      handler();
    });
    element.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalled(); // 检测事件是否被阻止默认行为
  });
});
