const makeTimer = ({ id, duration, remainingDuration }) => {
  if (typeof id !== "string") {
    throw new Error("Timer id must be a string");
  }
  if (typeof duration !== "number") {
    throw new Error("Timer duration must be a number");
  }
  if (typeof remainingDuration !== "number") {
    throw new Error("Timer remainingDuration must be a number");
  }
  return Object.freeze({
    getId: () => id,
    getDuration: () => duration,
    getRemainingDuration: () => remainingDuration,
    decrement: () => (remainingDuration -= 1000)
  });
};

export default makeTimer;
