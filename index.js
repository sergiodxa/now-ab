require('now-env');

const { parse, format } = require('url');
const { createServer } = require('http');
const { createProxy } = require('http-proxy');

const HOST = process.env.HOST || 'localhost';
const PORT = Number(process.env.PORT) || 3000;

// get the list of tes cases urls
const testCases = Object.entries(process.env)
  .filter(([key]) => key.startsWith('TEST_'))
  .reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

// create a proxy
const proxy = createProxy({
  changeOrigin: true,
  target: {
    https: true
  }
});

// parse cookies from headers
const parseCookies = req => {
  const list = {};
  const rc = req.headers.cookie;

  rc &&
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

  return list;
};

// get the test URL to proxy
const getTestURL = (res, cookies = {}) => {
  const cases = Object.keys(testCases);
  if (!cookies.now_ab) {
    const random = Math.floor(Math.random() * cases.length);
    const testCase = cases[random];
    // set the cookie now_ab with the random
    // (don't let the user know the internal url)
    res.setHeader('Set-Cookie', [`now_ab=${testCase}`]);
    return testCases[testCase];
  }
  return testCases[cookies.now_ab];
};

// run the HTTP Proxy server
createServer((req, res) => {
  const cookies = parseCookies(req);
  const url = parse(req.url);

  // get the url host from cookies if it's possible or random
  url.host = getTestURL(res, cookies);

  // if it's not defined anymore (we removed the test) just get it again random
  if (url.host === undefined) {
    url.host = getTestURL(res);
  }

  console.log(`Proxying to ${url.host}`);

  // format the url host
  const target = format(url);

  // proxy to the specific target
  return proxy.web(req, res, { target });
}).listen(PORT, error => {
  if (error) {
    console.error(error);
    return process.exit(0);
  }
  console.log('A/B Test Server running on %s:%d', HOST, PORT);
  console.log('Cases:', JSON.stringify(testCases, null, 2));
});
