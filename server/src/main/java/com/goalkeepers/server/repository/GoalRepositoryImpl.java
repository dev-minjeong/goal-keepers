package com.goalkeepers.server.repository;

import java.lang.Object;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.goalkeepers.server.common.RepositoryHelper;
import com.goalkeepers.server.dto.CommunityContentResponseDto;
import com.goalkeepers.server.dto.CommunityResponseDto;
import com.goalkeepers.server.dto.GoalResponseDto;
import com.goalkeepers.server.entity.Goal;
import com.goalkeepers.server.entity.GoalShare;
import com.goalkeepers.server.entity.Member;
import com.goalkeepers.server.entity.PostContent;
import com.goalkeepers.server.entity.SORT;
import com.goalkeepers.server.service.FirebaseStorageService;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;

import static com.goalkeepers.server.entity.QGoal.goal;
import static com.goalkeepers.server.entity.QMember.member;
import static com.goalkeepers.server.entity.QPostContent.postContent;
import static com.goalkeepers.server.entity.QSetting.setting;

@Repository
public class GoalRepositoryImpl implements GoalRepositoryCustom {
    
    private final JPAQueryFactory queryFactory;
    private final FirebaseStorageService firebaseStorageService;
    private final GoalShareRepository shareRepository;
    private final MemberRepository memberRepository;
    private final PostLikeRepository likeRepository;
    private final Pageable contentPageable;

    public GoalRepositoryImpl(
            JPAQueryFactory queryFactory,
            FirebaseStorageService firebaseStorageService,
            GoalShareRepository shareRepository,
            PostLikeRepository likeRepository,
            MemberRepository memberRepository) {

        this.queryFactory = queryFactory;
        this.firebaseStorageService = firebaseStorageService;
        this.shareRepository = shareRepository;
        this.likeRepository = likeRepository;
        this.memberRepository = memberRepository;
        this.contentPageable = PageRequest.of(1 - 1, 3); // 일단 3개만 보여줌
    }

    @Override
    public Page<GoalResponseDto> getMyAllGoal(Pageable pageable, Long memberId, Boolean completed) {
        
        List<Goal> goals = queryFactory
                            .selectFrom(goal)
                            .leftJoin(goal.member, member)
                            .where(member.id.eq(memberId).and(goal.completed.eq(completed)))
                            .orderBy(goal.id.desc())
                            .offset(pageable.getOffset())
                            .limit(pageable.getPageSize())
                            .fetch();

        List<GoalResponseDto> page = goals
            .stream()
            .map(goal -> {
                String imageUrl = RepositoryHelper.getImageUrl(goal, firebaseStorageService);
                Goal shareGoal = goal;
                GoalShare share = goal.getShare();
                if(Objects.nonNull(share)) {
                    shareGoal = Optional.ofNullable(share.getGoal()).orElse(null);
                }
                List<Map<String, Object>> joinMemberList = RepositoryHelper.getJoinMemberList(shareGoal, shareRepository);
                return GoalResponseDto.of(goal, imageUrl, joinMemberList);
            })
            .collect(Collectors.toList());

        int totalSize = queryFactory
                        .selectFrom(goal)
                        .leftJoin(goal.member, member)
                        .where(member.id.eq(memberId))
                        .fetch()
                        .size();
        
        return new PageImpl<>(page, pageable, totalSize);
    }

