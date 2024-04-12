'use client';

import Link from 'next/link';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUsers,
  faUserCircle,
  faBorderAll,
} from '@fortawesome/free-solid-svg-icons';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();
  const mainPathnameList = ['/'];
  const communityPathnameList = ['/community'];
  const myPagePathnameList = ['/my-page', '/my-page/account'];
  const listName = 'text-xs w-6 h-6 text-center';
  return (
    <nav className="w-full max-w-[400px] bg-gray-600 fixed h-14 px-4">
      <ul className=" w-full h-full flex bottom-0  justify-around items-center">
        <li className={listName}>
          <Link
            href={'/'}
            className={`w-full h-full flex flex-col item-center justify-center text-center`}
          >
            <FontAwesomeIcon
              icon={faHome}
              className={`${
                mainPathnameList.includes(pathname)
                  ? 'text-orange-400'
                  : 'text-gray-400'
              } w-full h-full `}
            />
          </Link>
        </li>
        <li className={listName}>
          <Link
            href={'/post'}
            className={`w-full h-full flex flex-col item-center justify-center text-center`}
          >
            <FontAwesomeIcon
              icon={faBorderAll}
              className={`${
                pathname === '/post' ? 'text-orange-400' : 'text-gray-400'
              } w-full h-full `}
            />
          </Link>
        </li>
        <li className={listName}>
          <Link
            href={'/community'}
            className={`w-full h-full flex flex-col item-center justify-center text-center`}
          >
            <FontAwesomeIcon
              icon={faUsers}
              className={`${
                communityPathnameList.includes(pathname)
                  ? 'text-orange-400'
                  : 'text-gray-400'
              } w-full h-full `}
            />
          </Link>
        </li>
        <li className={listName}>
          <Link
            href={'/my-page'}
            className={`w-full h-full flex flex-col item-center justify-center text-center`}
          >
            <FontAwesomeIcon
              icon={faUserCircle}
              className={`${
                myPagePathnameList.includes(pathname)
                  ? 'text-orange-400'
                  : 'text-gray-400'
              } w-full h-full `}
            />
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
