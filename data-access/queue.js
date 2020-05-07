function makeIdQueue({ makeQueue }) {
  return Object.freeze({
    enqueue,
    dequeue,
    get,
  });
  async function enqueue({ id, duration, alerts, sendResponse }) {
    const queue = makeQueue();
    const isEnqueued = await queue.enqueue({
      id,
      duration,
      alerts,
      sendResponse,
    });
    const message = isEnqueued ? "Enqueue successful" : "Enqueue failed";
    return {
      getMessage: () => message,
    };
  }
  async function dequeue(id) {
    const queue = makeQueue();
    const isDequeued = await queue.dequeue(id);
    const message = isDequeued ? "Dequeue successful" : "Dequeue failed";
    return {
      getMessage: () => message,
    };
  }
  async function get() {
    const queue = makeQueue();
    const result = await queue.findAll();
    return result;
  }
}

module.exports = makeIdQueue;
