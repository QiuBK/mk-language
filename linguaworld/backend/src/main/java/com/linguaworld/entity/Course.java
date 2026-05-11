package com.linguaworld.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("tb_course")
public class Course {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String title;
    private String titleEn;
    private String titleJa;
    private String titleKo;
    private String description;
    private String language;
    private String level;
    private String type;
    private String coverImage;
    private String videoUrl;
    private Integer duration;
    private BigDecimal price;
    private Long teacherId;
    private Integer totalLessons;
    private Integer enrolledCount;
    private BigDecimal rating;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableField(exist = false)
    private String teacherName;
    
    @TableField(exist = false)
    private Integer completedLessons;
}
