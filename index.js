class _Promise {
  constructor(executor) {
    console.log("Promise 构造函数");
    executor();
  }
}
module.exports = _Promise;
