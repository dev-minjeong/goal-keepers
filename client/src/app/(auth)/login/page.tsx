'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { handleLogin } from './actions';
import Image from 'next/image';
import kakaoButton from '../../../../public/kakao_login_buttons/kakao_login_medium_wide.png';
import { useRouter } from 'next/navigation';

interface LoginTypes {
  email: string;
  password: string;
}

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('test2@gogo.com');
  const [password, setPassword] = useState('passwordPassword2@');

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const postData = {
      email: form.email?.value,
      password: form.password?.value,
    };
    const response = await handleLogin(postData);
    if (response?.ok) {
      router.push('/');
    } else {
      alert('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // 추가
  const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI; // 추가
  const KakaoLoginAPI = `https://kauth.kakao.com/oauth/authorize?client_id=${API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  const openKakaoLogin = () => {
    window.open(KakaoLoginAPI, '_self');
  };

  return (
    <>
      <h2 className="w-full text-center text-3xl font-extrabold mt-20 h-24 font-['MoiraiOne'] text-orange-400">
        골키퍼스
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col w-full gap-2">
        <input
          type="email"
          placeholder="example@example.com"
          name="email"
          className="w-full h-11 border rounded-md p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <input
          type="password"
          placeholder="password"
          name="password"
          className="w-full h-11 border rounded-md p-3 mb-5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <input
          className="gk-primary-login-button"
          type="submit"
          value={'로그인'}
        ></input>
      </form>
      <hr className="border-dashed"></hr>
      <div className="flex flex-col w-full gap-1">
        <button
          className="w-full h-9 border rounded-md"
          type="button"
          onClick={openKakaoLogin}
        >
          <Image
            src={kakaoButton}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.375rem',
            }}
          ></Image>
        </button>
        <Link
          href={'/find'}
          className="w-full text-center h-9 border rounded-md leading-9 text-sm text-gray-600"
        >
          비밀번호 찾기
        </Link>
        <Link
          href={'/register'}
          className="w-full text-center h-9 border rounded-md leading-9 text-sm text-gray-600"
        >
          회원가입
        </Link>
      </div>
    </>
  );
};

export default Login;
