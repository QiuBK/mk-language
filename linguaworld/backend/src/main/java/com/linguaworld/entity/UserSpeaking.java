package com.linguaworld.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("tb_user_speaking")
public class UserSpeaking {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    private Long topicId;
    private String audioUrl;
    private Integer duration;
    private Integer score;
    private String feedback;
    private String errorPoints;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
