package com.goalkeepers.server.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goalkeepers.server.common.ServiceHelper;
import com.goalkeepers.server.dto.SettingResponseDto;
import com.goalkeepers.server.dto.SettingUpdateRequestDto;
import com.goalkeepers.server.entity.Member;
import com.goalkeepers.server.entity.Setting;
import com.goalkeepers.server.repository.MemberRepository;
import com.goalkeepers.server.repository.SettingRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class SettingService extends ServiceHelper {

    private final MemberRepository memberRepository;
    private final SettingRepository settingRepository;


    public SettingResponseDto getMySettings() {
        Member member = isMemberCurrent(memberRepository);
        Setting mySetting = settingRepository.findByMember(member)
                            .orElseGet(() -> settingRepository.save(new Setting(member)));
        return SettingResponseDto.of(mySetting);
    }

    public void changeAlarm(SettingUpdateRequestDto requestDto) {
        Member member = isMemberCurrent(memberRepository);
        Setting mySetting = settingRepository.findByMember(member)
                            .orElseGet(() -> settingRepository.save(new Setting(member)));
        Setting.settingUpdate(mySetting, requestDto);
    }

    
}