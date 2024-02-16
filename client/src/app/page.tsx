'use client';

import {
  CreateButton,
  GoalModal,
  MyGoals,
  MyPosts,
} from '@/components/index.js';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { StaticImageData } from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { selectRender } from '@/redux/renderSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function Home() {
  const [isMyGoals, setIsMyGoals] = useState(true);
  const [isOpen, setOpen] = useState(false);
  const [portalElement, setPortalElement] = useState<Element | null>(null);
  const [selectGoalNum, setSelectGoalNum] = useState<number | null>(null);
  const [selectData, setSelectData] = useState<{
    imageUrl: any;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    shareCnt: number;
    goalId: number;
  } | null>(null);
  const [myGoalList, setMyGoalList] = useState<any[]>([]);
  const containerEl = useRef<any>();

  useEffect(() => {
    selectGoalNum !== null ? setOpen(true) : setOpen(false);
    if (selectGoalNum !== null) {
      setOpen(true);
      setSelectData(myGoalList[selectGoalNum]);
    } else {
      setOpen(false);
      setSelectData(null);
    }
  }, [selectGoalNum]);

  useEffect(() => {
    setPortalElement(document.getElementById('portal'));
  }, [isOpen]);

  const handleTab = (boolean: boolean) => {
    setIsMyGoals(boolean);
  };

  return (
    <div
      className="flex flex-col	w-full h-full items-center justify-center"
      ref={containerEl}
    >
      <header className="w-full flex flex-col items-end mr-5 mb-6">
        <Link href={'/alarm'}>
          <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-gray-500" />
        </Link>
      </header>
      <section className="w-11/12 h-5/6 text-white">
        <nav className="w-full h-10">
          <ul className="flex h-full">
            <li
              className={`w-1/2 ${
                isMyGoals
                  ? `bg-white border-x border-t border-orange-300 text-orange-500 `
                  : `bg-orange-100 border-b border-orange-300 text-orange-300 `
              } `}
            >
              <button
                className="w-full h-full pr-3"
                onClick={() => handleTab(true)}
              >
                나의 목표
              </button>
            </li>
            <li
              className={`w-1/2 ${
                !isMyGoals
                  ? `bg-white border-x border-t border-orange-300 text-orange-500 `
                  : `bg-orange-100 border-b border-orange-300 text-orange-300 `
              } `}
            >
              <button
                className="w-full h-full pr-3 "
                onClick={() => handleTab(false)}
              >
                나의 포스트
              </button>
            </li>
          </ul>
        </nav>
        {isMyGoals ? (
          <MyGoals
            myGoalList={myGoalList}
            setSelectGoalNum={setSelectGoalNum}
            setMyGoalList={setMyGoalList}
          ></MyGoals>
        ) : (
          <MyPosts
            myGoalList={myGoalList}
            setSelectGoalNum={setSelectGoalNum}
            setMyGoalList={setMyGoalList}
          ></MyPosts>
        )}
      </section>
      <CreateButton></CreateButton>
      {isOpen && portalElement
        ? createPortal(
            <GoalModal
              setOpen={setOpen}
              selectData={selectData}
              setSelectGoalNum={setSelectGoalNum}
            />,
            portalElement,
          )
        : null}
    </div>
  );
}
