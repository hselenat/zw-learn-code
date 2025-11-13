const _Promise = require("../index.js");

describe("_Promise", () => {
  // 当通过new创建Promise实例，需要传入一个回调函数，
  // 我们称之为executor（初始化的函数）executor需要立即执行
  test("应该立刻执行构造函数传入的代码", () => {
    let timer = 0;
    new _Promise(() => {
      timer = 1;
    });
    expect(timer).toBe(1);
  });
  test("promise 有三种状态", () => {
    const p1 = new _Promise();
    expect(p1.status).toBe("pending");
    const p2 = new _Promise((resolve) => resolve());
    expect(p2.status).toBe("fulfilled");
    const p3 = new _Promise((_, reject) => reject());
    expect(p3.status).toBe("rejected");
  });
});
