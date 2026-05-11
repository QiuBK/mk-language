package com.linguaworld.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("tb_vocabulary")
public class Vocabulary {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String language;
    private String word;
    private String pronunciation;
    private String translation;
    private String example;
    private String exampleTranslation;
    private String audioUrl;
    private String level;
    private Integer frequency;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
