'use client';
import { handleGetInquiryAnswer } from '@/app/my-page/cs/actions';
import React, { SetStateAction, useEffect, useRef, useState } from 'react';

interface selectDataTypes {
  inquiryId: number | undefined;
  title: string;
  content: string;
  createdAt: string;
  answered: boolean;
}

const CsModal: React.FC<{
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  selectData: selectDataTypes | null;
}> = ({ setOpen, selectData }) => {
  const [answer, setAnswer] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    onGetInquiryAnswer();
  }, []);

  const handleOutsideClick = (e: any) => {
    if (!containerRef.current?.contains(e.target)) {
      setOpen(false);
    }
  };

  const onGetInquiryAnswer = async () => {
    const formData = {
      inquiryId: selectData?.inquiryId,
    };
    const response = await handleGetInquiryAnswer(formData);

    if (response.success) {
      setAnswer(response.data.answer);
    }
  };
  return (
    <div
      className="absolute top-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center"
      onClick={(e) => handleOutsideClick(e)}
    >
      <main
        className="w-3/4 h-3/5 bg-white opacity-100 px-5 py-7 flex flex-col justify-between gap-2"
        ref={containerRef}
      >
        <section className="w-full h-2/6 relative flex flex-col items-end justify-between">
          <h2 className="w-full font-bold text-[17px]">{selectData?.title}</h2>
          <p className="text-xs">{selectData?.createdAt?.slice(0, 10)}</p>
        </section>
        <section className="h-2/6 w-full flex items-center justify-center overflow-y-auto">
          <p className="text-sm">{selectData?.content}</p>
        </section>
        <section className="h-2/6 w-full">
          <div
            className={`w-full border-2 rounded-lg flex justify-center ${
              selectData?.answered
                ? 'border-green-400 bg-green-50'
                : 'border-neutral-300 bg-neutral-50'
            }`}
          >
            <span
              className={`w-full text-sm text-center ${
                selectData?.answered ? 'text-green-500' : 'text-neutral-400'
              }`}
            >
              {selectData?.answered ? '답변 완료' : '답변 대기 중'}
            </span>
          </div>
          <div className="h-[calc(100%-25px)] flex justify-center items-center overflow-y-auto">
            {answer === null ? (
              <p className="text-[13px] text-neutral-700">
                답변 내역이 없습니다.
              </p>
            ) : (
              <p className="text-[13px] text-neutral-800">{answer}</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CsModal;
