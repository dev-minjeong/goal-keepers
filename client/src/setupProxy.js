const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // '/' 경로에 대한 프록시 설정(HTTP)
  app.use(
    '/',
    createProxyMiddleware({
      target: process.env.NEXT_PUBLIC_API_URL,
      changeOrigin: true,
    })
  );
};