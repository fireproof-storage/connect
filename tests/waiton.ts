import waitOn from "wait-on";
const opts = {
  resources: ["http://localhost:8888/", "http://localhost:1999/", "http://localhost:8787/", "http://localhost:9000/"],
  delay: 0, // initial delay in ms, default 0
  interval: 500, // poll interval in ms, default 250ms
  simultaneous: 4, // limit to 1 connection per resource at a time
  timeout: 60000, // timeout in ms, default Infinity
  strictSSL: false,
  followRedirect: true,
  validateStatus: (status: number) => {
    return status >= 200 && status < 599; // default if not provided
  },
};

// Usage with callback function
waitOn(opts, function (err) {
  if (err) {
    process.exit(1);
  }
  process.exit(0);
});
