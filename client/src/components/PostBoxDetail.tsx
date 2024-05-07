'use client';
import Image from 'next/image';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Image1 from '../../public/assets/images/goalKeepers.png';
import {
  handleChangePrivate,
  handleCreatePostContent,
  handleDeletePostContent,
  handleGetAllPostContent,
  handleLikeContent,
} from '@/app/post/actions';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectRender,
  setStateContent,
  setStatePrivate,
  setStatePost,
} from '@/redux/renderSlice';
import { CommentBox, ShareButton } from './index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faTimes,
  faThumbsUp,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
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
const PostBoxDetail: React.FC<{
  data: postTypes;
  myNickname: string;
  index: number;
  setFocusNum: React.Dispatch<React.SetStateAction<number | null>>;
  onCheerPost: (index: number) => void;
}> = ({ data, myNickname, setFocusNum, index, onCheerPost }) => {
  const [addContent, setAddContent] = useState(false);
  const [contentList, setContentList] = useState<
    { date: string; contents: any }[]
  >([]);
  const [pageable, setPageable] = useState({
    pageNumber: 1,
    last: false,
  });
  const [more, setMore] = useState<boolean>(false);
  const [focusContent, setFocusContent] = useState<number[]>([]);
  const [contentValue, setContentValue] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const likeRef = useRef<HTMLUListElement>(null);
  const contentRef = useRef<any>(null);
  const reduxPostData = useSelector(selectRender);
  const dispatch = useDispatch();

  useEffect(() => {
    onGetAllPostContent(1);
    setIsPrivate(data.privated);
  }, [reduxPostData.contentBoolean]);

  const onGetAllPostContent = async (pageNumber: number) => {
    const formData = {
      pageNum: pageNumber,
      postId: data.postId,
    };

    const response = await handleGetAllPostContent(formData);

    if (response.success) {
      const groupedItems = response.data.content.reduce(
        (acc: any, curr: any) => {
          const timestamp = curr.createdAt.slice(0, 10);
          acc[timestamp] = acc[timestamp] || [];
          acc[timestamp].push(curr);
          return acc;
        },
        {},
      );

      const groupedByDateArray = Object.entries(groupedItems).map(
        ([date, contents]) => ({
          date,
          contents,
        }),
      );

      groupedByDateArray.sort((a: any, b: any) => b.date - a.date);

      if (more) {
        const concatData = contentList;
        groupedByDateArray.forEach((obj2: any) => {
          const existingObj = concatData.find(
            (obj1) => obj1.date === obj2.date,
          );
          if (existingObj) {
            existingObj.contents.push(...obj2.contents);
          } else {
            concatData.push(obj2);
          }
        });

        setContentList(concatData);
      } else {
        setContentList(groupedByDateArray);
      }
      setPageable({
        pageNumber: response.data.pageable.pageNumber + 1,
        last: response.data.last,
      });
      setMore(false);
    }
  };

  const onCreatePostContent = async (goalId: number) => {
    const formData = {
      content: contentValue,
      goalId: goalId,
      privated: isPrivate,
    };
    const response = await handleCreatePostContent(formData);

    if (response.success) {
      setAddContent(false);
      setMore(false);
      dispatch(setStateContent(!reduxPostData.contentBoolean));
    }
  };

  const onLikeContent = async (contentId: number) => {
    const response = await handleLikeContent(contentId);

    if (response.success) {
      dispatch(setStateContent(!reduxPostData.contentBoolean));
    }
  };
  const onDeleteContent = async (contentId: number) => {
    const response = await handleDeletePostContent(contentId);

    if (response.success) {
      dispatch(setStateContent(!reduxPostData.contentBoolean));
    }
  };

  const onChangePrivate = async (postId: number) => {
    const formData = {
      postId: postId,
    };
    const response = await handleChangePrivate(formData);

    if (response.success) {
      response.data
        ? alert('포스트가 비공개로 전환되었습니다.')
        : alert('포스트가 공개로 전환되었습니다.');
      setIsPrivate(response.data);
      return setStatePrivate(!reduxPostData.privateBoolean);
    }
  };

  useEffect(() => {
    if (more) {
      handleCheckLastPage();
    }
  }, [more]);

  useLayoutEffect(() => {
    if (contentRef.current) {
      contentRef.current.addEventListener('scroll', handleScroll);
      return () =>
        contentRef.current.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll('.content-element');

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
      // console.log('마지막 페이지 입니다.');
    } else {
      onGetAllPostContent(pageNumber);
    }
  };

  return (
    <article
      className="h-[450px] flex flex-col p-3 mb-4 border rounded-md duration-100	
      w-11/12
      inset-x-0
      mx-auto justify-between items-end
      "
    >
      <div className="w-full h-1/4 relative z-0 flex rounded-md">
        <Image
          src={data.goalImageUrl === null ? Image1 : data.goalImageUrl}
          alt=""
          fill
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            // zIndex: 1,
            position: 'absolute',
            borderRadius: '5px',
          }}
        ></Image>
        <div className="w-full h-full bg-black absolute opacity-50"></div>
        <div className="absolute flex justify-between top-1/4 px-4 -translate-y-1/3   w-full">
          <h3 className="text-center text-white	font-bold   z-10 text-ellipsis	">
            {data.goalTitle.length > 18
              ? data.goalTitle.slice(0, 18) + '...'
              : data.goalTitle}
          </h3>
          <span className="z-10 bg-orange-300 text-white text-[11px] px-1 h-[18px] ">
            {data.nickname}
          </span>
        </div>
        <p className="text-white w-5/6 absolute top-1/3 text-xs mt-2 mx-4">
          {data.goalDescription?.length > 65
            ? data.goalDescription?.slice(0, 65) + '...'
            : data.goalDescription}
        </p>
        <ul
          ref={likeRef}
          className="absolute right-0 bottom-0 mb-1 mr-3 flex justify-center	text-white gap-2 "
        >
          <li className="flex items-center gap-1">
            <FontAwesomeIcon
              icon={faThumbsUp}
              onClick={() => onCheerPost(index)}
              className={`${data.cheer ? 'text-orange-400' : 'text-gray-300'}`}
            />
            <label
              className={`text-xs font-semibold ${
                data.cheer ? 'text-orange-400' : 'text-gray-300'
              }`}
            >
              {data.postCheerCnt}
            </label>
          </li>
          <ShareButton
            isDetail={true}
            isShare={data.share}
            goalId={data.goalId}
            isPostPage={true}
            goalshareCnt={data.goalshareCnt}
          ></ShareButton>
        </ul>
      </div>
      {data.myPost ? (
        <section className=" w-[170px] h-7 bg-orange-50 rounded-md flex justify-center items-center gap-1 mt-1">
          <button
            onClick={() => onChangePrivate(data.postId)}
            className={`${
              isPrivate
                ? 'text-gray-600'
                : 'bg-orange-300 text-white rounded-md'
            } text-xs w-[76px] h-[20px] cursor-pointer`}
          >
            포스트 공개
          </button>
          <button
            onClick={() => onChangePrivate(data.postId)}
            className={`${
              !isPrivate
                ? 'text-gray-600'
                : 'bg-orange-300 text-white rounded-md'
            } text-xs w-[76px] h-[20px] cursor-pointer`}
          >
            포스트 비공개
          </button>
        </section>
      ) : (
        <div className="h-4"></div>
      )}

      <div className="w-full	mt-1 flex flex-col flex-1 ">
        <ul
          className="flex-1 overflow-y-auto w-full p-2 pb-4 "
          ref={contentRef}
        >
          {addContent && (
            <div className="w-full flex flex-col mb-2">
              <li className="w-full h-9 flex gap-2 items-center">
                <input
                  className="w-11/12 text-sm border-b p-1 text-gray-600"
                  type="text"
                  autoFocus
                  maxLength={60}
                  placeholder="목표의 현재 진행 상황을 기록하세요!"
                  onChange={(e) => setContentValue(e.target.value)}
                ></input>
                <button
                  className="w-6 h-6"
                  onClick={() => {
                    setContentValue('');
                    setAddContent(false);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="w-full text-gray-600 h-full"
                  />
                </button>
              </li>
              {contentValue.length >= 60 && (
                <span className="text-xs text-orange-500">
                  * 60자 이내로 작성해주세요.
                </span>
              )}
            </div>
          )}
          {contentList.map((group, index) => {
            return (
              <ul key={index} className="mb-4 content-element">
                <h3 className="text-xs text-gray-500 mb-1">
                  {group.date.replace(/-/g, '/')}
                </h3>
                {group.contents.map((list: any, i: number) => {
                  return (
                    <li
                      key={i}
                      onMouseEnter={() => setFocusContent([index, i])}
                      onMouseLeave={() => setFocusContent([])}
                      className={`text-gray-600 font-semibold	flex items-center text-sm ${
                        focusContent[0] === index && focusContent[1] === i
                          ? 'bg-orange-200'
                          : 'bg-orange-100'
                      } mt-1 mb-1 py-1 rounded-md px-2 drop-shadow-md flex justify-between`}
                    >
                      <span className="w-[calc(100%-18px)]">
                        {list.content}
                      </span>
                      <button className="w-4">
                        {focusContent[0] === index && focusContent[1] === i ? (
                          data.myPost ? (
                            <FontAwesomeIcon
                              onClick={() => onDeleteContent(list.contentId)}
                              className={`text-white`}
                              icon={faTrashAlt}
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faHeart}
                              className={` ${
                                list.like ? 'text-orange-600' : 'text-white'
                              }`}
                              onClick={() => onLikeContent(list.contentId)}
                            />
                          )
                        ) : (
                          <></>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            );
          })}
        </ul>
        {data.myPost && (
          <button
            onClick={() => {
              if (addContent) {
                onCreatePostContent(data.goalId);
              } else {
                contentRef.current.scrollTop = 0;
                setAddContent(true);
              }
            }}
            className="h-[13%] w-full bg-orange-400 rounded-xl text-sm text-white"
          >
            {addContent ? '입력' : '기록하기'}
          </button>
        )}
      </div>
      <CommentBox postId={data.postId} myNickname={myNickname}></CommentBox>
    </article>
  );
};
export default PostBoxDetail;
