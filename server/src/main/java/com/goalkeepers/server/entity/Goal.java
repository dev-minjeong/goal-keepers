package com.goalkeepers.server.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

import org.hibernate.annotations.ColumnDefault;

import com.goalkeepers.server.dto.GoalUpdateRequestDto;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name= "GOAL_TB")
public class Goal {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "goal_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = true)
    private Member member;

    @Column(length = 18)
    @NotNull
    private String title;

    @Column(length = 60)
    private String description;

    @Column
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    @Column
    private LocalDateTime completeDate;

    @Column(length = 50)
    private String imageUrl;

    @ColumnDefault("0")
    private int shareCnt;

    @Column(columnDefinition = "boolean default false")
    private boolean completed;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "share_id", nullable = true)
    private GoalShare share;

    @OneToOne(mappedBy = "goal", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    private Post post;


    public static Goal goalUpdate(Goal goal, GoalUpdateRequestDto requestDto, String imageUrl) {
        if (Objects.isNull(requestDto)) {
            goal.imageUrl = imageUrl;
            return goal;
        }
        goal.description = Optional.ofNullable(requestDto.getDescription()).orElse(goal.getDescription());
        goal.startDate = Optional.ofNullable(requestDto.getStartDate()).orElse(goal.getStartDate());
        goal.endDate = Optional.ofNullable(requestDto.getEndDate()).orElse(goal.getEndDate());
        goal.imageUrl = Optional.ofNullable(imageUrl).orElse(goal.getImageUrl());
        return goal;
    }

    public static Goal disconnectedGoal(Goal goal) {
        goal.description = null;
        goal.startDate = null;
        goal.endDate = null;
        goal.member = null;
        goal.completed = false;
        goal.share = null;
        goal.completeDate = null;
        goal.imageUrl = null;
        return goal;
    }

    public Goal(GoalShare share, String title, String description, String imageUrl, LocalDate startDate, LocalDate endDate, Member member) {
        this.share = share;
        this.member = member;
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.imageUrl = imageUrl;
    }
}
