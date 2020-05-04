const { decrementTimer } = require("../use-cases");

const cron = async ({ id, res }) => {
  try {
    const decremented = await decrementTimer({ id });
    res.send(decremented.remainingDuration);
  } catch (e) {
    console.error(e);
    res.send(e.message);
  }
};

module.exports = makeCron;
