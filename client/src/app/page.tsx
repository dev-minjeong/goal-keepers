'use client';

import {
  CreateButton,
  GoalModal,
  MyGoals,
  MyPosts,
} from '@/components/index.js';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { selectRender } from '@/redux/renderSlice';
import { handleGetAGoal } from './actions';

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
    completeDate: string | null;
    completed: boolean;
    isShare: boolean;
    joinMemberList: string[];
    nickname: string;
  } | null>(null);
  const [myGoalList, setMyGoalList] = useState<any[]>([]);
  const containerEl = useRef<any>();
  const [goalDoing, setGoalDoing] = useState<string>('doing');

  const reduxAlarmData = useSelector(selectRender);

  useEffect(() => {
    if (reduxAlarmData.alarmBoolean) {
      setIsMyGoals(false);
    }
  }, [reduxAlarmData.alarmBoolean]);

  useEffect(() => {
    selectGoalNum !== null ? setOpen(true) : setOpen(false);
    if (selectGoalNum !== null) {
      setOpen(true);
      // setSelectData(myGoalList[selectGoalNum]);
      onSelectedData(selectGoalNum);
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

  const onSelectedData = async (id: number) => {
    const formData = {
      goalId: id,
    };
    const response = await handleGetAGoal(formData);
    if (response.success) {
      setSelectData(response.data);
    }
  };

  return (
    <div
      className="flex flex-col	w-full h-5/6 items-center justify-center"
      ref={containerEl}
    >
      <section className="w-11/12 h-full text-white">
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
            goalDoing={goalDoing}
            setGoalDoing={setGoalDoing}
          ></MyGoals>
        ) : (
          <MyPosts></MyPosts>
        )}
      </section>
      <CreateButton isMyGoals={isMyGoals}></CreateButton>
      {isOpen && portalElement
        ? createPortal(
            <GoalModal
              setOpen={setOpen}
              selectData={selectData}
              setSelectGoalNum={setSelectGoalNum}
              goalDoing={goalDoing}
            />,
            portalElement,
          )
        : null}
    </div>
  );
}
