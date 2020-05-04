const makeStart = (enqueueId) => async (req, res) => {
  const id = req.id;
  const duration = req.duration;
  try {
    const enqueued = await enqueueId({ id, duration, sendResponse: res });
    res.send(enqueued.message);
  } catch (e) {
    console.error(e);
    res.send(e.message);
  }
};

module.exports = makeStart;
