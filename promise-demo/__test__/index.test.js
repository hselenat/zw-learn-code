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
  test("executor 可以是一个异步函数", () => {
    new _Promise((resolve) => {
      setTimeout(() => {
        resolve("success");
      }, 1000);
    }).then((res) => {
      expect(res).toBe("success");
    });
    new _Promise((_, reject) => {
      setTimeout(() => {
        reject("error");
      }, 1000);
    }).then(null, (err) => {
      expect(err).toBe("error");
    });
  });
  test("链式调用", () => {
    new _Promise((resolve) => {
      resolve("success");
    })
      .then((res) => {
        expect(res).toBe("success");
        return "next success";
      })
      .then((res) => {
        expect(res).toBe("next success");
      });
    new _Promise((_, reject) => {
      reject("error");
    })
      .then(null, (err) => {
        expect(err).toBe("error");
        return "next error";
      })
      .then(null, (err) => {
        expect(err).toBe("next error");
      });
  });
  test("如果构造函数抛出了一个错误，then的第二个参数也可以捕捉到这个错误", () => {
    new _Promise(() => {
      throw new Error("error");
    }).then(null, (err) => {
      expect(err).toEqual(new Error("error"));
    });
  });
  test("在链式调用的过程中出现任何错误，将由下面的then第二个参数处理", () => {
    new _Promise((resolve) => {
      resolve("success");
    })
      .then((res) => {
        expect(res).toBe("success");
        throw new Error("error");
      })
      .then(null, (err) => {
        expect(err).toEqual(new Error("error"));
      });
  });
  test("catch应该捕获上一个promise实例的reject", () => {
    new _Promise((_, reject) => {
      reject("error");
    }).catch((err) => {
      expect(err).toBe("error");
    });
    new _Promise((resolve, reject) => {
      resolve("success");
    })
      .then(null, (res) => {
        throw new Error("error");
      })
      .catch((err) => {
        expect(err).toEqual(new Error("error"));
      });
  });
  test("catch可以捕获最开始的reject，也就是构造函数抛出的错误", () => {
    new _Promise((resolve, reject) => {
      reject("error");
    })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        expect(err).toBe("error");
      });
  });
  test("无论promise状态是成功还是失败，finally回调函数都会被执行", () => {
    let finallyTimer = 0;
    new _Promise((resolve) => {
      resolve("success");
    }).finally(() => {
      finallyTimer++;
    });
    expect(finallyTimer).toBe(1);
    new _Promise((_, reject) => {
      reject("error");
    }).finally(() => {
      finallyTimer++;
    });
    expect(finallyTimer).toBe(2);
  });
  // Promise.resolve("success")
  // 等于
  // new Promise(resolve => resolve("success"))
  test("resolve 可以将一个传入的值作为resolve的参数", () => {
    const data = {name: "pikachu"};
    _Promise.resolve(data).then((res) => {
      expect(res).toBe(data);
    });
  });
  test("reject 可以传入一个reason，作为reject的参数", () => {
    const data = {name: "pikachu"};
    _Promise.reject(data).then(null, (err) => {
      expect(err).toBe(data);
    });
  });
  test("all方法接受队列，所有fulfilled才会fulfilled，只要有一个rejected则rejected", () => {
    function genPromise(index) {
      return new _Promise((resolve) => {
        resolve("success" + index);
      });
    }
    const promiseQueue = [genPromise(1), genPromise(2), genPromise(3)];
    _Promise.all(promiseQueue).then((res) => {
      expect(res).toEqual(["success1", "success2", "success3"]);
    });
    const promiseQueue2 = [
      genPromise(1),
      genPromise(2),
      genPromise(3),
      new _Promise((_, reject) => reject("error")),
    ];
    _Promise.all(promiseQueue2).then(null, (err) => {
      expect(err).toBe("error");
    });
  });
  test("allSettled 无论promise队列是成功还是失败，都会保存起来，并且只会是fulfilled", () => {
    function genPromise(index) {
      return new _Promise((resolve, reject) => {
        if (index % 2 === 0) {
          resolve("success" + index);
        } else {
          reject("error" + index);
        }
      });
    }
    const promiseQueue = [genPromise(1), genPromise(2), genPromise(3)];
    _Promise.allSettled(promiseQueue).then((res) => {
      expect(res).toEqual([
        {status: STATUS_FULFILLED, value: "success1"},
        {status: STATUS_REJECTED, reason: "error2"},
        {status: STATUS_FULFILLED, value: "success3"},
      ]);
    });
  });

  test("race队列中哪个最先完成，那么race返回的实例就是什么状态", () => {
    function genPromise(index) {
      return new _Promise((resolve, reject) => {
        if (index % 2 === 0) {
          resolve("success" + index);
        } else {
          reject("error" + index);
        }
      });
    }
    const promiseQueue = [genPromise(1), genPromise(2), genPromise(3)];
    _Promise.race(promiseQueue).then((res) => {
      expect(res).toBe("success1");
    });
  });
  test("any方法，只要有一个成功，那么any返回的实例就是fulfilled，并且是第一个成功的值", () => {
    function genPromise(index) {
      return new _Promise((resolve, reject) => {
        if (index % 2 === 0) {
          resolve("success" + index);
        } else {
          reject("error" + index);
        }
      });
    }
    const promiseQueue = [genPromise(1), genPromise(2), genPromise(3)];
    _Promise.any(promiseQueue).then((res) => {
      expect(res).toBe("success1");
    });
  });
});
