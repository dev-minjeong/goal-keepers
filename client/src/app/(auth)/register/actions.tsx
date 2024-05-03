'use server';

import axios from 'axios';

export const handleConfirmEmail = async (email: string) => {
  const postData = {
    email: email,
  };

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/email`,
      {
        email: postData.email,
      },
      {
        // headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      },
    );
    console.log('dd', response);

    return response;
  } catch (error: any) {
    console.error('Error during request setup:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

export const handleVerifyEmail = async (formData: { email: string }) => {
  console.log(formData.email);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/email/verification-request`,
      {
        email: formData.email,
      },
      {
        withCredentials: true,
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(error.response);
    return error.response;
  }
};
export const handleVerifyEmailCode = async (formData: {
  email: string;
  code: string;
}) => {
  console.log(formData.email);

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/email/verification?email=${formData.email}&code=${formData.code}`,
      {
        withCredentials: true,
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(error.response.data);
    return error.response.data;
  }
};

export const handleConfirmNickName = async (nickname: string) => {
  const postData = {
    nickname: nickname,
  };
  console.log(`${process.env.NEXT_PUBLIC_API_URL}/auth/nickname`);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/nickname`,
      {
        nickname: postData.nickname,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      },
    );
    console.log(response);

    return response.data;
  } catch (error: any) {
    return error.response.data.validation[0];
  }
};

export const handleSubmitForm = async (formData: any) => {
  const postData = {
    email: formData.email,
    password: formData.password,
    nickname: formData.nickname,
  };
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
      {
        email: postData.email,
        password: postData.password,
        nickname: postData.nickname,
      },
      {
        headers: { 'Content-Type': 'application/json' },
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
