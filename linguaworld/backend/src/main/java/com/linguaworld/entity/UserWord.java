package com.linguaworld.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("tb_user_word")
public class UserWord {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    private Long wordId;
    private String language;
    private Integer status;
    private Integer reviewCount;
    private LocalDateTime nextReviewAt;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
