package com.linguaworld.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.linguaworld.entity.User;
import com.linguaworld.mapper.UserMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserService extends ServiceImpl<UserMapper, User> {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User login(String email, String password) {
        User user = this.getOne(new LambdaQueryWrapper<User>()
                .eq(User::getEmail, email)
                .eq(User::getStatus, 1));
        
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            // 更新最后登录时间
            user.setLastLoginAt(LocalDateTime.now());
            this.updateById(user);
            return user;
        }
        
        return null;
    }

    @Transactional
    public boolean register(UserService.RegisterRequest request) {
        // 检查用户名和邮箱是否存在
        long count = this.count(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, request.getUsername())
                .or()
                .eq(User::getEmail, request.getEmail()));
        
        if (count > 0) {
            return false;
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setAvatar("/assets/default-avatar.png");
        user.setRole(0);
        user.setNativeLanguage("zh");
        user.setCurrentLanguage("en");
        user.setLevel(1);
        user.setExp(0);
        user.setStreak(0);
        user.setTotalWords(0);
        user.setTotalMinutes(0);
        user.setStatus(1);
        user.setCreateTime(LocalDateTime.now());
        
        return this.save(user);
    }

    public User getUserById(Long userId) {
        return this.getById(userId);
    }

    public Map<String, Object> getLearningStats(Long userId) {
        User user = this.getById(userId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("streak", user.getStreak());
        stats.put("totalWords", user.getTotalWords());
        stats.put("totalMinutes", user.getTotalMinutes());
        stats.put("courseCount", 0);
        stats.put("speakingCount", 0);
        
        return stats;
    }

    public void updateUserInfo(User user) {
        this.updateById(user);
    }

    @Transactional
    public void addExp(Long userId, int amount) {
        User user = this.getById(userId);
        user.setExp(user.getExp() + amount);
        
        // 检查是否升级
        int newLevel = user.getExp() / 1000 + 1;
        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
        }
        
        this.updateById(user);
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String nickname;
    }
}
