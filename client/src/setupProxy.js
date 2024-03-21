const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/', {
      target: process.env.NEXT_PUBLIC_API_URL,
      changeOrigin: true,
    }),
  );

  // '/subscribe' 경로에 대한 프록시 설정(HTTPS)
  app.use(
    '/subscribe',
    createProxyMiddleware({
      target: process.env.NEXT_PUBLIC_API_URL_HTTPS, // HTTPS 프로토콜로 대상 서버 설정
      changeOrigin: true, // 대상 서버의 주소를 변경하여 프록시 요청을 보냄
      secure: false // HTTPS 프로토콜을 사용하도록 설정
    })
  );
};