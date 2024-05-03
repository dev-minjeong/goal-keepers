'use client';

import { handleConfirmNickName } from '@/app/(auth)/register/actions';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  handleChangeNickname,
  handleChangePassword,
  handleLogout,
  handleRemoveMember,
} from './actions';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setStateLogOut } from '@/redux/renderSlice';

interface IFormInput {
  email: string;
  exPassword: string;
  newPassword: string;
}
const Account = () => {
  const {
    control,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      exPassword: '',
      newPassword: '',
    },
  });
  const [focusBtn, setFocusBtn] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<String | null>(null);

  const router = useRouter();

  const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[!@#])[\da-zA-Z!@#]{8,20}$/;

  const dispatch = useDispatch();

  // 닉네임 중복 확인
  const handleConfirmDuplicationNickname = async () => {
    setIsCheckingDuplicate(false);
    if (nicknameInput.length > 0) {
      const response = await handleConfirmNickName(nicknameInput);
      if (response.success) {
        setIsCheckingDuplicate(true);
      }
      alert(response.message);
    } else {
      alert('닉네임을 입력하세요.');
    }
  };
  const onUpdateNickname = async () => {
    if (isCheckingDuplicate === false) {
      alert('닉네임 중복 확인을 해주세요.');
    } else {
      if (nicknameInput.length > 0) {
        const response = await handleChangeNickname(nicknameInput);
        if (response.success) {
          alert('닉네임이 변경되었습니다.');
          return router.push('/my-page');
        } else {
          alert(response.message);
        }
      } else {
        alert('닉네임을 입력하세요');
      }
    }
  };
  const onChangePassword = async () => {
    const emailValue = getValues('email');
    const exPwValue = getValues('exPassword');
    const newPwValue = getValues('newPassword');

    if (
      emailValue.length > 0 &&
      exPwValue.length > 0 &&
      newPwValue.length > 0
    ) {
      const formData = {
        email: emailValue,
        exPassword: exPwValue,
        newPassword: newPwValue,
      };
      await handleChangePassword(formData)
        .then((response) => {
          if (response.status === 400) {
            if (response.validation !== null) {
              let validations = '';
              response.validation.forEach((val: any) => {
                validations += val.message + ' ';
              });
              alert(validations);
            } else {
              alert(response.message);
            }
          } else if (response.success === true) {
            alert('비밀번호가 변경되었습니다.');
            return router.push('/my-page');
          }
        })
        .catch((error) => console.log(error));
    } else {
      alert('빈 칸을 모두 채워주세요.');
    }
  };
  const handleDeleteMember = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = {
      email: form.email?.value,
      password: form.password?.value,
    };
    const response = await handleRemoveMember(formData);
    if (response.statusCode == 200) {
      console.log('success');
      // 캐시에서 토큰 지우기
      router.push('/login');
    } else {
      console.log(response);
      setIsError(true);
      setErrorMessage(response.message);
      // response.validation
    }
  };

  const onLogOut = async () => {
    const conform = window.confirm('로그아웃 하시겠습니까?');

    if (conform) {
      const response = await handleLogout();

      if (response.ok) {
        dispatch(setStateLogOut(true));
        router.push('/login');
      }
    } else {
      return false;
    }
  };

  
  return (
    <div className="w-10/12 h-3/4 flex flex-col items-center justify-between">
      <h2 className="font-bold text-2xl">계정 관리</h2>
      <section className="w-full">
        <ul className="w-full flex flex-col gap-5">
          <li className="flex flex-col">
            <button
              className="gk-primary-login-button"
              onClick={() =>
                focusBtn === 'nickname'
                  ? setFocusBtn('')
                  : setFocusBtn('nickname')
              }
            >
              닉네임 변경
            </button>
            {focusBtn === 'nickname' && (
              <div className=" p-4 flex flex-col items-center">
                <div className="flex justify-between w-full mt-3">
                  <input
                    value={nicknameInput}
                    className="w-[calc(100%-52px)] border-b"
                    onChange={(e) => {
                      setNicknameInput(e.target.value);
                      if (e.target.value.length > 0) {
                        setIsCheckingDuplicate(false);
                      }
                    }}
                    placeholder="변경할 닉네임 입력 (3~15자)"
                    maxLength={15}
                  ></input>
                  <button
                    className={`${
                      !isCheckingDuplicate ? 'text-orange-400' : 'text-gray-400'
                    } text-sm text-center w-14`}
                    type="button"
                    onClick={() => handleConfirmDuplicationNickname()}
                    disabled={isCheckingDuplicate}
                  >
                    중복 확인
                  </button>
                </div>
                <button
                  className={`w-20 h-10 border mt-4`}
                  onClick={() => onUpdateNickname()}
                  type="button"
                >
                  변경
                </button>
              </div>
            )}
          </li>
          <li>
            <button
              className="gk-primary-login-button"
              onClick={() =>
                focusBtn === 'password'
                  ? setFocusBtn('')
                  : setFocusBtn('password')
              }
            >
              비밀번호 변경
            </button>
            {focusBtn === 'password' && (
              <div className=" p-4 flex flex-col items-center">
                <div className="flex flex-col justify-between w-full mt-3">
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <input
                        type="email"
                        className="w-full border-b"
                        {...field}
                        placeholder="현재 사용중인 이메일 입력하세요"
                      ></input>
                    )}
                  ></Controller>
                  <Controller
                    name="exPassword"
                    control={control}
                    rules={{
                      required: true,
                      pattern: PASSWORD_REGEX,
                    }}
                    render={({ field }) => (
                      <input
                        type="password"
                        className="w-full border-b mt-4"
                        {...field}
                        placeholder="현재 사용중인 비밀번호를 입력하세요"
                      ></input>
                    )}
                  ></Controller>
                  <Controller
                    name="newPassword"
                    control={control}
                    rules={{
                      required: true,
                      pattern: PASSWORD_REGEX,
                    }}
                    render={({ field }) => (
                      <input
                        type="password"
                        className="w-full border-b mt-4"
                        {...field}
                        placeholder="새로운 비밀번호를 입력하세요"
                      ></input>
                    )}
                  ></Controller>
                  <span className="text-red-600 text-xs">
                    {errors.newPassword?.type == 'pattern'
                      ? '* 소문자 영단어, 숫자, 특수문자를 모두 포함 8~20자'
                      : ''}
                  </span>
                </div>
                <input
                  className={`w-20 h-10 border mt-4`}
                  onClick={() => onChangePassword()}
                  type="submit"
                  value={'변경'}
                  disabled={isValid === false}
                ></input>
              </div>
            )}
          </li>
          <li>
            <button
              className="gk-primary-login-button"
              onClick={() => onLogOut()}
            >
              로그아웃
            </button>
          </li>
          <li>
            <button
              onClick={() =>
                focusBtn === 'delete' ? setFocusBtn('') : setFocusBtn('delete')
              }
              className="w-full text-center h-12 border rounded-md leading-9 text-sm text-gray-600"
            >
              회원 탈퇴
            </button>
            {focusBtn === 'delete' && (
              <div className=" p-4 flex flex-col items-center">
                {!isConfirm ? (
                  <div>
                    <h3 className="text-left text-[15px] mb-2">
                      탈퇴 시 골, 게시글, 댓글 데이터가 모두 삭제됩니다.
                      탈퇴하시겠습니까?
                    </h3>
                    <button
                      className="w-full text-center h-9 border bg-red-500 rounded-md leading-9 text-sm text-white"
                      onClick={() => setIsConfirm(true)}
                    >
                      네
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-left text-[15px] mx-2 mb-2">
                      아이디와 비밀번호를 입력해주세요
                    </h3>
                    <form onSubmit={handleDeleteMember} className="">
                      <input
                        type="email"
                        placeholder="example@example.com"
                        name="email"
                        className="w-full h-11 border rounded-md p-3"
                      ></input>
                      <input
                        type="password"
                        placeholder="password"
                        name="password"
                        className="w-full h-11 border rounded-md p-3 mb-5"
                      ></input>
                      {isError && (
                        <h1 className="text-left text-[15px] mb-2 mx-2 text-amber-600 font-extrabold">
                          {errorMessage}
                        </h1>
                      )}
                      <input
                        className="w-full bg-red-500 text-white h-11 font-bold text-lg rounded-md"
                        type="submit"
                        value={'탈퇴하기'}
                      ></input>
                    </form>
                  </div>
                )}
              </div>
            )}
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Account;
