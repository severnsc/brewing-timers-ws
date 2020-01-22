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
      return {
        id: timer.getId(),
        duration: timer.getDuration(),
        remainingDuration: 0
      };
    }

    timer.decrement();

    const decremented = timer;

    const remainingDuration = decremented.getRemainingDuration();

    await timersDb.update({
      id: decremented.getId(),
      duration: decremented.getDuration(),
      remainingDuration: remainingDuration < 0 ? 0 : remainingDuration
    });

    return {
      id: decremented.getId(),
      duration: decremented.getDuration(),
      remainingDuration: remainingDuration < 0 ? 0 : remainingDuration
    };
  };
};

module.exports = makeDecrementTimer;
