// 新增三种状态
const STATUS_PENDING = "pending";
const STATUS_FULFILLED = "fulfilled";
const STATUS_REJECTED = "rejected";
class _Promise {
  constructor(executor = () => {}) {
    // 立即执行构造函数，且状态变为pending
    this.status = STATUS_PENDING;
    this.value = undefined;
    this.reason = undefined;
    // resolve需要接收一个参数value
    const resolve = (value) => {
      // 执行resolve后，状态变成fulfilled
      // 如果状态是pending时，才可以变成fulfilled
      if (this.status === STATUS_PENDING) {
        this.status = STATUS_FULFILLED;
        this.value = value;
      }
    };
    // reject需要接收一个失败原因reason
    const reject = (reason) => {
      // 执行reject后，状态变成rejected
      // 如果状态是pending时，才可以变成rejected
      if (this.status === STATUS_PENDING) {
        this.status = STATUS_REJECTED;
        this.reason = reason;
      }
    };
    // 传入的回调会有两个参数resolve和reject
    executor(resolve, reject);
  }
  // then方法
  then(onFulfilled, onRejected) {
    if (onFulfilled && typeof onFulfilled === "function") {
      onFulfilled(this.value);
    }
    if (onRejected && typeof onRejected === "function") {
      onRejected(this.reason);
    }
  }
}
module.exports = _Promise;
