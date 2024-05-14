'use client';
import {
  CommunityBox,
  CommunityBoxDetail,
  SearchBox,
} from '@/components/index.js';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { handleGetCommunityAll } from './actions';
import { useDispatch, useSelector } from 'react-redux';
import { selectRender } from '@/redux/renderSlice';

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

const Community = (props: any) => {
const Community = (props: any) => {
  const [focusNum, setFocusNum] = useState<number | null>(null);
  const [communityData, setCommunityData] = useState<communityContentTypes[]>(
    [],
  );
  const [pageable, setPageable] = useState({
    pageNumber: 1,
    last: false,
  });
  const [more, setMore] = useState<boolean>(false);
  const [sort, setSort] = useState('NEW');

  const nickNameBg = [
    'bg-purple-400',
    'bg-green-400',
    'bg-cyan-400',
    'bg-blue-400',
    'bg-fuchsia-400',
    'bg-rose-400',
    'bg-pink-400',
    'bg-violet-400',
    'bg-indigo-400',
    'bg-amber-400',
  ];

  const containerRef = useRef<any>(null);

  const dispatch = useDispatch();
  const reduxCommunityData = useSelector(selectRender);

  useEffect(() => {
    onGetCommunityAll(pageable.pageNumber);
  }, [reduxCommunityData.communityBoolean, sort]);

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
        containerRef.current.querySelectorAll('.community-element');

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

  const onGetCommunityAll = async (pageParam: number) => {
    const formData = {
      pageNum: pageParam,
      sort: sort,
    };

    const response = await handleGetCommunityAll(formData);

    if (response.success) {
      if (more) {
        setCommunityData((preData) => [...preData, ...response.data.content]);
      } else {
        setCommunityData(response.data.content);
      }
      setMore(false);
      setPageable({
        pageNumber: response.data.pageable.pageNumber + 1,
        last: response.data.last,
      });
    }
  };

  const handleCheckLastPage = () => {
    const pageNumber = pageable.pageNumber + 1;
    if (pageable.last) {
      console.log('마지막 페이지 입니다.');
    } else {
      onGetCommunityAll(pageNumber);
    }
  };

  const onChangeSort = async (state: string) => {
    setSort(state);
    setPageable({
      pageNumber: 1,
      last: false,
    });
  };
  return (
    <div className="w-full h-full pt-[40px] flex flex-col">
      <SearchBox
        pageNumber={pageable.pageNumber}
        sort={sort}
        onChangeSort={onChangeSort}
        setData={setCommunityData}
        setPageable={setPageable}
      ></SearchBox>
      <section
        className="z-0 h-full overflow-y-scroll w-full py-4"
        ref={containerRef}
      >
        {communityData.map((data, index) => {
          return focusNum === index ? (
            <CommunityBoxDetail
              key={index}
              data={data}
              nickNameBg={nickNameBg}
            ></CommunityBoxDetail>
          ) : (
            <CommunityBox
              data={data}
              key={index}
              index={index}
              focusNum={focusNum}
              setFocusNum={setFocusNum}
              nickNameBg={nickNameBg}
            ></CommunityBox>
          );
        })}
      </section>
    </div>
  );
};
export default Community;
