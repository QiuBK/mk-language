package com.linguaworld.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("tb_enrollment")
public class Enrollment {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    private Long courseId;
    private Integer status;
    private Integer progress;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
