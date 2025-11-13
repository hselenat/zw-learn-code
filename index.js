// 新增三种状态
const STATUS_PENDING = "pending";
const STATUS_FULFILLED = "fulfilled";
const STATUS_REJECTED = "rejected";
class _Promise {
  constructor(executor = () => {}) {
    // 立即执行构造函数，且状态变为pending
    this.status = STATUS_PENDING;
    const resolve = () => {
      // 执行resolve后，状态变成fulfilled
      this.status = STATUS_FULFILLED;
    };
    const reject = () => {
      // 执行reject后，状态变成rejected
      this.status = STATUS_REJECTED;
    };
    // 传入的回调会有两个参数resolve和reject
    executor(resolve, reject);
  }
}
module.exports = _Promise;
