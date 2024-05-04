'use client';

import Link from 'next/link';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faPen } from '@fortawesome/free-solid-svg-icons';

const CreateButton: React.FC<{ isMyGoals: boolean }> = ({ isMyGoals }) => {
  return (
    <div
      className={`w-14 h-14 rounded-full absolute bottom-20 right-2 flex flex-col items-center justify-center ${
        isMyGoals ? 'bg-orange-400' : 'bg-gray-600'
      }`}
    >
      {isMyGoals ? (
        <Link href={'/create-goal/?item=title'}>
          <FontAwesomeIcon
            icon={faPlusCircle}
            className="w-full h-full text-gray-600"
          />
        </Link>
      ) : (
        <Link
          href={'/create-post/select-goal'}
          className="flex flex-col items-center justify-center"
        >
          <FontAwesomeIcon
            icon={faPen}
            className="w-3/4 h-3/4 text-orange-400"
          />
        </Link>
      )}
    </div>
  );
};

export default CreateButton;
