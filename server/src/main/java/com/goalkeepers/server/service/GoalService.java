package com.goalkeepers.server.service;

import java.util.List;
import java.util.Objects;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.io.IOException;

import org.springframework.context.annotation.DependsOn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.goalkeepers.server.common.ServiceHelper;
import com.goalkeepers.server.config.SecurityUtil;
import com.goalkeepers.server.dto.GoalRequestDto;
import com.goalkeepers.server.dto.GoalResponseDto;
import com.goalkeepers.server.dto.GoalUpdateRequestDto;
import com.goalkeepers.server.entity.Goal;
import com.goalkeepers.server.entity.Member;
import com.goalkeepers.server.entity.Post;
import com.goalkeepers.server.entity.TYPE;
import com.goalkeepers.server.repository.GoalRepository;
import com.goalkeepers.server.repository.GoalShareRepository;
import com.goalkeepers.server.repository.MemberRepository;
import com.goalkeepers.server.repository.PostRepository;
import com.goalkeepers.server.repository.SettingRepository;
import com.google.firebase.FirebaseException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@DependsOn("firebaseStorageService")
public class GoalService extends ServiceHelper{
    
    private final GoalRepository goalRepository;
    private final MemberRepository memberRepository;
    private final GoalShareRepository shareRepository;
    private final SettingRepository settingRepository;
    private final PostRepository postRepository;
    private final FirebaseStorageService firebaseStorageService;
    private final NotificationService notificationService;
    private final LikeShareService likeShareService;
    

    /*
     *  나의 전체 버킷리스트 보기
        버킷 상세 보기
        버킷 생성
        버킷 삭제
        버킷 수정
     */
    @Transactional
    public Page<GoalResponseDto> getMyGoalList(int pageNumber) {
        Long memberId = SecurityUtil.getCurrentMemberId();
        return goalRepository.getMyAllGoal(PageRequest.of(pageNumber - 1, 18), memberId, false);
    }

    @Transactional
    public Page<GoalResponseDto> getMyCompletedGoalList(int pageNumber) {
        Long memberId = SecurityUtil.getCurrentMemberId();
        return goalRepository.getMyAllGoal(PageRequest.of(pageNumber - 1, 18), memberId,true);
    }

    // 모든 유저가 접근 가능
    @Transactional
    public GoalResponseDto getSelectedGoal(Long goalId) {
        Long memberId = SecurityUtil.getCurrentMemberId();
        Member member = memberId != null ? memberRepository.findById(memberId).get() : null;
        Goal goal = isGoal(goalRepository, goalId);
        String imageUrl = goal.getImageUrl();
        if(Objects.nonNull(imageUrl) && !imageUrl.isEmpty()) {
            imageUrl = firebaseStorageService.showFile(imageUrl);
        }
        if(member == null) {
            return GoalResponseDto.of(goal, imageUrl, findJoinMemberList(goal, shareRepository));
        }
        Boolean isShare = shareRepository.existsByMemberAndGoal(member, goal);
        return GoalResponseDto.of(goal, imageUrl, isShare, findJoinMemberList(goal, shareRepository));
    }

    @Transactional
    public Long createMyGoal(GoalRequestDto requestDto, String imageUrl) {
        Member member = isMemberCurrent(memberRepository);
        Goal goal = goalRepository.save(requestDto.toGoal(member, imageUrl));
        return goal.getId();
        //return GoalResponseDto.of(goalRepository.save(requestDto.toGoal(member, imageUrl)), null);
    }

    @Transactional
    public void updateMyGoal(GoalUpdateRequestDto requestDto, Long goalId, MultipartFile multipartFile) throws IOException, FirebaseException {
        Goal currentGoal = isMyGoal(memberRepository, goalRepository, goalId);
        
        if (multipartFile == null && requestDto != null) {
            /* 이미지를 변경하지 않고 삭제 */
            if(requestDto.isDeleteImage() == true) {
                String imageUrl = currentGoal.getImageUrl();
                if (Objects.nonNull(imageUrl) && !imageUrl.isEmpty()) {
                    firebaseStorageService.deleteFile(imageUrl);
                }
                Goal.goalUpdate(currentGoal, requestDto, null);
                //return GoalResponseDto.of(Goal.goalUpdate(currentGoal, requestDto, null), findJoinMemberList(currentGoal));
            } else {
                /* 이미지 변경 안함 */
                Goal.goalUpdate(currentGoal, requestDto, null);
                //return GoalResponseDto.of(Goal.goalUpdate(currentGoal, requestDto, null), showImageUrl, findJoinMemberList(currentGoal));         
            }         
        } else {
            /* 이미지 변경 */
            String imageUrl = currentGoal.getImageUrl();
            if (Objects.nonNull(imageUrl) && !imageUrl.isEmpty()) {
                // 원래 골의 이미지 삭제
                firebaseStorageService.deleteFile(imageUrl);
            }
            // 새로운 이미지 업로드
            String newImageUrl = firebaseStorageService.upload(multipartFile, "images");
            
            // 이미지 url 가져오기
            //String showImageUrl = firebaseStorageService.showFile(newImageUrl);

            // DB 업데이트
            Goal.goalUpdate(currentGoal, requestDto, newImageUrl);
            //return GoalResponseDto.of(Goal.goalUpdate(currentGoal, requestDto, newImageUrl), showImageUrl, findJoinMemberList(currentGoal));
        }
    }

