const makeListQueue = ({ queue }) => async () => {
  const list = await queue.get();
  return list.map(id => ({
    id
  }));
};

module.exports = makeListQueue;
