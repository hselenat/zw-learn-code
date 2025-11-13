const _Promise = require("../index.js");

describe("_Promise", () => {
  test("应该立刻执行构造函数传入的代码", () => {
    let timer = 0;
    new _Promise(() => {
      timer = 1;
    });
    expect(timer).toBe(1);
  });
});
