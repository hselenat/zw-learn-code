// 新增三种状态
const STATUS_PENDING = "pending";
const STATUS_FULFILLED = "fulfilled";
const STATUS_REJECTED = "rejected";

function executorFnWithCatchError(fn, params, resolve, reject) {
  try {
    const result = fn(params);
    resolve(result);
  } catch (error) {
    reject(error);
  }
}
class _Promise {
  constructor(executor = () => {}) {
    // 立即执行构造函数，且状态变为pending
    this.status = STATUS_PENDING;
    this.value = undefined;
    this.reason = undefined;
    // 因为可以执行多次then，因此需要将所有的任务放在一个队列中
    this.resolveQueue = [];
    this.rejectQueue = [];
    // resolve需要接收一个参数value
    const resolve = (value) => {
      // 执行resolve后，状态变成fulfilled
      // 如果状态是pending时，才可以变成fulfilled
      if (this.status === STATUS_PENDING) {
        this.status = STATUS_FULFILLED;
        this.value = value;
        // 执行resolve队列中的任务
        if (this.resolveQueue.length > 0) {
          this.resolveQueue.forEach((fn) => fn(this.value));
        }
      }
    };
    // reject需要接收一个失败原因reason
    const reject = (reason) => {
      // 执行reject后，状态变成rejected
      // 如果状态是pending时，才可以变成rejected
      if (this.status === STATUS_PENDING) {
        this.status = STATUS_REJECTED;
        this.reason = reason;
        // 执行reject队列中的任务
        if (this.rejectQueue.length > 0) {
          this.rejectQueue.forEach((fn) => fn(this.reason));
        }
      }
    };
    // 使用try catch捕获构造函数中的错误
    try {
      // 传入的回调会有两个参数resolve和reject
      executor(resolve, reject);
    } catch (error) {
      // 如果构造函数中抛出了错误，会执行reject
      reject(error);
    }
  }
  // 新增实例方法：then方法
  then(onFulfilled, onRejected) {
    // 我们给两个参数写一个默认值
    onFulfilled = onFulfilled ? onFulfilled : (value) => value;
    onRejected = onRejected
      ? onRejected
      : (reason) => {
          throw new Error(reason);
        };
    // 想要实现链式调用，就需要返回新的promise对象
    return new _Promise((resolve, reject) => {
      // 由于executor可能是一个异步函数，所以不能直接执行
      // 需要做一些状态判断
      // 如果执行then的时候，Promise实例状态已经发生变化，则直接执行传入的参数
      if (
        this.status === STATUS_FULFILLED &&
        typeof onFulfilled === "function"
      ) {
        // 将onFulfilled返回的值作为下一个Promise resolve的值
        // const value = onFulfilled(this.value);
        // resolve(value);
        executorFnWithCatchError(onFulfilled, this.value, resolve, reject);
      }
      if (this.status === STATUS_REJECTED && typeof onRejected === "function") {
        // 将onRejected返回的错误原因作为下一个Promise reject的错误原因
        // const reason = onRejected(this.reason);
        // reject(reason);
        executorFnWithCatchError(onRejected, this.reason, resolve, reject);
      }
      // 如果执行then的时候状态还是pending，则将回调函数放入队列中，等待执行resolve
      // 或reject的时候，统一执行所有的队列
      if (this.status === STATUS_PENDING) {
        // 这里的队列是在构造函数中处理的，所以需要处理转化一下
        if (onFulfilled && typeof onFulfilled === "function") {
          this.resolveQueue.push((params) => {
            // const value = onFulfilled(params);
            // resolve(value);
            executorFnWithCatchError(onFulfilled, params, resolve, reject);
          });
        }
        if (onRejected && typeof onRejected === "function") {
          this.rejectQueue.push((params) => {
            // const reason = onRejected(params);
            // reject(reason);
            executorFnWithCatchError(onRejected, params, resolve, reject);
          });
        }
      }
    });
  }
  // 新增实例方法：catch方法
  catch(onRejected) {
    // 直接复用then方法逻辑即可，将传入的参数作为then的第二个参数
    // 当你调用promise.catch(onRejected)时，实际上就是调用promise.then(null, onRejected)，只是不传入成功回调，只传入失败回调
    // 如果promise被拒绝（rejected），则会调用传入的onRejected函数，如果promise成功，则直接返回成功的值不做处理
    return this.then(null, onRejected);
  }
  // 新增实例方法：finally方法
  finally(onFinally) {
    // 直接复用then方法逻辑即可，传入onFinally
    //  传递Promise 的值和状态
    return this.then(
      (value) => _Promise.resolve(onFinally()).then(() => value),
      (reason) =>
        _Promise.resolve(onFinally()).then(() => {
          throw reason;
        })
    );
  }
  // 新增类方法: resolve方法
  static resolve(value) {
    return new _Promise((resolve) => resolve(value));
  }
  // 新增类方法: reject方法
  static reject(reason) {
    return new _Promise((_, reject) => reject(reason));
  }
  // 新增类方法: all方法
  static all(promiseQueue) {
    return new _Promise((resolve, reject) => {
      const result = [];
      let count = 0; // all 方法需要保持顺序和计数
      // 对队列进行遍历
      promiseQueue.forEach((promise, index) => {
        promise
          .then((res) => {
            result[index] = res; // 将结果放入result中
            count++;
            // 如果所有promise都resolve了，那么就直接执行resolve
            if (count === promiseQueue.length) {
              resolve(result);
            }
          })
          .catch((err) => {
            // 任何一个promise rejected，那么就直接执行reject
            reject(err);
          });
      });
    });
  }
  // 新增类方法: allSettled方法
  static allSettled(promiseQueue) {
    return new _Promise((resolve) => {
      const result = [];
      // 对队列进行遍历
      promiseQueue.forEach((promise) => {
        promise
          .then((res) => {
            result.push({status: STATUS_FULFILLED, value: res}); // 将结果放入result中
          })
          .catch((err) => {
            result.push({status: STATUS_REJECTED, reason: err}); // 将错误放入result中
          });
      });
      // 所有都resolve后，才会resolve
      resolve(result);
    });
  }
  // 新增类方法: race方法
  static race(promiseQueue) {
    return new _Promise((resolve, reject) => {
      // 对队列进行遍历
      promiseQueue.forEach((promise) => {
        promise
          .then((res) => {
            // 只要有一个promise resolve，那么就直接执行resolve
            resolve(res);
          })
          .catch((err) => {
            // 只要有一个promise reject，那么就直接执行reject
            reject(err);
          });
      });
    });
  }
  // 新增类方法: any方法
  static any(promiseQueue) {
    return new _Promise((resolve, reject) => {
      const errors = [];
      // 对队列进行遍历
      promiseQueue.forEach((promise) => {
        promise
          .then((res) => {
            // 只要有一个promise resolve，那么就直接执行resolve
            resolve(res);
          })
          .catch((err) => {
            // 只要有一个promise reject，那么就将错误放入errors数组中
            errors.push(err);
          });
      });
      // 如果所有promise都rejected，那么就直接执行reject
      if (errors.length === promiseQueue.length) {
        reject(new AggregateError(errors, "All promises were rejected"));
      }
    });
  }
}
module.exports = _Promise;
