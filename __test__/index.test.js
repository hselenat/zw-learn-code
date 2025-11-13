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
  test("执行 resolve、reject后状态固化", () => {
    const p1 = new _Promise((resolve, reject) => {
      resolve();
      reject();
    });
    // console.debug(p1.status); // 可以通过debug调试
    expect(p1.status).toBe("fulfilled");
    const p2 = new _Promise((resolve, reject) => {
      reject();
      resolve();
    });
    expect(p2.status).toBe("rejected");
  });
  test("then方法可以接受两个参数，可以处理resolve和reject", () => {
    new _Promise((resolve) => {
      resolve("success");
    }).then((res) => {
      expect(res).toBe("success");
    });
    new _Promise((resolve, reject) => {
      reject("error");
    }).then(null, (err) => {
      expect(err).toBe("error");
    });
  });
  test("then方法可以接受两个参数，但是不是函数", () => {
    new _Promise((resolve) => {
      resolve("success");
    }).then((res) => {
      expect(res).toBe("success");
    });
    new _Promise((resolve, reject) => {
      reject("error");
    }).then(null, (err) => {
      expect(err).toBe("error");
    });
  });
});
