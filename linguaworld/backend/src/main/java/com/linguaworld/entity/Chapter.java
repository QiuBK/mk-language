package com.linguaworld.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("tb_chapter")
public class Chapter {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long courseId;
    private String title;
    private Integer sortOrder;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(exist = false)
    private java.util.List<Lesson> lessons;
}
