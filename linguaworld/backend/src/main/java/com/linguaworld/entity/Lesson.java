package com.linguaworld.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("tb_lesson")
public class Lesson {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long chapterId;
    private String title;
    private String type;
    private String videoUrl;
    private Integer duration;
    private Integer sortOrder;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
