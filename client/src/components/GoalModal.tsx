'use client';

import Image from 'next/image';
import React, { SetStateAction, useEffect, useRef, useState } from 'react';
import Image1 from '../../public/assets/images/goalKeepers.png';
import {
  handleDeleteGoal,
  handleUpdateGoal,
  handleCompleteGoal,
} from '@/app/actions';
import { useDispatch } from 'react-redux';
import { setStateGoal } from '@/redux/renderSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

interface selectDataTypes {
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
}

const GoalModal: React.FC<{
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  selectData: selectDataTypes | null;
  setSelectGoalNum: React.Dispatch<SetStateAction<number | null>>;
  goalDoing: string;
}> = ({ setOpen, selectData, setSelectGoalNum, goalDoing }) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editDescription, setEditDescription] = useState(
    selectData?.description,
  );
  const [editStartDate, setEditStartDate] = useState(selectData?.startDate);
  const [editEndDate, setEditEndDate] = useState(selectData?.endDate);
  const containerRef = useRef<HTMLElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(selectData?.imageUrl);

  const dispatch = useDispatch();

  const handleOutsideClick = (e: any) => {
    if (!containerRef.current?.contains(e.target)) {
      setOpen(false);
      setSelectGoalNum(null);
    }
  };
  const handleEditGoal = async () => {
    const goalInformation = {
      title: selectData?.title,
      description: editDescription,
      startDate: editStartDate,
      endDate: editEndDate,
    };
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(goalInformation)], {
      type: 'application/json',
    });
    formData.append('goalInformation', jsonBlob);
    if (imageFile) formData.append('image', imageFile);

    const putData = {
      formData: formData,
      goalId: selectData?.goalId,
    };
    const response = await handleUpdateGoal(putData);
    if (response.success) {
      dispatch(setStateGoal(true));
      setOpen(false);
      setSelectGoalNum(null);
    }
  };
  const handleRemoveGoal = async () => {
    const deleteData = {
      goalId: selectData?.goalId,
    };
    const confirm = window.confirm('목표를 삭제하시겠습니까?');
    if (confirm) {
      await handleDeleteGoal(deleteData)
        .then((response) => {
          if (response.success === true) {
            dispatch(setStateGoal(true));
            setOpen(false);
            setSelectGoalNum(null);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  useEffect(() => {}, []);
  const handleConfirmButton = () => {
    if (isEdit) {
      const confirm = window.confirm('수정을 완료하시겠습니까?');
      if (confirm) {
        setIsEdit(false);
        return handleEditGoal();
      }
    } else {
      setIsEdit(false);
      setOpen(false);
      setSelectGoalNum(null);
    }
  };

  const onCompleteGoal = async () => {
    const completeData = {
      goalId: selectData?.goalId,
      completed: !selectData?.completed,
    };

    const confirm =
      goalDoing === 'doing'
        ? window.confirm('목표를 완료하시겠습니까?')
        : window.confirm('목표 완료를 취소하시겠습니까?');
    if (confirm) {
      const response = await handleCompleteGoal(completeData);

      if (response.success === true) {
        dispatch(setStateGoal(true));
        setOpen(false);
        setSelectGoalNum(null);
      }
    }
  };
  return (
    <div
      className="absolute top-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center"
      onClick={(e) => handleOutsideClick(e)}
    >
      <main className="w-3/4 h-3/5 bg-white opacity-100 " ref={containerRef}>
        <section className="w-full h-1/5 relative">
          <Image
            src={selectData?.imageUrl === null ? Image1 : selectData?.imageUrl}
            alt=""
            fill
            style={{ objectFit: 'cover' }}
          ></Image>
          <div className="absolute top-0 w-full h-full bg-opacity-50 bg-black flex items-center">
            <h2 className="text-white ml-8 text-base font-bold">
              {selectData?.title}
            </h2>
          </div>
          {goalDoing === 'doing' &&
            (!isEdit ? (
              <>
                <FontAwesomeIcon
                  className="absolute text-white text-xs bottom-2 right-6"
                  onClick={() => setIsEdit(true)}
                  icon={faEdit}
                />

                <FontAwesomeIcon
                  className="absolute text-white text-xs bottom-2 right-2"
                  onClick={() => handleRemoveGoal()}
                  icon={faTrash}
                />
              </>
            ) : (
              <input
                type="file"
                className="absolute text-white text-xs bottom-2 right-2 w-[150px]"
                onChange={(e) => {
                  setImageFile((e.target.files?.[0] as File) || null);
                }}
              ></input>
            ))}
        </section>
        <section className="h-3/5 w-full pt-4 px-8 flex flex-col justify-between">
          <button
            onClick={() => onCompleteGoal()}
            className={`top-3 right-3  text-white text-sm py-1 px-2 rounded-xl font-bold ${
              goalDoing === 'doing' ? 'bg-green-400' : 'bg-red-400'
            }`}
          >
            {goalDoing === 'doing' ? 'COMPLETE' : 'CANCEL'}
          </button>
          <div className="w-full h-2/3">
            <textarea
              className="h-full"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              readOnly={isEdit ? false : true}
            ></textarea>
          </div>
          <span className="w-full text-xs">
            {isEdit ? (
              <div className="flex">
                <input
                  placeholder={selectData?.startDate}
                  className="w-1/3"
                  onChange={(e) => setEditStartDate(e.target.value)}
                ></input>
                <span>&nbsp;~&nbsp;</span>
                <input
                  placeholder={selectData?.endDate}
                  className="w-1/3"
                  onChange={(e) => setEditEndDate(e.target.value)}
                ></input>
              </div>
            ) : (
              `${selectData?.startDate} ~ ${selectData?.endDate}`
            )}
          </span>
        </section>
        <section className="h-1/5 w-full flex items-center justify-center gap-2">
          <button
            className="w-1/4 bg-orange-300 rounded-lg h-1/3 text-white"
            onClick={() => handleConfirmButton()}
          >
            {isEdit ? '수정' : '확인'}
          </button>
          {isEdit && (
            <button
              className="w-1/4 bg-slate-100 rounded-lg h-1/3 text-current"
              onClick={() => setIsEdit(false)}
            >
              취소
            </button>
          )}
        </section>
      </main>
    </div>
  );
};

export default GoalModal;
