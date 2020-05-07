const https = require("https");
const getToken = (cb) => {
  const url = process.env.AUTH0_URL;
  const body = {
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: process.env.AUTH0_AUDIENCE,
    grant_type: "client_credentials",
  };
  const options = {
    method: "POST",
    headers: { "content-type": "application/json" },
  };

  const req = https.request(url, options, function (res) {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding("utf8");
    res.on("data", (chunk) => {
      cb(chunk);
    });
    res.on("end", () => {
      console.log("No more data in response.");
    });
  });
  req.on("error", (e) => {
    console.error(`problem with request: ${e.message}`);
  });
  req.write(JSON.stringify(body));
  req.end();
};
module.exports = getToken;