	@Override
	public Page<CommunityResponseDto> getAllNewGoal(Pageable pageable) {
		List<Goal> goals = queryFactory
                            .selectFrom(goal)
                            .orderBy(goal.id.desc())
                            .where(goal.share.isNull())
                            .offset(pageable.getOffset())
                            .limit(pageable.getPageSize())
                            .fetch();

        List<CommunityResponseDto> page = goals
            .stream()
            .map(goal -> {

                // 이미지 URL
                String originalGoalImageUrl = RepositoryHelper.getImageUrl(goal, firebaseStorageService);

                // 담기했는지
                Member member = RepositoryHelper.MemberOrNull(memberRepository);
                boolean isShare = RepositoryHelper.isShareGoal(goal, member, shareRepository);

                // joinMemberList 가져오기
                List<Map<String, Object>> joinMemberList = RepositoryHelper.getJoinMemberList(goal, shareRepository);

                // PostContent 가져오기
                List<PostContent> contents = queryFactory
                                                .selectFrom(postContent)
                                                .where(postContent.shareGoal.eq(goal)
                                                    .and(postContent.post.privated.eq(false)))
                                                .orderBy(postContent.createdAt.desc())
                                                .offset(contentPageable.getOffset())
                                                .limit(contentPageable.getPageSize())
                                                .fetch();
                                            
                List<CommunityContentResponseDto> contentList = contents
                                                .stream()
                                                .map(content -> CommunityContentResponseDto.of(
                                                                content, 
                                                                content.getPost().getGoal(), 
                                                                content.getMember().getNickname(), 
                                                                RepositoryHelper.isLikeContent(content, member, likeRepository), 
                                                                null))
                                                .collect(Collectors.toList());

                return CommunityResponseDto.of(goal, originalGoalImageUrl, isShare, joinMemberList, contentList, null);
            }).collect(Collectors.toList());

        int totalSize = queryFactory
                        .selectFrom(goal)
                        .fetch()
                        .size();
        
        return new PageImpl<>(page, pageable, totalSize);
	}

	@Override
	public Page<CommunityResponseDto> getAllPopularGoal(Pageable pageable) {
        LocalDateTime sixHoursAgo = LocalDateTime.now().minus(6, ChronoUnit.HOURS);

		List<Tuple> popularGoalAndCountList = queryFactory
                            .select(postContent.shareGoal, postContent.count())
                            .from(postContent)
                            .where(postContent.createdAt.after(sixHoursAgo)
                                .and(postContent.post.privated.isFalse()))
                            .groupBy(postContent.shareGoal)
                            .orderBy(postContent.count().desc())
                            .offset(pageable.getOffset())
                            .limit(pageable.getPageSize())
                            .fetch();
                                    

        List<CommunityResponseDto> page = popularGoalAndCountList
            .stream()
            .map(tuple -> {
                Goal goal = tuple.get(postContent.shareGoal);
                Long count = tuple.get(postContent.count());

                String originalGoalImageUrl = RepositoryHelper.getImageUrl(goal, firebaseStorageService);
                Member member = RepositoryHelper.MemberOrNull(memberRepository);
                boolean isShare = RepositoryHelper.isShareGoal(goal, member, shareRepository);
                List<Map<String, Object>> joinMemberList = RepositoryHelper.getJoinMemberList(goal, shareRepository);

                List<PostContent> contents = queryFactory
                                                .selectFrom(postContent)
                                                .where(postContent.shareGoal.eq(goal)
                                                    .and(postContent.post.privated.eq(false)))
                                                .orderBy(postContent.createdAt.desc())
                                                .offset(contentPageable.getOffset())
                                                .limit(contentPageable.getPageSize())
                                                .fetch();
                List<CommunityContentResponseDto> contentList = contents
                                                .stream()
                                                .map(content -> CommunityContentResponseDto.of(
                                                                content, 
                                                                content.getPost().getGoal(), 
                                                                content.getMember().getNickname(), 
                                                                RepositoryHelper.isLikeContent(content, member, likeRepository), 
                                                                null))
                                                .collect(Collectors.toList());
                
                return CommunityResponseDto.of(goal, originalGoalImageUrl, isShare, joinMemberList, contentList, count);
            }).collect(Collectors.toList());

        int totalSize = queryFactory
                        .select(postContent.shareGoal, postContent.count())
                        .from(postContent)
                        .where(postContent.createdAt.after(sixHoursAgo))
                        .groupBy(postContent.shareGoal)
                        .fetch()
                        .size();
        
        return new PageImpl<>(page, pageable, totalSize);
	}

