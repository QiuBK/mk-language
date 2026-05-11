package com.linguaworld.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("tb_speaking_topic")
public class SpeakingTopic {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String language;
    private String title;
    private String content;
    private String audioUrl;
    private String type;
    private String difficulty;
    private String keywords;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
