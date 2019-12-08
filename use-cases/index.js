import makeDecrementTimer from "./decrement-timer";

const timersDb = {
  findById: () => Promise.resolve(),
  update: () => Promise.resolve()
};

const decrementTimer = makeDecrementTimer({ timersDb });

const timerService = Object.freeze({
  decrementTimer
});

export default timerService;
