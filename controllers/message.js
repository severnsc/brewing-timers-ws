const START = "start";
const STOP = "stop";

const makeMessage = ({ startController, stopController }) => (req, res) => {
  const type = req.type;
  if (!type) {
    return res.send("Request must include type");
  }
  if (![START, STOP].includes(type)) {
    return res.send("Request type must be one of either start or stop");
  }
  if (type === START) {
    startController(req, res);
  } else {
    stopController(req, res);
  }
};

module.exports = makeMessage;
