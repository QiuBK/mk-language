package com.linguaworld.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("tb_user")
public class User {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String username;
    
    private String password;
    
    private String email;
    
    private String phone;
    
    private String nickname;
    
    private String avatar;
    
    private Integer role;
    
    private String nativeLanguage;
    
    private String currentLanguage;
    
    private Integer level;
    
    private Integer exp;
    
    private Integer streak;
    
    private Integer totalWords;
    
    private Integer totalMinutes;
    
    private Integer status;
    
    private LocalDateTime lastLoginAt;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
