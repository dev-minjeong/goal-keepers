'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Image1 from '../../public/assets/images/goalKeepers.png';
import Image from 'next/image';
import { handleGetCommunityContentAll } from '@/app/community/actions';
import { ContentBox, JoinMembersBox, ShareButton } from './index';

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
const CommunityBoxDetail: React.FC<{
  data: communityContentTypes;
  nickNameBg: string[];
}> = ({ data, nickNameBg }) => {
  const [contentData, setContentData] = useState<communityContentList[]>([]);
  const [pageable, setPageable] = useState({
    pageNumber: 1,
    last: false,
  });
  const [more, setMore] = useState<boolean>(false);

  const containerRef = useRef<any>(null);

  useEffect(() => {
    onGetCommunityContentAll(pageable.pageNumber);
  }, []);
  useEffect(() => {
    if (more) {
      handleCheckLastPage();
    }
  }, [more]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll);
      return () =>
        containerRef.current.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const elements =
        containerRef.current.querySelectorAll('.content-element');

      if (elements.length > 0) {
        const lastElement = elements[elements.length - 1];

        const lastComment = lastElement.getBoundingClientRect().bottom;
        const parentComment =
          lastElement.parentElement.getBoundingClientRect().bottom;

        if (lastComment - parentComment < 2) {
          setMore(true);
        }
      }
    }
  }, []);

  const handleCheckLastPage = () => {
    const pageNumber = pageable.pageNumber + 1;
    if (pageable.last) {
      console.log('마지막 페이지 입니다.');
    } else {
      onGetCommunityContentAll(pageNumber);
    }
  };

  const onGetCommunityContentAll = async (pageParam: number) => {
    const formData = {
      pageNum: pageParam,
      goalId: data.originalGoalId,
    };
    const response = await handleGetCommunityContentAll(formData);

    if (response.success) {
      if (more) {
        setContentData((preData) => [...preData, ...response.data.content]);
      } else {
        setContentData(response.data.content);
      }
      setMore(false);
      setPageable({
        pageNumber: response.data.pageable.pageNumber + 1,
        last: response.data.last,
      });
    }
  };

  return (
    <article
      className="
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
       "
    >
      <div className="w-full">
        <div className="z-20 w-full h-16 px-3 py-1 flex flex-col relative">
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
            className="rounded-tl-md	rounded-tr-md"
          ></Image>
          <div className="bg-black opacity-40 z-10 w-full h-full absolute top-0 left-0 rounded-tl-md	rounded-tr-md"></div>
          <section className="h-full z-20 flex flex-col">
            <h3 className="text-white text-lg font-bold leading-6">
              {data.originalGoalTitle}
            </h3>
            <div className="w-full h-8 flex justify-between items-center text-white">
              <p className=" text-xs text-slate-200 w-[calc(100%-20px)]">
                {data.originalGoalDescription}
              </p>

              <ShareButton
                isDetail={true}
                isShare={data.share}
                goalId={data.originalGoalId}
                isPostPage={false}
                goalshareCnt={data.originalGoalshareCnt}
              ></ShareButton>
            </div>
          </section>
        </div>
        <section className={`${contentData.length > 3 ? 'h-80' : ''}`}>
          <ul
            className={`w-full h-full overflow-y-scroll pr-2 py-3`}
            ref={containerRef}
          >
            {contentData.map((list, listIndex) => {
              return (
                <ContentBox
                  list={list}
                  key={listIndex}
                  index={listIndex}
                ></ContentBox>
              );
            })}
          </ul>
        </section>
        <JoinMembersBox
          joinMemberList={data.joinMemberList}
          nickNameBg={nickNameBg}
        ></JoinMembersBox>
      </div>
    </article>
  );
};

export default CommunityBoxDetail;
