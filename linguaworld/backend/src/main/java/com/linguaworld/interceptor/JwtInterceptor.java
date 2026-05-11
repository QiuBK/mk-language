package com.linguaworld.interceptor;

import cn.hutool.core.util.StrUtil;
import cn.hutool.jwt.JWTUtil;
import cn.hutool.jwt.JWTValidator;
import com.linguaworld.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token = request.getHeader("Authorization");
        
        if (StrUtil.isBlank(token)) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"未登录，请先登录\"}");
            return false;
        }
        
        try {
            // 验证Token
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            // 验证Token是否过期
            JWTValidator.of(token).validateDate();
            
            // 解析Token获取用户ID
            Map<String, Object> payload = JWTUtil.parsePayload(token);
            Long userId = Long.valueOf(payload.get("userId").toString());
            
            // 将用户ID存入request供后续使用
            request.setAttribute("userId", userId);
            
            return true;
        } catch (Exception e) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"登录已过期，请重新登录\"}");
            return false;
        }
    }
}