    @Transactional
    public String deleteMyGoal(Long goalId) {
        Goal goal = isMyGoal(memberRepository, goalRepository, goalId);

        // 이미지 지우기
        String imageUrl = goal.getImageUrl();
        if (Objects.nonNull(imageUrl) && !imageUrl.isEmpty()) {
            firebaseStorageService.deleteFile(imageUrl);
            goal.setImageUrl(null);
        }

        // 참여한 사람들이 없을 때
        if(!shareRepository.existsByGoal(goal)) {
            likeShareService.deleteShare(goal);
            goalRepository.delete(goal);
            return "삭제";
        } else { // 참여한 사람들이 있을 때
            // 포스트 삭제 (응원해요, 컨텐트 좋아요, 컨텐트 삭제)
            Post post = postRepository.findByGoal(goal).orElse(null);
            if(Objects.nonNull(post)) {
                postRepository.delete(post);
            }
            // title, share_cnt 제외 정보 지우기
            Goal.disconnectedGoal(goal);
            return "정보 삭제";
        }
    }

    // 탈퇴할 때
    public void deleteGoal(Goal goal) {
        // 이미지 지우기
        String imageUrl = goal.getImageUrl();
        if (Objects.nonNull(imageUrl) && !imageUrl.isEmpty()) {
            firebaseStorageService.deleteFile(imageUrl);
            goal.setImageUrl(null);
        }

        // 참여한 사람들이 있음
        if (shareRepository.existsByGoal(goal)) {
            Post post = postRepository.findByGoal(goal).orElse(null);
            if(Objects.nonNull(post)) {
                postRepository.delete(post);
            }
            Goal.disconnectedGoal(goal);
            goalRepository.flush();
        } else {
            likeShareService.deleteShare(goal);
            goalRepository.delete(goal);
        }
    }

    @Transactional
    public String completeMyGoal(Long goalId) {
        Goal goal = isMyGoal(memberRepository, goalRepository, goalId);
        if(goal.isCompleted()) {
            goal.setCompleted(false);
            goal.setCompleteDate(null);
            return goalId + " Goal 완료 취소하였습니다.";
        } else {
            LocalDateTime today = LocalDateTime.now();
            goal.setCompleted(true);
            goal.setCompleteDate(today);
            return goalId + " Goal 완료하였습니다.";
        }
        
    }

    /*
     * 알림
     */
    @Transactional
    public void notifyOneWeekLeftGoal() {
        List<Goal> goals = goalRepository.findAllByEndDate(LocalDate.now().plusWeeks(1));
        for (Goal goal : goals) {
            Member receiver = alarmTrueReceiver(settingRepository, goal.getMember(), TYPE.WEEKLEFT);
            if(Objects.nonNull(receiver)) {
                notificationService.send(receiver, null, TYPE.WEEKLEFT, goal.getId(), goal.getTitle(), null, null);
            }
        }
    }

    @Transactional
    public void notifyOneDayLeftGoal() {
        List<Goal> goals = goalRepository.findAllByEndDate(LocalDate.now().plusDays(1));
        for (Goal goal : goals) {
            Member receiver = alarmTrueReceiver(settingRepository, goal.getMember(), TYPE.DAYLEFT);
            if(Objects.nonNull(receiver)) {
                notificationService.send(receiver, null, TYPE.DAYLEFT, goal.getId(), goal.getTitle(), null, null);
            }
        }
    }

    @Transactional
    public void notifyCompletedGoalNumber() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterdayStart = LocalDateTime.of(now.minusDays(1).toLocalDate(), LocalTime.MIN);
        LocalDateTime yesterdayEnd = LocalDateTime.of(now.minusDays(1).toLocalDate(), LocalTime.MAX);
        List<Goal> goals = goalRepository.findAllByCompleteDateBetween(yesterdayStart, yesterdayEnd);
        int completedGoalNumber = goals.size();
        for (Member member : memberRepository.findAll()) {
            Member receiver = alarmTrueReceiver(settingRepository, member, TYPE.TODAY);
            if(Objects.nonNull(receiver)) {
                notificationService.send(receiver, null, TYPE.TODAY, null, null, "어제 완료된 목표는 " + completedGoalNumber + "개 입니다.", null);
            }
        }
    }
}
