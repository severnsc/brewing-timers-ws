const makeTimer = require("../timer");
const makeDecrementTimer = ({ timersDb }) => {
  return async function decrementTimer({ id }) {
    if (!id) {
      throw new Error("You must supply a timer id");
    }
    const existing = await timersDb.findById({ id });

    if (!existing) {
      throw new RangeError("Timer not found!");
    }

    const timer = makeTimer(existing);

    if (timer.getRemainingDuration() <= 0) {
      return timer;
    }

    timer.decrement();

    const decremented = timer;

    await timersDb.update({
      id: decremented.getId(),
      duration: decremented.getDuration(),
      remainingDuration: decremented.getRemainingDuration()
    });

    return {
      id: decremented.getId(),
      duration: decremented.getDuration(),
      remainingDuration: decremented.getRemainingDuration()
    };
  };
};

module.exports = makeDecrementTimer;
