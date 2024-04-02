'use client';
import React, { useEffect, useState } from 'react';
import { handleGetUserInfo } from '../actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { handleChangeAlarmSetting, handleGetAlarmSetting } from './actions';

interface AdDataType {
  [key: string]: {
    title: string;
    boolean: boolean;
    name: string;
  };
}

const MyPage = () => {
  const [adData, setAdData] = useState<AdDataType>({
    postCheerAlarm: {
      title: '포스트 응원 알림 수신',
      boolean: true,
      name: 'postCheerAlarm',
    },
    commentAlarm: {
      title: '포스트 댓글 알림 수신',
      boolean: true,
      name: 'commentAlarm',
    },
    contentLikeAlarm: {
      title: '포스트 좋아요 알림 수신',
      boolean: true,
      name: 'contentLikeAlarm',
    },
    goalShareAlarm: {
      title: '목표 담기 알림 수신',
      boolean: true,
      name: 'goalShareAlarm',
    },
  });
  const [isChange, setIsChange] = useState(false);
  const [nickname, setNickname] = useState('');

  const router = useRouter();

  useEffect(() => {
    onGetUserInfo();
    onGetAlarmSetting();
  }, []);

  useEffect(() => {
    if (isChange) {
      onChangeAlarmSetting();
    }
  }, [isChange]);

  const onGetUserInfo = async () => {
    const response = await handleGetUserInfo();
    if (response.success) {
      setNickname(response.data.nickname);
    }
  };
  const onGetAlarmSetting = async () => {
    const response = await handleGetAlarmSetting();

    if (response.success) {
      const updatedAdData = { ...adData };
      const settingData = response.data;

      for (const key in settingData) {
        if (
          settingData.hasOwnProperty(key) &&
          updatedAdData.hasOwnProperty(key)
        ) {
          updatedAdData[key].boolean = settingData[key];
        }
      }
      setAdData(updatedAdData);
    }
  };

  const handleClick = ({ key, bool }: { key: string; bool: boolean }) => {
    setAdData((prevState) => ({
      ...prevState,
      [key]: {
        ...prevState[key],
        boolean: bool,
      },
    }));
    setIsChange(true);
  };

  const onChangeAlarmSetting = async () => {
    const formData = {
      commentAlarm: adData.commentAlarm.boolean,
      contentLikeAlarm: adData.contentLikeAlarm.boolean,
      postCheerAlarm: adData.postCheerAlarm.boolean,
      goalShareAlarm: adData.goalShareAlarm.boolean,
    };

    const response = await handleChangeAlarmSetting(formData);
    if (response.success) {
      setIsChange(false);
    }
  };

  return (
    <div className="w-full py-14 px-5 h-full flex flex-col justify-center gap-4">
      <section className="border w-full rounded-md h-[17%] flex justify-between py-4 px-8 items-center">
        <div className="flex items-end">
          <h2 className="text-2xl">&quot;{nickname}&quot;</h2>
          <label>님</label>
        </div>
        <div className="flex flex-col items-center text-sm">
          <Link
            href={{
              pathname: '/my-page/account',
            }}
          >
            <button>계정 관리</button>
          </Link>
        </div>
      </section>
      <section
        className="border w-full rounded-md h-[11%] py-4 px-8 flex items-center"
        onClick={() => router.push('/my-page/cs')}
      >
        <h2 className="text-xl">고객센터</h2>
      </section>
      <section className="border w-full rounded-md h-[50%] py-4 px-8 flex flex-col">
        <h2 className="text-xl mb-3">알림 설정</h2>
        <ul className="h-3/4 w-full">
          {Object.values(adData).map((list, index) => {
            return (
              <li key={index} className="flex justify-between h-1/6 mt-2">
                <label>{list.title}</label>
                {list.boolean ? (
                  <button
                    className="bg-orange-300 w-1/5 h-full rounded-3xl p-0.5 flex justify-end"
                    onClick={() => handleClick({ key: list.name, bool: false })}
                  >
                    <div className="h-full aspect-square rounded-full bg-white right-0"></div>
                  </button>
                ) : (
                  <button
                    className="w-1/5 h-full rounded-3xl bg-gray-300 p-0.5 "
                    onClick={() => handleClick({ key: list.name, bool: true })}
                  >
                    <div className="h-full aspect-square rounded-full bg-white"></div>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
      <section className="border w-full rounded-md h-[11%] py-4 px-8 flex items-center justify-between">
        <h2 className="text-xl">버전</h2>
        <label className="text-sm">1.0.0</label>
      </section>
    </div>
  );
};

export default MyPage;
