'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  handleDeleteAlarm,
  handleGetAlarm,
  handlePostCommentAlarm,
} from './actions';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectRender,
  setStateAlarm,
  setStateAlarmTarget,
} from '@/redux/renderSlice';
import {
  setCommentId,
  setCommentPage,
  setTargetId,
  setTargetPage,
} from '@/redux/alarmDataSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

interface alarmContentTypes {
  notificationId: number;
  receiverId: number;
  giverId: null | number;
  giverNickname: null | string;
  type: string;
  targetId: null | number;
  targetTitle: null | string;
  message: string | null;
  commentId: null | number;
}

const Alarm = () => {
  const [focusMenu, setFocusMenu] = useState(0);
  const [alarmContent, setAlarmContent] = useState<alarmContentTypes[]>([]);
  const [pageable, setPageable] = useState({
    pageNumber: 1,
    last: false,
  });
  const [isDeleteCheck, setIsDeleteCheck] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [deleteList, setDeleteList] = useState<number[]>([]);
  const [isFocus, setIsFocus] = useState<number | null>(null);

  const dispatch = useDispatch();
  const reduxAlarmData = useSelector(selectRender);
  const router = useRouter();

  useEffect(() => {
    onGetAlarmData();
  }, [focusMenu, reduxAlarmData.alarmBoolean]);

  const menu = [
    { name: '전체', type: 'ALL' },
    { name: '알림', type: 'ALARM' },
    { name: '공지', type: 'NOTIFY' },
    { name: '좋아요', type: 'LIKE' },
    { name: '응원', type: 'CHEER' },
    { name: '댓글', type: 'COMMENT' },
    { name: '공유', type: 'SHARE' },
  ];
  const profileColors = [
    { color: 'bg-fuchsia-400', type: 'ALARM' },
    { color: 'bg-blue-400', type: 'NOTIFY' },
    { color: 'bg-amber-400', type: 'LIKE' },
    { color: 'bg-green-400', type: 'CHEER' },
    { color: 'bg-rose-400', type: 'COMMENT' },
    { color: 'bg-violet-400', type: 'SHARE' },
  ];

  const onGetAlarmData = async () => {
    const formData = {
      pageNum: pageable.pageNumber,
      type: menu[focusMenu].type,
    };

    const response = await handleGetAlarm(formData);

    if (response.success) {
      setAlarmContent(response.data.content);
      setPageable({
        pageNumber: response.data.pageable.pageNumber + 1,
        last: response.data.last,
      });
    }
  };

  const onDeleteAlarm = async () => {
    if (deleteList.length === 0) {
      alert('삭제할 알림을 선택해주세요.');
    } else {
      const confirm = window.confirm('선택한 알림을 삭제하시겠습니까?');
      let isAll;
      if (focusMenu == 0) {
        alarmContent.length === deleteList.length
          ? (isAll = true)
          : (isAll = false);
      } else {
        isAll = false;
      }
      const formData = {
        all: isAll,
        deleteList: deleteList,
      };
      if (confirm) {
        const response = await handleDeleteAlarm(formData);
        if (response.success) {
          window.alert(response.message);
          return dispatch(setStateAlarm(!reduxAlarmData.alarmBoolean));
        }
      }
    }
  };

  const onGetAlarmTarget = async (
    targetId: number | null,
    commentId: number | null,
  ) => {
    const formData = {
      type: 'COMMENT',
      targetId: targetId,
      commentId: commentId,
    };
    // console.log(formData);
    const response = await handlePostCommentAlarm(formData);


    if (response.success) {
      const targetData = response.data;
      dispatch(setTargetId(targetData.targetId));
      dispatch(setTargetPage(targetData.targetPage));
      dispatch(setCommentId(targetData.commentId));
      dispatch(setCommentPage(targetData.commentPage));

      dispatch(setStateAlarmTarget(true));
      router.push('/');
    }
  };

  const existNumber = (notificationId: number) => {
    const isNumberExist = (number: number) => deleteList.includes(number);

    const removeNumber = (numberToRemove: number) => {
      const updatedNumbers = deleteList.filter(
        (number) => number !== numberToRemove,
      );

      setDeleteList(updatedNumbers);
    };

    if (isNumberExist(notificationId)) {
      removeNumber(notificationId);
    }
  };

  const CheckBox = ({ notificationId }: { notificationId: number | null }) => {
    return (
      <div className="inline-flex items-center ">
        <label
          className="relative flex items-center p-1 rounded-full cursor-pointer"
          htmlFor="check"
        >
          <input
            type="checkbox"
            checked={
              notificationId === null
                ? isDeleteCheck
                : deleteList.includes(notificationId)
            }
            className=" peer relative h-4 w-4 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all  checked:border-gray-400 checked:bg-gray-400 checked:before:bg-gray-400 hover:before:opacity-10"
            id="check"
            onChange={(e) => {
              if (notificationId === null) {
                setIsDeleteCheck(e.target.checked);
                if (e.target.checked) {
                  setDeleteList(
                    alarmContent.map((item) => item.notificationId),
                  );
                } else {
                  setDeleteList([]);
                }
              } else {
                setIsDeleteCheck(false);
                deleteList.includes(notificationId)
                  ? existNumber(notificationId)
                  : setDeleteList([...deleteList, notificationId]);
              }
            }}
          />
          <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </span>
        </label>
      </div>
    );
  };
  return (
    <div className="w-full h-full mt-[20%]">
      <header className="overflow-x-scroll w-full pl-[6%] scrollbar-hide alarm-menu h-[10%]">
        <ul className="flex justify-between p-3 w-[130%]">
          {menu.map((data, index) => {
            return (
              <li
                key={index}
                onClick={() => setFocusMenu(index)}
                className={`${
                  focusMenu === index ? 'bg-orange-300 h-10 font-bold' : ''
                } rounded-full flex justify-center items-center w-16`}
              >
                <p className={`${focusMenu === index ? 'text-white' : ''}`}>
                  {data.name}
                </p>
              </li>
            );
          })}
        </ul>
      </header>
      <main className="px-[3%] h-[calc(90%-52px)] w-full pb-5">
        <section className="w-full h-6 my-4 flex justify-end px-4 items-center">
          <div className="flex items-center gap-1">
            {isEdit ? (
              <>
                <CheckBox notificationId={null}></CheckBox>
                <button
                  className={`px-2 py-[3px] text-xs text-white bg-red-400`}
                  onClick={() => onDeleteAlarm()}
                >
                  삭제
                </button>
                <button
                  className={`px-2 py-[3px] text-xs text-white bg-gray-400`}
                  onClick={() => setIsEdit(false)}
                >
                  취소
                </button>
              </>
            ) : (
              <button
                className={`px-2 py-[3px] text-xs text-white bg-gray-400`}
                onClick={() => setIsEdit(true)}
              >
                편집
              </button>
            )}
          </div>
        </section>
        <section className="h-full overflow-y-scroll w-full px-[6%] pb-10">
          <ul className=" flex flex-col gap-4 ">
            {focusMenu === 0 ? (
              alarmContent.map((data, index) => {
                let menuType;
                let menuColorType;
                if (
                  data.type === 'TODAY' ||
                  data.type === 'DAYLEFT' ||
                  data.type === 'WEEKLEFT'
                ) {
                  menuType = menu.find((item) => item.type === 'ALARM');
                  menuColorType = profileColors.find(
                    (item) => item.type === 'ALARM',
                  );
                } else {
                  menuType = menu.find((item) => item.type === data.type);
                  menuColorType = profileColors.find(
                    (item) => item.type === data.type,
                  );
                }

                return (
                  <li key={index} className="w-full flex">
                    {isEdit && (
                      <CheckBox notificationId={data.notificationId}></CheckBox>
                    )}
                    <div className="flex flex-col w-full">
                      <div
                        className="h-20 w-full bg-neutral-100 rounded-xl flex items-center px-[5%] py-[3%] gap-2 justify-between"
                        onClick={() => {
                          if (data.type === 'COMMENT') {
                            onGetAlarmTarget(data.targetId, data.commentId);
                          } else if (data.type === 'NOTIFY') {
                            isFocus === index
                              ? setIsFocus(null)
                              : setIsFocus(index);
                          }
                        }}
                      >
                        <div className="w-12">
                          <div
                            className={`h-[78%] aspect-square	mr-[4%] flex items-center justify-center rounded-full 
                          ${menuColorType?.color}
                          	`}
                          >
                            <h2 className="text-white text-base font-semibold	">
                              {menuType?.name}
                            </h2>
                          </div>
                        </div>

                        <div className="flex-1 h-full flex flex-col">
                          {data.giverNickname !== null ? (
                            <div className="w-full flex justify-end">
                              <div className=" px-1 py-[1px] bg-orange-200">
                                <p className="text-[11px] text-gray-600 font-medium	">
                                  "{data.giverNickname}" 님
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="h-4 mb-[3px]"></div>
                          )}
                          <h3 className="text-base font-extrabold truncate w-full ">
                            {data.targetTitle === null
                              ? data.message
                              : data.targetTitle}
                          </h3>
                          {data.type === 'NOTIFY' && (
                            <div className="w-[calc(100%-54px)] flex justify-center">
                              <button className="w-3">
                                <FontAwesomeIcon
                                  className="text-xs"
                                  icon={
                                    isFocus === index ? faCaretUp : faCaretDown
                                  }
                                ></FontAwesomeIcon>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {isFocus === index && (
                        <div className="p-3 text-sm text-neutral-500">
                          <p>{data.message}</p>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <>
                {alarmContent.map((data, index) => {
                  let menuType;
                  let menuColorType;
                  if (
                    data.type === 'TODAY' ||
                    data.type === 'DAYLEFT' ||
                    data.type === 'WEEKLEFT'
                  ) {
                    menuType = menu.find((item) => item.type === 'ALARM');
                    menuColorType = profileColors.find(
                      (item) => item.type === 'ALARM',
                    );
                  } else {
                    menuType = menu.find((item) => item.type === data.type);
                    menuColorType = profileColors.find(
                      (item) => item.type === data.type,
                    );
                  }
                  if (menuType?.type === menu[focusMenu].type) {
                    return (
                      <li key={index} className="w-full flex">
                        {isEdit && (
                          <CheckBox
                            notificationId={data.notificationId}
                          ></CheckBox>
                        )}
                        <div className="flex flex-col w-full">
                          <div
                            className="h-20 bg-neutral-100 rounded-xl flex items-center px-[5%] py-[3%] gap-2 justify-between"
                            onClick={() => {
                              if (data.type === 'COMMENT') {
                                onGetAlarmTarget(data.targetId, data.commentId);
                              } else if (data.type === 'NOTIFY') {
                                isFocus === index
                                  ? setIsFocus(null)
                                  : setIsFocus(index);
                              }
                            }}
                          >
                            <div className="w-12">
                              <div
                                className={`h-[78%] aspect-square	mr-[4%] flex items-center justify-center rounded-full 
                          ${menuColorType?.color}
                          	`}
                              >
                                <h2 className="text-white text-base font-semibold	">
                                  {menuType?.name}
                                </h2>
                              </div>
                            </div>

                            <div className="flex-1 h-full flex flex-col">
                              {data.giverNickname !== null ? (
                                <div className="w-full flex justify-end">
                                  <div className=" px-1 py-[1px] bg-orange-200">
                                    <p className="text-[11px] text-gray-600 font-medium	">
                                      "{data.giverNickname}" 님
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-4 mb-[3px]"></div>
                              )}

                              <h3 className="text-base font-extrabold truncate w-full ">
                                {data.targetTitle === null
                                  ? data.message
                                  : data.targetTitle}
                              </h3>
                              {data.type === 'NOTIFY' && (
                                <div className="w-[calc(100%-54px)] flex justify-center">
                                  <button className="w-3">
                                    <FontAwesomeIcon
                                      className="text-xs"
                                      icon={
                                        isFocus === index
                                          ? faCaretUp
                                          : faCaretDown
                                      }
                                    ></FontAwesomeIcon>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {isFocus === index && (
                            <div className="p-3 text-sm text-neutral-500">
                              <p>{data.message}</p>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  }
                })}
              </>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Alarm;
