package com.goalkeepers.server.repository;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.goalkeepers.server.dto.CommunityResponseDto;
import com.goalkeepers.server.dto.GoalResponseDto;
import com.goalkeepers.server.entity.Goal;
import com.goalkeepers.server.entity.SORT;

public interface GoalRepositoryCustom {
    Page<GoalResponseDto> getMyAllGoal(Pageable pageable, Long memberId, Boolean completed);
    Page<CommunityResponseDto> getAllNewGoal(Pageable pageable);
    Page<CommunityResponseDto> getAllPopularGoal(Pageable pageable);
    Page<CommunityResponseDto> searchCommunity(Pageable pageable, String query, SORT sort);
    List<Goal> findAllByEndDate(LocalDate endDate);
    List<Goal> findAllByCompleteDateBetween(LocalDateTime startTime, LocalDateTime endTime);
}