package com.goalkeepers.server.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnswerRequestDto {

    @NotBlank(message = "답변 내용을 입력해주세요")
    private String content;
    
    @NotBlank(message = "문의를 선택해주세요")
    private Long inquiryId;
}
