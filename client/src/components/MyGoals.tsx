'use client';

import Image from 'next/image';
import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Image1 from '../../public/assets/images/goalKeepers.png';
import { useDispatch, useSelector } from 'react-redux';
import { selectRender } from '@/redux/renderSlice';
import { handleGetGoalListAll } from '@/app/actions';
import { setStateGoal } from '@/redux/renderSlice';

interface myGoalListTypes {
  goalId: number;
  title: string;
  description: string;
  imageUrl: any;
  startDate: string;
  endDate: string;
  shareCnt: number;
  completeDate: string;
  completed: boolean;
  isShare: boolean;
  joinMemberList: string[];
  nickname: string;
}
const MyGoals: React.FC<{
  myGoalList: myGoalListTypes[];
  setSelectGoalNum: React.Dispatch<SetStateAction<number | null>>;
  setMyGoalList: any;
  goalDoing: string;
  setGoalDoing: React.Dispatch<SetStateAction<string>>;
}> = ({
  myGoalList,
  setSelectGoalNum,
  setMyGoalList,
  goalDoing,
  setGoalDoing,
}) => {
  const [pageable, setPageable] = useState({
    pageNumber: 1,
    last: false,
  });
  const [more, setMore] = useState<boolean>(false);
  const [doneGoalList, setDoneGoalList] = useState<any>();
  const containerRef = useRef<any>(null);

  const dispatch = useDispatch();
  const reduxGoalData = useSelector(selectRender);

  useEffect(() => {
    handleFetchGoalListAll(pageable.pageNumber);
  }, []);
  useEffect(() => {
    if (reduxGoalData.goalBoolean === true) {

      goalDoing === 'doing' ? handleFetchGoalListAll(1) : onDoneGoal();

      dispatch(setStateGoal(false));
    }
  }, [reduxGoalData.goalBoolean]);

  useEffect(() => {
    if (more) {
      handleCheckLastPage();
    }
  }, [more]);
  useEffect(() => {}, [myGoalList]);

  useEffect(() => {
    if (goalDoing === 'done') onDoneGoal();
  }, [goalDoing]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll);
      return () =>
        containerRef.current.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll('.goal-element');

      if (elements.length > 0) {
        const lastElement = elements[elements.length - 1];

        const lastElementBottom = lastElement.getBoundingClientRect().bottom;
        const parentElementBottom =
          lastElement.parentElement.getBoundingClientRect().bottom;

        if (lastElementBottom - parentElementBottom < -20) {
          setMore(true);
        }
      }
    }
  }, []);

  const handleFetchGoalListAll = async (pageParam: number) => {
    const form = { pageNum: pageParam };
    try {
      const response = await handleGetGoalListAll(form);

      if (response.data) {
        if (more) {
          setMyGoalList((prevPostData: any) => [
            ...prevPostData,
            ...response.data.content,
          ]);
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            last: response.data.last,
          });
        } else {
          setMyGoalList(response.data.content);
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            last: response.data.last,
          });
        }

        setMore(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectGoalClick = (index: number) => {
    setSelectGoalNum(index);
  };

  const handleCheckLastPage = () => {
    const pageNumber = pageable.pageNumber + 1;
    if (pageable.last) {
      console.log('마지막 페이지 입니다.');
    } else {
      handleFetchGoalListAll(pageNumber);
    }
  };

  const onDoneGoal = () => {
    const doneGoalList = myGoalList.filter((item) => item.completed === true);

    const groupedByYear: { [year: string]: any[] } = doneGoalList.reduce(
      (result, goal) => {
        const year = new Date(goal.completeDate).getFullYear().toString();

        if (!result[year]) {
          result[year] = [];
        }

        result[year].push(goal);

        return result;
      },
      {} as { [year: string]: any[] },
    );
    const groupedByYearArray = Object.entries(groupedByYear).map(
      ([year, goals]) => ({
        year,
        goals,
      }),
    );

    setDoneGoalList(groupedByYearArray);
  };

  return (
    <div className="w-full h-[calc(100%-40px)] border-x border-b border-orange-300">
      <div className="flex gap-4 justify-end mt-2 mr-4 h-6">
        <div className="flex items-center">
          <input
            type="radio"
            id="doing"
            name="goal"
            value="doing"
            checked={goalDoing === 'doing'}
            onChange={() => setGoalDoing('doing')}
            className="bg-white border-2 border-orange-300 appearance-none w-3.5 h-3.5	rounded-full checked:bg-orange-300"
          ></input>
          <label
            className="ms-2 text-sm font-medium text-gray-600 dark:text-gray-300"
            htmlFor="doing"
          >
            진행 중
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            id="done"
            name="goal"
            value="done"
            checked={goalDoing === 'done'}
            onChange={() => setGoalDoing('done')}
            className="bg-white border-2 border-orange-300 appearance-none w-3.5 h-3.5	rounded-full checked:bg-orange-300"
          ></input>
          <label
            className="ms-2 text-sm font-medium text-gray-600 dark:text-gray-300"
            htmlFor="done"
          >
            완료
          </label>
        </div>
      </div>
      <div className="w-full h-[calc(100%-24px)] overflow-y-scroll">
        <ul
          className={`w-full  px-3  ${
            goalDoing === 'doing'
              ? 'flex flex-row flex-wrap gap-2 py-5'
              : 'pb-5'
          }`}
          ref={containerRef}
        >
          {goalDoing === 'doing'
            ? myGoalList.map((list, index) => {
                if (!list.completed) {
                  return (
                    <li
                      key={index}
                      className={` w-[95px] h-[95px] bg-white relative flex items-center justify-center goal-element`}
                      onClick={() => handleSelectGoalClick(list.goalId)}
                    >
                      <Image
                        src={list.imageUrl === null ? Image1 : list.imageUrl}
                        alt=""
                        fill
                        style={{
                          objectFit: 'cover',
                          position: 'absolute',
                        }}
                      ></Image>
                      <div className="w-full h-full bg-black opacity-50 absolute"></div>
                      <h3 className="text-white absolute text-center">
                        {list.title}
                      </h3>
                    </li>
                  );
                }
              })
            : doneGoalList?.map((data: any, i: number) => {
                return (
                  <li
                    key={i}
                    className={`text-gray-600 flex flex-col w-full h-[${
                      95 * Math.floor(data.goals.length / 3) + 1 + 45
                    }px]`}
                  >
                    <hr className="my-6 border-dashed" />
                    <h2 className="h-8 font-semibold">{data.year}</h2>
                    <ul className="flex w-full flex-wrap gap-2">
                      {data.goals.map((list: any, index: number) => {
                        return (
                          <li
                            key={index}
                            className={`w-[95px] h-[95px] bg-white relative flex items-center justify-center goal-element `}
                            onClick={() => handleSelectGoalClick(list.goalId)}
                          >
                            <Image
                              src={
                                list.imageUrl === null ? Image1 : list.imageUrl
                              }
                              alt=""
                              fill
                              style={{
                                objectFit: 'cover',
                                position: 'absolute',
                              }}
                            ></Image>
                            <div className="w-full h-full bg-black opacity-50 absolute"></div>
                            <h3 className="text-white absolute">
                              {list.title}
                            </h3>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
        </ul>
      </div>
    </div>
  );
};
export default MyGoals;
