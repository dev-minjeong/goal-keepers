'use client';

// import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/index.js';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  deleteEventIdCookie,
  handleConfirmToken,
  setEventIdCookie,
} from './actions';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { EventSourcePolyfill, NativeEventSource } from 'event-source-polyfill';
import { tokenValue } from './alarm/actions';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import PullToRefresh from 'react-simple-pull-to-refresh';

const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

function RootLayout({ children }: { children: React.ReactNode }) {
  const [eventId, setEventId] = useState<string>('');
  const [markAlarm, setMarkAlarm] = useState<boolean>(false);

  const pathname = usePathname();
  const router = useRouter();
  const loginPath = [
    '/login',
    '/register',
    '/forgot-password',
    '/find',
    '/social-register',
    '/redirection',
  ];

  useEffect(() => {
    const fetchData = async () => {
      const tokenData = await handleConfirmToken();
      if (!tokenData && !loginPath.includes(pathname)) {
        router.push('/login');
      }
    };
    fetchData();
  }, [pathname]);

  useEffect(() => {
    setScreenSize();
  }, []);

  useEffect(() => {
    const getToken = async () => {
      try {
        const result = await tokenValue();
        return result;
      } catch (error) {
        console.error('Error fetching token:', error);
        return null;
      }
    };

    let eventSource: any;

    const initializeEventSource = async () => {
      const token = await getToken();
      if (!token) {
        console.error('Token is null');
        return;
      }

      console.log('Last-Event-Id: ' + eventId);
      const EventSource = EventSourcePolyfill || NativeEventSource;
      const eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_API_URL}/subscribe`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Connetction: 'keep-alive',
            Accept: 'text/event-stream',
            'Last-Event-Id': eventId,
          },
          heartbeatTimeout: 86400000,
        },
      );

      try {
        eventSource.addEventListener('sse', (event: any) => {
          const { lastEventId: lastEventId, data: receivedConnectData } = event;
          console.log('Current Event Id: ' + lastEventId);
          console.log(receivedConnectData);
          if (receivedConnectData.charAt(0) !== 'E') {
            setMarkAlarm(true);
          } else {
            setMarkAlarm(false);
          }
          setEventId(lastEventId); // 임시로 해둔 것, 쿠키같은곳에 저장
          setEventIdCookie(lastEventId);
        });

        eventSource.onerror = (e: any) => {
          // 종료 또는 에러 발생 시 할 일
          eventSource.close();

          if (e.error) {
            // 에러 발생 시 할 일
          }

          if (e.target.readyState === EventSource.CLOSED) {
            // 종료 시 할 일
          }
        };
      } catch (error) {}
    };

    initializeEventSource();
    return () => {
      console.log('SSE CLOSED 2');

      deleteEventIdCookie();

      eventSource !== undefined && eventSource.close(); // 로그아웃 될 때 eventId 삭제와 eventSource.close()도 실행되게 하기
    };
  }, []);

  function setScreenSize() {
    const wrapElement: any = document.querySelector('.wrap');
    wrapElement.style.height = window.innerHeight + 'px';
  }

  const handleRefresh = async () => {
    window.location.reload();
  };

  return (
    <Provider store={store}>
      <html lang="en">
        <body className={`${inter.className} wrap h-full `}>
          <PullToRefresh onRefresh={handleRefresh}>
            <>
              <main className="h-[calc(100%-56px)] w-full flex flex-col	items-center justify-center">
                {pathname === '/' && (
                  <header className="w-full flex flex-col items-end mr-5 mb-6">
                    <Link href={'/alarm'}>
                      <div
                        className="flex mr-2"
                      >
                        <FontAwesomeIcon
                          icon={faBell}
                          className="w-5 h-5 text-gray-500"
                        />
                        {markAlarm ? (
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        ) : (
                          <div className="w-1 h-1"></div>
                        )}
                      </div>
                    </Link>
                  </header>
                )}
                <>{children}</>
              </main>
              {loginPath.includes(pathname) || <Navbar></Navbar>}
              <div id="portal"></div>
            </>
          </PullToRefresh>
        </body>
      </html>
    </Provider>
  );
}

export default RootLayout;
