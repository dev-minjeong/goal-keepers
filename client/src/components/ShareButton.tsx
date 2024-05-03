'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare } from '@fortawesome/free-solid-svg-icons';
import {
  handleCreateShare,
  handleDeleteShare,
  handleFindConnectedGoal,
} from '@/app/post/share/actions';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectRender,
  setStateCommunity,
  setStatePost,
} from '@/redux/renderSlice';

const ShareButton: React.FC<{
  isDetail: boolean;
  isShare: boolean;
  goalId: number;
  isPostPage: boolean;
  goalshareCnt: number;
}> = ({ isDetail, isShare, goalId, isPostPage, goalshareCnt }) => {
  const [isShareNew, setIsShareNew] = useState(isShare);

  const reduxShareData = useSelector(selectRender);
  const dispatch = useDispatch();

  const onShareGoal = async () => {
    const confirm = window.confirm('해당 목표를 담으시겠습니까?');

    if (confirm) {
      const response = await handleCreateShare(goalId);

      if (response.success) {
        setIsShareNew(!isShareNew);
        isPostPage
          ? dispatch(setStatePost(!reduxShareData.postBoolean))
          : dispatch(setStateCommunity(!reduxShareData.communityBoolean));
      } else if (response.status === 400) {
        alert('나의 목표는 담을 수 없습니다.');
      }
    }
  };
  const onDeleteShareGoal = async () => {
    const confirm = window.confirm(
      '취소 시 담기 했던 목표와 함께 모든 내용이 삭제됩니다. 정말로 취소하시겠습니까?',
    );

    if (confirm) {
      const response = await handleFindConnectedGoal(goalId);

      if (response.success) {
        const connectedGoalId = response.data.goalId;

        const res = await handleDeleteShare(connectedGoalId);

        if (res.success) {
          isPostPage
            ? dispatch(setStatePost(!reduxShareData.postBoolean))
            : dispatch(setStateCommunity(!reduxShareData.communityBoolean));
        }
      }
    }
  };

  return (
    <>
      {
        <li className="flex items-center gap-1 ">
          <FontAwesomeIcon
            icon={faShare}
            onClick={() => {
              isShareNew ? onDeleteShareGoal() : onShareGoal();
            }}
            className={`${isShare ? 'text-orange-400' : 'text-gray-300'} w-4`}
          />
          {isPostPage && (
            <label
              className={`text-xs font-semibold ${
                isShare
                  ? 'text-orange-400'
                  : isDetail
                  ? 'text-gray-300'
                  : 'text-gray-500'
              }
              `}
            >
              {goalshareCnt}
            </label>
          )}
        </li>
      }
    </>
  );
};

export default ShareButton;
