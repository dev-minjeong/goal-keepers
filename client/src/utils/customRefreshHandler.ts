// import { useCallback } from "react";

// const customRefreshHandler = useCallback(async () => {
//   if (!CSS.supports('overscroll-behavior-y', 'contain')) {
//     alert("Your browser doesn't support overscroll-behavior :(");
//   }

//   // 브라우저 기본 제공 PTR 막기
//   window.pulltorefresh = false;
//   let initialX: number | null = null,
//     initialY: number | null = null;

//   // 사용자의 최초 터치 위치 저장
//   function initTouch(e: any) {
//     initialX = e.touches ? e.touches[0].clientX : e.clientX;
//     initialY = e.touches ? e.touches[0].clientY : e.clientY;
//   }
//   let dir = '';
//   const swipeDirection = (e: any) => {
//     let result = '';
//     if (initialX !== null && initialY !== null) {
//       const currentX = e.touches ? e.touches[0].clientX : e.clientX,
//         currentY = e.touches ? e.touches[0].clientY : e.clientY;

//       // 사용자의 최초 터치 위치와 현재 위치의 차이 값
//       let diffX = initialX - currentX,
//         diffY = initialY - currentY;

//       // x 축 차이 값이 y 축 차이 값 보다 크고, x 축 차이 값이 0 보다 큰 경우
//       // --> 왼쪽으로 스와이프
//       // x 축 차이 값이 y 축 차이 값 보다 크고, x 축 차이 값이 0 보다 작은 경우
//       // --> 오른쪽으로 스와이프
//       // y 축 차이 값이 x 축 차이 값 보다 크고, y 축 차이 값이 0 보다 큰 경우
//       // --> 위쪽으로 스와이프
//       // y 축 차이 값이 x 축 차이 값 보다 크고, y 축 차이 값이 0 보다 작은 경우
//       // --> 아래쪽으로 스와이프

//       Math.abs(diffX) > Math.abs(diffY)
//         ? 0 < diffX
//           ? (dir = 'to left')
//           : (dir = 'to right')
//         : 0 < diffY
//         ? (dir = 'to top')
//         : (dir = 'to bottom');

//       initialX = null;
//       initialY = null;
//     }
//     return dir;
//   };

//   // 모바일 환경에서 터치 액션에 이벤트를 추가한다.
//   // 드래그 움직임의 스와이프 방향을 읽기 위한 이벤트도 추가한다.
//   window.addEventListener('touchstart', initTouch);
//   window.addEventListener('touchmove', swipeDirection);

//   // 커스텀 PTR 애니메이션을 위한 핸들러
//   // PTR 작동 시 커스텀 애니메이션을 위해 필요한 클래스를 body 에 추가한다.
//   // 페이지 새로고침 후 추가한 클래스를 삭제한다.
//   async function simulateRefreshAction() {
//     const sleep = (timeout: number) =>
//       new Promise((resolve) => setTimeout(resolve, timeout));

//     const transitionEnd = function (propertyName: string, node: any) {
//       return new Promise((resolve) => {
//         function callback(e: any) {
//           e.stopPropagation();
//           if (e.propertyName === propertyName) {
//             node.removeEventListener('transitionend', callback);
//             resolve(e);
//           }
//         }
//         node.addEventListener('transitionend', callback);
//       });
//     };

//     const refresher: Element = document.querySelector('.refresher')!;

//     document.body.classList.add('refreshing');
//     await sleep(2000);

//     refresher.classList.add('shrink');
//     await transitionEnd('transform', refresher);
//     refresher.classList.add('done');
//     window.pulltorefresh = false;
//     location.reload();

//     refresher.classList.remove('shrink');
//     document.body.classList.remove('refreshing');
//     await sleep(0); // let new styles settle.
//     refresher.classList.remove('done');
//   }

//   let _startY = 0;

//   const inbox: Element = document.querySelector('#inbox')!;

//   inbox.addEventListener(
//     'touchstart',
//     (e: any) => {
//       _startY = e.touches[0].pageY;
//       initTouch(e);
//     },
//     { passive: true },
//   );
//   inbox.addEventListener(
//     'touchmove',
//     (e: any) => {
//       const y = e.touches[0].pageY;
//       // 현재 스크롤 위치가 최상단이며, 스와이프 방향이 아래쪽 스와이프일 때 PTR을 실행한다.
//       if (
//         document.scrollingElement?.scrollTop === 0 &&
//         y > _startY &&
//         !document.body.classList.contains('refreshing') &&
//         dir === 'to bottom'
//       ) {
//         dir = '';
//         window.pulltorefresh = true;
//         simulateRefreshAction();
//       } else {
//         dir = '';
//       }
//     },
//     { passive: true },
//   );
// }, []);