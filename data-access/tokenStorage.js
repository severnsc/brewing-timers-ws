const request_cb = require("request");
const util = require("util");

const request = util.promisify(request_cb);

const getToken = () => {
  const options = {
    method: "POST",
    url: "https://severnsc.auth0.com/oauth/token",
    headers: { "content-type": "application/json" },
    body: `{"client_id":"${process.env.CLIENT_ID}","client_secret":"${process.env.CLIENT_SECRET}","audience":"https://brewing-timers.herokuapp.com","grant_type":"client_credentials"}`
  };

  return request(options)
    .then(response => {
      const body = JSON.parse(response.body);
      return body.access_token;
    })
    .catch(error => error);
};

module.exports = Object.freeze({
  getToken
});
