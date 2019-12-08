import makeTimer from "../timer";
const makeDecrementTimer = ({ timersDb }) => {
  return async function decrementTimer({ id }) {
    if (!id) {
      throw new Error("You must supply a timer id");
    }
    const existing = await timersDb.findById({ id });

    if (!existing) {
      throw new RangeError("Timer not found!");
    }

    const timer = makeTimer({ existing });

    if (timer.getRemainingDuration() <= 0) {
      return timer;
    }

    const decremented = timer.decrement();

    const updated = timersDb.update({
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

export default makeDecrementTimer;
