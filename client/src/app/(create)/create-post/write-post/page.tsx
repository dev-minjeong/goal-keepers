'use client';

import React, { useEffect, useState } from 'react';

import Image1 from '../../../../../public/assets/images/goalKeepers.png';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleGetDoingGoalListAll } from '@/app/actions';
import { handleCreateContent } from '../actions';

const WritePost = () => {
  const [goalData, setGoalData] = useState<{
    title: string;
    imageUrl: string | null;
    content: string;
  }>({ title: '', imageUrl: null, content: '' });
  const [editDescription, setEditDescription] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [addContent, setAddContent] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const goalId = Number(searchParams.get('goalId'));
  const pageNum = Number(searchParams.get('pageNum'));

  const onFetchGoalListAll = async () => {
    const form = { pageNum: pageNum };
    await handleGetDoingGoalListAll(form)
      .then((response) => {
        const foundGoalData = response.data.content.find(
          (item: any) => item.goalId === goalId,
        );

        setGoalData(foundGoalData);
        setEditDescription(foundGoalData.description);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    onFetchGoalListAll();
  }, []);

  const onCreatePost = async () => {
    const postData = {
      goalId: goalId,
      content: postContent,
      privated: isPrivate,
    };
    await handleCreateContent(postData)
      .then((response) => {
        if (response.success) {
          router.push('/');
        }
      })
      .catch((error) => console.log(error));
  };
  return (
    <>
      <h1 className="gk-primary-h1">포스트를 작성하세요</h1>
      <div className="w-full h-2/3 border rounded-md">
        <header className="w-full h-1/4 relative">
          <Image
            src={goalData.imageUrl === null ? Image1 : goalData.imageUrl}
            alt=""
            fill
            style={{
              position: 'absolute',
              objectFit: 'cover',
            }}
          ></Image>
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60	">
            <h2 className="absolute text-white w-full top-1/5 h-1/4 mt-1.5 text-base text-center font-semibold">
              {goalData.title}
            </h2>
            <div className="absolute bottom-0 m-2 w-[calc(100%-16px)] h-[calc(75%-22px)] bg-inherit text-white text-xs px-1">
              {editDescription}
            </div>
          </div>
        </header>
        <article className="flex flex-col px-4 py-5 h-3/4 justify-between items-end">
          <div className="w-full">
            <li className="w-full h-9 flex gap-2 items-center">
              <input
                className="w-full text-sm border-b p-1 text-gray-600"
                type="text"
                autoFocus
                placeholder="목표의 현재 진행 상황을 기록하세요!"
                onChange={(e) => {
                  setPostContent(e.target.value);
                  setAddContent(true);
                }}
              ></input>
            </li>

            <button
              onClick={() => {
                if (addContent) {
                  setAddContent(false);
                }
              }}
              className="h-7 w-full bg-orange-400 rounded-xl text-sm text-white mt-4"
            >
              {addContent ? '완료' : '입력'}
            </button>
          </div>

          <section className="w-[170px] h-7 bg-orange-50 rounded-md flex justify-center items-center gap-1">
            <button
              onClick={() => setIsPrivate(false)}
              className={`${
                isPrivate
                  ? 'text-gray-600'
                  : 'bg-orange-300 text-white rounded-md'
              } text-xs w-[76px] h-[20px] cursor-pointer`}
            >
              포스트 공개
            </button>
            <button
              onClick={() => setIsPrivate(true)}
              className={`${
                !isPrivate
                  ? 'text-gray-600'
                  : 'bg-orange-300 text-white rounded-md'
              } text-xs w-[76px] h-[20px] cursor-pointer`}
            >
              포스트 비공개
            </button>
          </section>
        </article>
      </div>
      <div
        className={
          !addContent && postContent.length > 0
            ? 'gk-primary-next-a'
            : 'gk-primary-next-a-block'
        }
        onClick={() => {
          if (!addContent && postContent.length > 0) {
            onCreatePost();
            router.push('/');
          } else {
            alert('현재 진행 상황 입력 후 완료 버튼을 눌러주세요.');
          }
        }}
      >
        <button className="w-full h-full">다음</button>
      </div>
    </>
  );
};

export default WritePost;
