const makeStart = (enqueueId) => async (req, res) => {
  const id = req.id;
  const duration = req.duration;
  const alerts = req.alerts;
  try {
    const enqueued = await enqueueId({
      id,
      duration,
      alerts,
      sendResponse: res,
    });
    res.send(enqueued.message);
  } catch (e) {
    console.error(e);
    res.send(e.message);
  }
};

module.exports = makeStart;
