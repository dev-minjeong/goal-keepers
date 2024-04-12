'use server';

import axios from 'axios';
import { handleGetEventId, handleGetToken } from '@/utils/getCookie';
import { cookies } from 'next/headers';

// const token: string | undefined = cookieStore.get('_vercel_jwt')?.value;

export const handleGetAccessToken = () => {
  const token = handleGetToken().token;
  return token;
};

export const handleConfirmToken = async () => {
  const token = handleGetToken().token;
  const hasCookie = handleGetToken().cookieStore.has('accessToken');

  function isTokenExpired(token: any) {
    // const decodedToken = decodeToken(token);
    // 만료 시간이 없거나 현재 시간이 만료 시간 이후이면 토큰이 만료되지 않았음
    return !token.exp || Date.now() >= token.exp * 1000;
    // return !decodedToken.exp || Date.now() >= decodedToken.exp * 1000;
  }

  // function decodeToken(token: any) {
  //   // Base64 디코딩 후 JSON 파싱
  //   const payload = token.split('.')[1];
  //   const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
  //   return JSON.parse(decodedPayload);
  // }

  if (!hasCookie || !token || !isTokenExpired(token) || token === '') {
    return false;
  } else {
    return true;
  }
};
export const handleGetUserInfo = async () => {
  const token = handleGetToken().token;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/member/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log('error', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
};
export const handleGetDoingGoalListAll = async (getData: { pageNum: number }) => {
  const token = handleGetToken().token;
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/goal/all/me?page=${getData.pageNum}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log('error', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
};
export const handleGetDoneGoalListAll = async (getData: {
  pageNum: number;
}) => {
  const token = handleGetToken().token;
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/goal/all/me/completed?page=${getData.pageNum}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log('error', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

export const handleUpdateGoal = async (putData: any) => {
  const token = handleGetToken().token;
  try {
    const id = putData.goalId;
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/goal?id=${id}`,
      putData.formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error: any) {
    console.error('Error during request setup:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

export const handleDeleteGoal = async (deleteData: {
  goalId: number | undefined;
}) => {
  const token = handleGetToken().token;

  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/goal?id=${deleteData.goalId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    console.log('error', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
};
export const handleCompleteGoal = async (completeData: {
  goalId: number | undefined;
  completed: boolean;
}) => {
  const token = handleGetToken().token;

  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/goal/completed?id=${completeData.goalId}`,
      { completed: completeData.completed },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      },
    );

    return response.data;
  } catch (error) {
    console.log('error', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
};
export const handleGetAGoal = async (getData: { goalId: number }) => {
  const token = handleGetToken().token;
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/goal?id=${getData.goalId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log('error', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

export const setEventIdCookie = (eventIdValue: string) => {
  cookies().set({
    name: 'eventId',
    value: eventIdValue,
    httpOnly: true,
    path: '/',
    secure: process.env.NEXT_PUBLIC_ENV === 'production',
    sameSite: process.env.NEXT_PUBLIC_ENV === 'production' ? 'none' : 'lax',
  });
};
export const deleteEventIdCookie = async () => {
  const cookieStore = handleGetEventId().cookieStore;
  cookieStore.delete('eventId');
  return { ok: true };
};
