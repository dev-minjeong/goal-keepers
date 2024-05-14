'use client';

import Image from 'next/image';
import React, { useRef } from 'react';
import Image1 from '../../public/assets/images/goalKeepers.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPlus } from '@fortawesome/free-solid-svg-icons';
import ShareButton from './ShareButton';

interface postContentTypes {
  content: string;
  createdAt: string;
  like: boolean;
  likeCnt: number;
  nickname: string;
  contentId: number;
}

interface postTypes {
  content: postContentTypes;
  goalDescription: string;
  goalId: number;
  goalImageUrl: null | string;
  goalTitle: string;
  goalshareCnt: number;
  postId: number;
  share: boolean;
  cheer: boolean;
  myPost: false;
  nickname: string;
  postCheerCnt: number;
  privated: boolean;
}

const PostBox: React.FC<{
  data: postTypes;
  index: number;
  focusNum: number | null;
  setFocusNum: React.Dispatch<React.SetStateAction<number | null>>;
  onCheerPost: (index: number) => void;
}> = ({ data, index, focusNum, setFocusNum, onCheerPost }) => {
  const likeRef = useRef<HTMLUListElement>(null);


  const handleFocus = (e: { target: any }) => {
    if (!likeRef.current?.contains(e.target)) {
      if (focusNum === index) {
        // setFocusNum(null);
      } else {
        setFocusNum(index);
      }
    }
  };

  return (
    <article
      onClick={(e) => handleFocus(e)}
      className={`h-44
      flex
      justify-between
      p-3
      mb-4
      border
      rounded-md
      duration-100
      w-11/12
      inset-x-0
      mx-auto
       "
    >
      <div className="w-1/2 h-full relative px-2 z-0 flex flex-col justify-between items-center">
        <div className="w-full h-3/4 relative">
          <Image
            src={data.goalImageUrl === null ? Image1 : data.goalImageUrl}
            alt=""
            fill
            style={{
              objectFit: 'cover',
              zIndex: 1,
            }}
          ></Image>
          <span className="z-10 bg-orange-300 text-white text-[11px] absolute px-1 m-2">
            {data.nickname}
          </span>
        </div>

        <ul ref={likeRef} className="flex w-full justify-center	gap-2">
          <li className="flex items-center gap-1">
            <FontAwesomeIcon
              icon={faHeart}
              onClick={() => onCheerPost(index)}
              className="text-orange-500"
            />
            <label
              className={`text-xs	font-semibold	
              ${data.cheer ? 'text-orange-400' : 'text-gray-500'}
              `}
            >
              {data.postCheerCnt}
            </label>
          </li>
          <ShareButton
            isDetail={false}
            isShare={data.share}
            goalId={data.goalId}
            isPostPage={true}
            goalshareCnt={data.goalshareCnt}
          ></ShareButton>
        </ul>
      </div>
      <div className="w-1/2	flex flex-col justify-between py-2">
        <div>
          <h3 className="px-1 text-neutral-800	font-bold z-10 h-[50px]">
            {data.goalTitle.length > 18
              ? `${data.goalTitle.slice(0, 18)}...`
              : data.goalTitle}
          </h3>
          <li
            className={`text-gray-600 text-sm bg-orange-100 mx-1 my-2 py-1 rounded-md px-2 flex justify-between drop-shadow`}
          >
            <span>
              {data.content.content.length > 18
                ? `${data.content.content.slice(0, 18)}...`
                : data.content.content}
            </span>
          </li>
        </div>

        <FontAwesomeIcon icon={faPlus} className="text-gray-600 mt-3 text-xs" />
      </div>
    </article>
  );
};

export default PostBox;
