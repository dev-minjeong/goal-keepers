'use client';

import React, { useEffect, useState } from 'react';

interface joinMemberListTypes {
  isOwner: boolean;
  memberId: number;
  nickname: string;
}

const JoinMembersBox: React.FC<{
  joinMemberList: joinMemberListTypes[];
  nickNameBg: string[];
}> = ({ joinMemberList, nickNameBg }) => {
  const [newJoinMember, setNewJoinMember] = useState<joinMemberListTypes[]>([]);

  useEffect(() => {
    formatJoinMemberList();
  }, [joinMemberList]);

  const formatJoinMemberList = () => {
    const newList = joinMemberList.filter((data) => !data.isOwner && data);
    const ownerData = joinMemberList.filter((data) => data.isOwner && data);

    ownerData.length > 0 && newList.unshift(ownerData[0]);

    setNewJoinMember(newList);
  };
  return (
    <section className="h-11 flex flex-col mt-2">
      <h5 className="text-xs font-bold">JOIN MEMBERS</h5>
      <ul className="flex gap-[3px] mt-1">
        {newJoinMember.length > 10 ? (
          <>
            {newJoinMember.slice(0, 10).map((list, index) => {
              return (
                <li
                  key={index}
                  className={`w-5 h-5 rounded-full ${
                    nickNameBg[list.memberId % 10]
                  } flex align-middle justify-center ${
                    index == 0 ? 'border' : ''
                  }`}
                >
                  <p className="text-[11px] text-white leading-5">
                    {list.nickname.slice(0, 1)}
                  </p>
                </li>
              );
            })}
            <span className="text-white leading-5">・・・</span>
          </>
        ) : (
          newJoinMember.map((list, index) => {
            return (
              <li
                key={index}
                className={`w-5 h-5 rounded-full ${
                  nickNameBg[list.memberId % 10]
                } flex align-middle justify-center ${
                  index == 0 && 'border-orange-300 border-2'
                }`}
              >
                <p
                  className={`text-[11px] text-white ${
                    index == 0 ? 'leading-4' : 'leading-5'
                  }`}
                >
                  {list.nickname.slice(0, 1)}
                </p>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
};

export default JoinMembersBox;
