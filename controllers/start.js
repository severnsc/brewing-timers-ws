const makeStart = enqueueId => async (req, res) => {
  const id = req.id;
  try {
    const enqueued = await enqueueId({ id, res });
    res.send(enqueued.message);
  } catch (e) {
    console.error(e);
    res.send(e.message);
  }
};

module.exports = makeStart;
