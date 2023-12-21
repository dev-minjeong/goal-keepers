package com.goalkeepers.server.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goalkeepers.server.config.SecurityUtil;
import com.goalkeepers.server.dto.MemberResponseDto;
import com.goalkeepers.server.entity.Member;
import com.goalkeepers.server.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {
    
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public MemberResponseDto getMyInfoBySecurity() {
        return memberRepository.findById(SecurityUtil.getCurrentMemberId())
                .map(MemberResponseDto::of)
                .orElseThrow(() -> new RuntimeException("로그인 유저 정보가 없습니다."));
    }

    // 닉네임 변경
    @Transactional
    public MemberResponseDto changeMemberNickname(String nickname) {
        Member member = isMemberCurrent();
        member.setNickname(nickname);
        return MemberResponseDto.of(memberRepository.save(member));
    }

    // 비밀번호 변경
    @Transactional
    public MemberResponseDto changeMemberPassword(String email, String exPassword, String newPassword) {
        Member member = isMemberCurrent();
        if (!passwordEncoder.matches(exPassword, member.getPassword())) {
            throw new RuntimeException("비밀번호가 다릅니다.");
        }
        member.setPassword(passwordEncoder.encode(newPassword));
        return MemberResponseDto.of(memberRepository.save(member));
    }

    // 로그인 했는지 확인
    public Member isMemberCurrent() {
        return memberRepository.findById(SecurityUtil.getCurrentMemberId())
                .orElseThrow(() -> new RuntimeException("로그인 유저 정보가 없습니다"));
    }
}