	@Override
	public Page<CommunityResponseDto> searchCommunity(Pageable pageable, String query, SORT sort) {
		
        List<Goal> goals = null;
        int totalSize = 0;
        if(SORT.NEW.equals(sort)) {
            goals = queryFactory
                    .selectFrom(goal)
                    .where(goal.share.isNull().and(
                        goal.title.contains(query)
                        .or(goal.description.contains(query))
                        .or(goal.id.in(
                            JPAExpressions
                                .select(postContent.shareGoal.id)
                                .from(postContent)
                                .where(postContent.content.contains(query))
                        ))
                    ))
                    .orderBy(goal.id.desc())
                    .offset(pageable.getOffset())
                    .limit(pageable.getPageSize())
                    .fetch();
            totalSize = queryFactory
                        .selectFrom(goal)
                        .where(goal.share.isNull().and(
                            goal.title.contains(query)
                            .or(goal.description.contains(query))
                            .or(goal.id.in(
                                JPAExpressions
                                    .select(postContent.shareGoal.id)
                                    .from(postContent)
                                    .where(postContent.content.contains(query))
                            ))
                        ))
                        .fetch()
                        .size();
        } else if (SORT.POPULAR.equals(sort)) {
            goals = queryFactory
                    .selectFrom(goal)
                    .where(goal.id.in(
                            JPAExpressions
                                    .select(postContent.shareGoal.id)
                                    .from(postContent)
                                    .where(postContent.createdAt.after(LocalDateTime.now().minusHours(6))
                                        .and(postContent.content.contains(query)
                                            .or(postContent.shareGoal.title.contains(query)
                                            .or(postContent.shareGoal.description.contains(query)))))
                                    .groupBy(postContent.shareGoal.id)
                    ))
                    .offset(pageable.getOffset())
                    .limit(pageable.getPageSize())
                    .fetch();
            totalSize = queryFactory
                    .selectFrom(goal)
                    .where(goal.id.in(
                            JPAExpressions
                                    .select(postContent.shareGoal.id)
                                    .from(postContent)
                                    .where(postContent.createdAt.after(LocalDateTime.now().minusHours(6))
                                        .and(postContent.content.contains(query)
                                            .or(postContent.shareGoal.title.contains(query)
                                            .or(postContent.shareGoal.description.contains(query)))))
                                    .groupBy(postContent.shareGoal.id)
                    ))
                    .fetch()
                    .size();
        } else {
            throw new MethodArgumentTypeMismatchException(null, null, null, null, null);
        }

        List<CommunityResponseDto> page = goals
            .stream()
            .map(goal -> {

                String originalGoalImageUrl = RepositoryHelper.getImageUrl(goal, firebaseStorageService);
                Member member = RepositoryHelper.MemberOrNull(memberRepository);
                boolean isShare = RepositoryHelper.isShareGoal(goal, member, shareRepository);
                List<Map<String, Object>> joinMemberList = RepositoryHelper.getJoinMemberList(goal, shareRepository);
                List<PostContent> contents = queryFactory
                                                .selectFrom(postContent)
                                                .where(postContent.shareGoal.eq(goal)
                                                    .and(postContent.post.privated.eq(false)))
                                                .orderBy(postContent.createdAt.desc())
                                                .offset(contentPageable.getOffset())
                                                .limit(contentPageable.getPageSize())
                                                .fetch();
                                            
                List<CommunityContentResponseDto> contentList = contents
                                                .stream()
                                                .map(content -> CommunityContentResponseDto.of(
                                                                content, 
                                                                content.getPost().getGoal(), 
                                                                content.getMember().getNickname(), 
                                                                RepositoryHelper.isLikeContent(content, member, likeRepository), 
                                                                null))
                                                .collect(Collectors.toList());

                return CommunityResponseDto.of(goal, originalGoalImageUrl, isShare, joinMemberList, contentList, null);
            }).collect(Collectors.toList());
        
        return new PageImpl<>(page, pageable, totalSize);
	}

    @Override
    public List<Goal> findAllByEndDate(LocalDate endDate) {
        return queryFactory
            .selectFrom(goal)
            .join(goal.member, member).fetchJoin()
            .join(member, setting.member).on(setting.ddayAlarm.eq(true)).fetchJoin()
            .where(goal.endDate.eq(endDate))
            .fetch();
    }

    @Override
    public List<Goal> findAllByCompleteDateBetween(LocalDateTime startTime, LocalDateTime endTime) {
        return queryFactory
                .selectFrom(goal)
                .join(goal.member, member).fetchJoin()
                .join(member, setting.member).on(setting.todayAlarm.eq(true)).fetchJoin()
                .where(goal.completeDate.between(startTime, endTime))
                .fetch();
    }
}
