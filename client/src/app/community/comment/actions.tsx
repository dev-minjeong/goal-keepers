'use server';

import axios from 'axios';
import { cookies } from 'next/headers';

const cookieStore = cookies();
const token: string | undefined = cookieStore.get('accessToken')?.value;

export const handleGetComment = async (getData: {
  postId: number;
  page: number;
}) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/board/all-comment?post-id=${getData.postId}&page=${getData.page}`,
      {
        headers: {
          'Content-Type': 'application/json',
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

export const handleCreateComment = async (formData: {
  postId: number;
  content: string;
}) => {
  try {
    const id = formData.postId;
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/board/comment?post-id=${id}`,
      {
        content: formData.content,
      },
      {
        headers: {
          'Content-Type': 'application/json',
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

export const handleUpdateComment = async (formData: {
  commentId: number;
  content: string;
}) => {
  try {
    const id = formData.commentId;
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/board/comment?comment-id=${id}`,
      {
        content: formData.content,
      },
      {
        headers: {
          'Content-Type': 'application/json',
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

export const handleDeleteComment = async (formData: { commentId: number }) => {
  try {
    const id = formData.commentId;
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/board/comment?comment-id=${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
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
