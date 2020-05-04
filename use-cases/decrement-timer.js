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
    console.log("existing", existing);
    const timer = makeTimer(existing);

    if (timer.getRemainingDuration() <= 0) {
      return {
        id: timer.getId(),
        duration: timer.getDuration(),
        remainingDuration: 0,
      };
    }

    const remainingDuration = timer.decrement();

    await timersDb.update({
      id: timer.getId(),
      duration: timer.getDuration(),
      remainingDuration,
    });

    return {
      id: timer.getId(),
      duration: timer.getDuration(),
      remainingDuration: remainingDuration < 0 ? 0 : remainingDuration,
    };
  };
};

module.exports = makeDecrementTimer;
