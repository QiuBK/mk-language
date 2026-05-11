package com.linguaworld.controller;

import com.linguaworld.common.Result;
import com.linguaworld.entity.User;
import com.linguaworld.service.UserService;
import com.linguaworld.utils.JwtUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginRequest request) {
        User user = userService.login(request.getEmail(), request.getPassword());
        
        if (user == null) {
            return Result.error(401, "邮箱或密码错误");
        }
        
        // 生成Token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        
        // 返回用户信息和Token
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("userInfo", user);
        
        return Result.success(data);
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<Void> register(@RequestBody RegisterRequest request) {
        boolean success = userService.register(request);
        
        if (!success) {
            return Result.error("注册失败，用户名或邮箱已存在");
        }
        
        return Result.success();
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/info")
    public Result<User> getUserInfo(@RequestAttribute Long userId) {
        User user = userService.getUserById(userId);
        
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        // 隐藏密码
        user.setPassword(null);
        
        return Result.success(user);
    }

    /**
     * 获取学习统计
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getLearningStats(@RequestAttribute Long userId) {
        Map<String, Object> stats = userService.getLearningStats(userId);
        return Result.success(stats);
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/info")
    public Result<Void> updateUserInfo(@RequestAttribute Long userId, @RequestBody User user) {
        user.setId(userId);
        userService.updateUserInfo(user);
        return Result.success();
    }

    /**
     * 退出登录
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success();
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String nickname;
    }
}
