'use client';
import { handleCreateInquiry } from '@/app/my-page/cs/actions';
import { setStateInquiry } from '@/redux/renderSlice';
import React, { SetStateAction, useRef } from 'react';
import { useDispatch } from 'react-redux';

const InquiryModal: React.FC<{
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  setPageable: React.Dispatch<
    SetStateAction<{ pageNumber: number; last: boolean }>
  >;
}> = ({ setOpen, setPageable }) => {
  const containerRef = useRef<HTMLElement>(null);

  const dispatch = useDispatch();

  const handleOutsideClick = (e: any) => {
    if (!containerRef.current?.contains(e.target)) {
      setOpen(false);
    }
  };

  const onCreateInquiry = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    const formData = {
      title: form.inquiryTitle.value,
      content: form.inquiryContent.value,
    };

    const response = await handleCreateInquiry(formData);

    if (response.success) {
      alert('문의 글이 작성되었습니다.');
      setOpen(false);

      setPageable({ pageNumber: 1, last: false });
      dispatch(setStateInquiry(true));
    }
  };
  return (
    <div
      className="absolute top-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center"
      onClick={(e) => handleOutsideClick(e)}
    >
      <main
        className="w-3/4 h-56 bg-white opacity-100 px-5 py-7 flex flex-col justify-between gap-2"
        ref={containerRef}
      >
        <form onSubmit={onCreateInquiry} className="flex flex-col gap-2">
          <input
            className="border w-full text-sm py-1 px-2"
            type="text"
            name="inquiryTitle"
            maxLength={50}
            placeholder="문의 제목을 입력하세요"
            autoFocus
          ></input>
          <textarea
            className="border w-full text-sm py-1 px-2 h-20 overflow-y-auto"
            name="inquiryContent"
            placeholder="문의 내용을 입력하세요."
          ></textarea>
          <input
            type="submit"
            className="w-full text-sm bg-gray-600 text-orange-300 py-1"
            value={'작성하기'}
          ></input>
        </form>
      </main>
    </div>
  );
};

export default InquiryModal;
