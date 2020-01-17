const makeCron = ({ listQueue, decrementTimer }) => async res => {
  try {
    const list = await listQueue();
    list.forEach(async id => {
      const decremented = await decrementTimer({ id });
      res.send(decremented.remainingDuration);
    });
  } catch (e) {
    console.error(e);
    res.send(e.message);
  }
};

module.exports = makeCron;
