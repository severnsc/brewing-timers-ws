function makeIdQueue({ makeQueue }) {
  return Object.freeze({
    enqueue,
    dequeue,
    get,
  });
  async function enqueue({ id, sendResponse }) {
    const queue = await makeQueue();
    const isEnqueued = await queue.enqueue({ id, sendResponse });
    const message = isEnqueued ? "Enqueue successful" : "Enqueue failed";
    return {
      getMessage: () => message,
    };
  }
  async function dequeue(id) {
    const queue = await makeQueue();
    const isDequeued = await queue.dequeue(id);
    const message = isDequeued ? "Dequeue successful" : "Dequeue failed";
    return {
      getMessage: () => message,
    };
  }
  async function get() {
    const queue = await makeQueue();
    const result = await queue.findAll();
    return result;
  }
}

module.exports = makeIdQueue;
