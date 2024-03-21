const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/', {
      target: process.env.NEXT_PUBLIC_API_URL,
      changeOrigin: true,
      secure: false
    }),
  );
};