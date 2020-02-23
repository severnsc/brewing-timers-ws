const makeTimer = require("../timer");
const makeStop = ({ timersDb }) => {
  return async function stop({ id, remainingDuration }) {
    if (!id) {
      throw new Error("You must supply an id!");
    }

    const existing = await timersDb.findById({ id });

    if (!existing) {
      throw new RangeError("Timer not found!");
    }

    const timer = makeTimer({ ...existing, remainingDuration });

    timersDb.update({
      id: timer.getId(),
      duration: timer.getDuration(),
      remainingDuration: timer.getRemainingDuration()
    });
  };
};

module.exports = makeStop;
