import makeDecrementTimer from "./decrement-timer";
import makeEnqueue from "./enqueue";
import makeDequeue from "./dequeue";

const timersDb = {
  findById: () => Promise.resolve(),
  update: () => Promise.resolve()
};

const queueResponse = Object.freeze({
  getMessage: () => "message"
});

const queue = {
  enqueue: () => Promise.resolve(queueResponse),
  dequeue: () => Promise.resolve(queueResponse)
};

const decrementTimer = makeDecrementTimer({ timersDb });
const enqueue = makeEnqueue({ queue });
const dequeue = makeDequeue({ queue });

const timerService = Object.freeze({
  decrementTimer,
  enqueue,
  dequeue
});

export default timerService;
