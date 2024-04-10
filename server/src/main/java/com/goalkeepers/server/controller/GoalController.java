package com.goalkeepers.server.controller;

import java.io.IOException;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.goalkeepers.server.dto.CommonResponseDto;
import com.goalkeepers.server.dto.GoalRequestDto;
import com.goalkeepers.server.dto.GoalResponseDto;
import com.goalkeepers.server.dto.GoalShareRequestDto;
import com.goalkeepers.server.dto.GoalUpdateRequestDto;
import com.goalkeepers.server.service.BoardService;
import com.goalkeepers.server.service.FirebaseStorageService;
import com.goalkeepers.server.service.GoalService;
import com.goalkeepers.server.service.LikeShareService;
import com.google.firebase.FirebaseException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/goal")
public class GoalController {
    
    /*
     *  나의 전체 버킷리스트 보기
        버킷 상세 보기
        버킷 생성
        버킷 수정
        버킷 삭제
     */

    private final GoalService goalService;
    private final FirebaseStorageService firebaseStorageService;
    private final LikeShareService likeShareService;
    private final BoardService boardService;
    
    
    @GetMapping("/all/me")
    public ResponseEntity<CommonResponseDto> getMyGoalLists(@RequestParam(name = "page") int pageNumber) {
        Page<GoalResponseDto> response = goalService.getMyGoalList(pageNumber);
        return ResponseEntity.ok(new CommonResponseDto(true, response));
    }

    @GetMapping("/all/me/completed")
    public ResponseEntity<CommonResponseDto> getCompletedGoalLists(@RequestParam(name = "page") int pageNumber) {
        Page<GoalResponseDto> response = goalService.getMyCompletedGoalList(pageNumber);
        return ResponseEntity.ok(new CommonResponseDto(true, response));
    }

    @GetMapping("")
    public ResponseEntity<CommonResponseDto> getOneGoal(@RequestParam(name = "id", required = true) Long goalId) {
        GoalResponseDto response = goalService.getSelectedGoal(goalId);
        return ResponseEntity.ok(new CommonResponseDto(true, response));
    }

    @PostMapping("")
    public ResponseEntity<CommonResponseDto> createMyGoal(@Valid @RequestPart(value = "goalInformation") GoalRequestDto requestDto,
                                                                @RequestPart(value = "image", required = false) MultipartFile multipartFile) throws IOException, FirebaseException {
        
        String imageUrl = null;                                                           
        if (multipartFile != null) {
            imageUrl = firebaseStorageService.upload(multipartFile, "images");
        }
        Long goalId = goalService.createMyGoal(requestDto, imageUrl);
        boardService.createMyPost(goalId);
        return ResponseEntity.ok(new CommonResponseDto(true, goalId + " Goal을 생성하였습니다."));
    }

    @PatchMapping("/completed")
    public ResponseEntity<CommonResponseDto> completeMyGoal(@RequestParam(name = "id", required = true) Long id) {
        return ResponseEntity.ok(new CommonResponseDto(true, goalService.completeMyGoal(id)));
    }

    @PutMapping("")
    public ResponseEntity<CommonResponseDto> updateMyGoal(@RequestParam(name = "id", required = true) Long id,
                                                    @Valid @RequestPart(value = "goalInformation", required = false) GoalUpdateRequestDto requestDto,
                                                    @RequestPart(value = "image", required = false) MultipartFile multipartFile) throws IOException, FirebaseException {
        
        goalService.updateMyGoal(requestDto, id, multipartFile);
        return ResponseEntity.ok(new CommonResponseDto(true, id + " Goal을 수정하였습니다."));
    }

    @DeleteMapping("")
    public ResponseEntity<CommonResponseDto> deleteMyGoal(@RequestParam(name = "id", required = true) Long id) {
        if (goalService.deleteMyGoal(id) == "삭제") {
            return ResponseEntity.ok(new CommonResponseDto(true, id + " Goal을 삭제하였습니다."));
        }
        else {
            return ResponseEntity.ok(new CommonResponseDto(true, id + " Goal을 삭제하였습니다. 이 Goal에 참여한 사람들이 있어 Goal에서 제목, 이미지는 사라지지 않습니다."));
        }
    }

    /*
     * 골 담기
     */

    // 연결된 골 찾기
    @GetMapping("/share")
    public ResponseEntity<CommonResponseDto> findMyGoalWithShare(@RequestParam(name = "goal-id") Long goalId) {
        GoalResponseDto response = likeShareService.findGoal(goalId);
        return ResponseEntity.ok(new CommonResponseDto(true, "연결된 Goal이 있습니다.", response));
    }

    // 담기 -> 골 만들기
    @PostMapping("/share")
    public ResponseEntity<CommonResponseDto> postShare(@Valid @RequestBody GoalShareRequestDto requestDto) {
        likeShareService.addShare(requestDto);
        return ResponseEntity.ok(new CommonResponseDto(true, "Goal " + requestDto.getGoalId() + " 담기 성공하였습니다."));
    }

    // 담기 취소하기 -> 골 삭제하기
    @DeleteMapping("/share")
    public ResponseEntity<CommonResponseDto> deleteShare(@Valid @RequestBody GoalShareRequestDto requestDto) {
        goalService.deleteMyGoal(requestDto.getGoalId());
        return ResponseEntity.ok(new CommonResponseDto(true, requestDto.getGoalId() + " Goal이 삭제되었습니다."));
    }
    
}