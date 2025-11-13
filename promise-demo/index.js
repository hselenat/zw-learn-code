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
    // 传入的回调会有两个参数resolve和reject
    executor(resolve, reject);
  }
  // then方法
  then(onFulfilled, onRejected) {
    // 由于executor可能是一个异步函数，所以不能直接执行
    // 需要做一些状态判断
    // 如果执行then的时候，Promise实例状态已经发生变化，则直接执行传入的参数
    if (
      this.status === STATUS_FULFILLED &&
      onFulfilled &&
      typeof onFulfilled === "function"
    ) {
      onFulfilled(this.value);
    }
    if (
      this.status === STATUS_REJECTED &&
      onRejected &&
      typeof onRejected === "function"
    ) {
      onRejected(this.reason);
    }
    // 如果执行then的时候状态还是pending，则将回调函数放入队列中，等待执行resolve
    // 或reject的时候，统一执行所有的队列
    if (this.status === STATUS_PENDING) {
      if (onFulfilled && typeof onFulfilled === "function") {
        this.resolveQueue.push(onFulfilled);
      }
      if (onRejected && typeof onRejected === "function") {
        this.rejectQueue.push(onRejected);
      }
    }
  }
}
module.exports = _Promise;
