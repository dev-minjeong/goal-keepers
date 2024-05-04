'use client';

import React, { useState } from 'react';
import {
  handleConfirmNickName,
  handleSubmitForm,
  handleVerifyEmail,
  handleVerifyEmailCode,
} from './actions';
import shortid from 'shortid';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

interface IFormInput {
  email: string;
  password: string;
  passwordCheck: string;
  nickname: string;
}

const Register = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    setError,
    watch,
    resetField,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      passwordCheck: '',
      nickname: '',
    },
  });
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState({
    email: false,
    nickname: false,
  });
  const [isInputEmailCode, setIsInputEmailCode] = useState<boolean>(false);
  const [emailCode, setEmailCode] = useState<string>('');

  const router = useRouter();

  // 유효성 검사
  const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[!@#])[\da-zA-Z!@#]{8,20}$/;

  // 이메일 인증
  const onVerifyEmail = async () => {
    const emailValue = getValues('email');
    if (emailValue.length > 0) {
      const formData = {
        email: emailValue,
      };
      const response = await handleVerifyEmail(formData);

      if (response.success) {
        alert(response.message);
        setIsInputEmailCode(true);
      } else {
        resetField('email');
      }
    } else {
      setError('email', {
        type: 'required',
      });
    }
  };

  // 이메일 코드 확인
  const onVerifyEmailCode = async () => {
    const emailValue = getValues('email');
    if (emailValue.length > 0) {
      const formData = {
        email: emailValue,
        code: emailCode,
      };
      const response = await handleVerifyEmailCode(formData);

      setIsCheckingDuplicate({
        ...isCheckingDuplicate,
        email: response.success,
      });
      alert(response.message);
    } else {
      setError('email', {
        type: 'required',
      });
    }
  };

  // 닉네임 중복 확인
  const handleConfirmDuplicationNickname = async () => {
    const nicknameValue = getValues('nickname');
    if (nicknameValue.length > 0) {
      await handleConfirmNickName(nicknameValue)
        .then((response) => {
          setIsCheckingDuplicate({
            ...isCheckingDuplicate,
            nickname: response.success,
          });
          alert(response.message);
        })
        .catch((error) => console.log(error));
    } else {
      setError('nickname', {
        message: '닉네임을 입력하세요.',
      });
    }
  };

  // 회원가입
  const hadleConfirmForm: SubmitHandler<IFormInput> = async (data) => {
    const NICK_NAME =
      data.nickname.length > 0 ? data.nickname : shortid.generate();

    if (!isCheckingDuplicate.email) {
      alert('이메일을 인증해주세요.');
    } else if (!isCheckingDuplicate.nickname && data.nickname.length > 0) {
      alert('닉네임 중복여부를 확인해주세요.');
    } else {
      const response = await handleSubmitForm({
        email: data.email,
        password: data.password,
        nickname: NICK_NAME,
      });
      if (response.success) {
        alert(`${response.data.nickname}님! 회원가입이 완료되었습니다.`);
        return router.push('/login');
      }
    }
  };

  return (
    <>
      <h2 className="w-full text-center text-xl mt-[40px] font-bold">
        회원가입
      </h2>
      <form
        onSubmit={handleSubmit(hadleConfirmForm)}
        className="flex flex-col w-full gap-4"
        id="register"
      >
        <li className="flex flex-col w-full">
          <div className="flex items-end">
            <label htmlFor="email_input" className="text-sm">
              이메일<span className="text-orange-400">*</span>
            </label>
            <p
              className={`${
                errors?.email ? 'text-red-600' : 'text-green-600'
              } text-xs ml-2`}
            >
              {errors?.email?.type === 'required'
                ? '이메일을 입력해주세요.'
                : errors?.email?.type === 'pattern'
                ? '이메일 양식에 맞게 입력해주세요.'
                : ''}
            </p>
          </div>
          <div className="border-b w-full flex justify-between p-3">
            <Controller
              name="email"
              control={control}
              rules={{
                required: true,
                pattern: EMAIL_REGEX,
                onChange: () =>
                  setIsCheckingDuplicate({
                    ...isCheckingDuplicate,
                    email: false,
                  }),
              }}
              render={({ field }) => (
                <input
                  type="email"
                  className="w-[calc(100%-72px)]"
                  {...field}
                  placeholder="이메일을 입력하세요"
                ></input>
              )}
            ></Controller>
            <button
              className={`${
                !isCheckingDuplicate.email && !errors?.email
                  ? 'text-orange-400'
                  : 'text-gray-400'
              } text-sm text-center w-18`}
              type="button"
              onClick={() => onVerifyEmail()}
              disabled={
                isCheckingDuplicate.email || errors?.email?.type === 'pattern'
              }
            >
              이메일 인증
            </button>
          </div>

          {isInputEmailCode && (
            <div className="flex flex-col w-[87%] mt-1">
              <div className="border-b w-full flex justify-between px-3 py-2">
                <input
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  className="w-[calc(100%-50px)] text-sm"
                  placeholder="이메일 인증코드를 입력해주세요"
                ></input>
                <button
                  className={`${
                    emailCode.length > 0 ? 'bg-orange-300' : 'bg-neutral-400'
                  } text-sm text-center w-10 text-white`}
                  type="button"
                  onClick={() => onVerifyEmailCode()}
                  disabled={emailCode.length === 0}
                >
                  확인
                </button>
              </div>
            </div>
          )}
        </li>

        <li className="flex flex-col w-full">
          <div className="flex items-end">
            <label htmlFor="password_input" className="text-sm w-24">
              비밀번호<span className="text-orange-400">*</span>
            </label>
            <p className="text-red-600 text-xs ml-2">
              {errors?.password?.type === 'required'
                ? '비밀번호를 입력해주세요.'
                : errors?.password?.type === 'pattern'
                ? '8~20자의 소문자 영단어, 숫자, 특수문자를 모두 포함한 비밀번호를 입력해주세요.'
                : ''}
            </p>
          </div>
          <div className="border-b w-full flex justify-between p-3">
            <Controller
              name="password"
              control={control}
              rules={{
                required: true,
                pattern: PASSWORD_REGEX,
              }}
              render={({ field }) => (
                <input
                  type="password"
                  className="w-full"
                  {...field}
                  placeholder="비밀번호를 입력하세요"
                ></input>
              )}
            ></Controller>
          </div>
        </li>
        <Controller
          name="passwordCheck"
          control={control}
          rules={{
            required: true,
            validate: {
              check: (val) => {
                if (getValues('password') !== val) {
                  return '비밀번호가 일치하지 않습니다.';
                }
              },
            },
          }}
          render={({ field, fieldState }) => (
            <li className="flex flex-col w-full">
              <div className="flex items-end">
                <label htmlFor="password-check_input" className="text-sm">
                  비밀번호 재확인<span className="text-orange-400">*</span>
                </label>
                <p className="text-red-600 text-xs ml-2">
                  {fieldState?.error ? fieldState?.error.message : ''}
                </p>
              </div>
              <div className="border-b w-full flex justify-between p-3">
                <input
                  type="password"
                  className="w-full"
                  {...field}
                  placeholder="비밀번호를 입력하세요"
                ></input>
              </div>
            </li>
          )}
        ></Controller>
        <li className="flex flex-col w-full">
          <div className="flex items-end">
            <label htmlFor="nickname_input" className="text-sm">
              닉네임
            </label>
          </div>
          <div className="border-b w-full flex justify-between p-3">
            <Controller
              name="nickname"
              control={control}
              rules={{
                maxLength: 15,
                onChange: () =>
                  setIsCheckingDuplicate({
                    ...isCheckingDuplicate,
                    nickname: false,
                  }),
              }}
              render={({ field }) => (
                <input
                  type="text"
                  className="w-[calc(100%-52px)]"
                  {...field}
                  placeholder="닉네임을 입력하세요(3자~15자)"
                ></input>
              )}
            ></Controller>
            <button
              className={`${
                !isCheckingDuplicate.nickname
                  ? 'text-orange-400'
                  : 'text-gray-400'
              } text-sm text-center w-14`}
              type="button"
              onClick={() => handleConfirmDuplicationNickname()}
              disabled={isCheckingDuplicate.nickname}
            >
              중복확인
            </button>
          </div>
        </li>
      </form>
      <input
        type="submit"
        value={'완료'}
        disabled={
          isValid === false ||
          isCheckingDuplicate.email === false ||
          (watch('nickname').length > 0
            ? isCheckingDuplicate.nickname === false
            : false)
        }
        className={`gk-primary-login-button`}
        form="register"
      ></input>
    </>
  );
};

export default Register;
