'use server';

import { GET, POST, DELETE } from '@/app/api/board/goal/share/route';

export const handleGetShare = async (goalId: number) => {
  const formData = {
    goalId: goalId,
  };

  return GET(formData)
    .then((response: any) => {
      console.log(response);
      // if (response.statusCode === 200) {
      //   console.log(response);

      //   // return JSON.parse(response.body);
      // }
    })
    .catch((error) => console.log(error));
};

export const handleCreateShare = async (goalId: number) => {
  console.log(goalId);
  const formData = {
    goalId: goalId,
  };
  return POST(formData)
    .then((response: any) => {
      if (response.statusCode === 200) {
        return JSON.parse(response.body);
      }
    })
    .catch((error) => console.log(error));
};

export const handleDeleteShare = async (formData: { goalId: number }) => {
  return DELETE(formData)
    .then((response: any) => {
      if (response.statusCode === 200) {
        return JSON.parse(response.body);
      }
    })
    .catch((error) => console.log(error));
};
