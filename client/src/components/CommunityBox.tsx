import React from 'react';
import Image1 from '../../public/assets/images/goalKeepers.png';
import Image from 'next/image';
import { JoinMembersBox } from '.';

interface communityContentList {
  content: string;
  contentId: number;
  createdAt: string;
  goalDescription: string;
  goalId: number;
  goalImageUrl: null | string;
  goalTitle: string;
  like: boolean;
  likeCnt: number;
  nickname: string;
}
interface joinMemberListTypes {
  isOwner: boolean;
  memberId: number;
  nickname: string;
}
interface communityContentTypes {
  originalGoalId: number;
  originalGoalTitle: string;
  originalGoalDescription: string;
  originalGoalImageUrl: null | string;
  originalGoalshareCnt: number;
  joinMemberList: joinMemberListTypes[];
  contentList: communityContentList[];
  count: null | number;
  share: boolean;
}

const CommunityBox: React.FC<{
  data: communityContentTypes;
  focusNum: null | number;
  index: number;
  setFocusNum: React.Dispatch<React.SetStateAction<number | null>>;
  nickNameBg: string[];
}> = ({ data, focusNum, index, setFocusNum, nickNameBg }) => {
  const handleFocus = (e: { target: any }) => {
    if (focusNum === index) {
      // setFocusNum(null);
    } else {
      setFocusNum(index);
    }
  };

  return (
    <article
      onClick={(e) => handleFocus(e)}
      className={`
      ${
        data.contentList.length === 0
          ? 'h-40'
          : data.contentList.length === 1
          ? `h-60`
          : data.contentList.length === 2
          ? `h-[290px]`
          : `h-[355px]`
      }
      flex
      justify-between
      p-3
      mb-4
      border
      rounded-md
      duration-100
      w-10/12
      inset-x-0
      mx-auto
      community-element
       `}
    >
      <div className="w-full relative">
        <Image
          src={
            data.originalGoalImageUrl === null
              ? Image1
              : data.originalGoalImageUrl
          }
          alt=""
          fill
          style={{
            objectFit: 'cover',
            zIndex: 1,
          }}
        ></Image>
        <div className="bg-black opacity-40 z-10 w-full h-full absolute"></div>
        <div className="absolute z-20 w-full h-full p-3 flex flex-col">
          <section className="mt-2 mb-3">
            <h3 className="text-white text-xl font-bold">
              {data.originalGoalTitle.length > 26
                ? data.originalGoalTitle.slice(0, 26) + '...'
                : data.originalGoalTitle}
            </h3>
          </section>
          <section className="flex-auto">
            <ul className="w-full flex flex-col gap-3">
              {data.contentList.map((list, listIndex) => {
                return (
                  <li
                    key={listIndex}
                    className={` text-gray-600 bg-neutral-100 py-1 rounded-md px-2 drop-shadow-lg h-12`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <div className="rounded-full h-4 bg-orange-200 px-2 ">
                        <p className="text-gray-600 text-[11px] leading-4 ">
                          {list.nickname}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {list.createdAt.slice(0, 10)}
                      </span>
                    </div>
                    <div className="w-full flex items-center mt-1">
                      <h4 className="text-sm font-bold">{list.content}</h4>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
          <JoinMembersBox
            joinMemberList={data.joinMemberList}
            nickNameBg={nickNameBg}
          ></JoinMembersBox>
        </div>
      </div>
    </article>
  );
};

export default CommunityBox;
