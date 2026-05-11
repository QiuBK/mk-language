package com.linguaworld.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.linguaworld.common.Result;
import com.linguaworld.entity.SpeakingTopic;
import com.linguaworld.entity.UserSpeaking;
import com.linguaworld.mapper.SpeakingTopicMapper;
import com.linguaworld.mapper.UserSpeakingMapper;
import com.linguaworld.service.SpeakingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/speaking")
@RequiredArgsConstructor
public class SpeakingController {

    private final SpeakingService speakingService;
    
    @Autowired(required = false)
    private SpeakingTopicMapper speakingTopicMapper;
    
    @Autowired(required = false)
    private UserSpeakingMapper userSpeakingMapper;

    /**
     * 获取口语题目列表
     */
    @GetMapping("/topics")
    public Result<List<SpeakingTopic>> getSpeakingTopics(
            @RequestParam String language,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String type) {
        
        LambdaQueryWrapper<SpeakingTopic> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SpeakingTopic::getLanguage, language);
        
        if (difficulty != null && !difficulty.isEmpty()) {
            wrapper.eq(SpeakingTopic::getDifficulty, difficulty);
        }
        if (type != null && !type.isEmpty()) {
            wrapper.eq(SpeakingTopic::getType, type);
        }
        
        List<SpeakingTopic> topics = speakingTopicMapper.selectList(wrapper);
        return Result.success(topics);
    }

    /**
     * 获取随机口语题目
     */
    @GetMapping("/random")
    public Result<SpeakingTopic> getRandomTopic(@RequestParam String language) {
        SpeakingTopic topic = speakingService.getRandomTopic(language);
        return Result.success(topic);
    }

    /**
     * 提交口语录音
     */
    @PostMapping("/submit")
    public Result<Map<String, Object>> submitSpeaking(
            @RequestAttribute Long userId,
            @RequestParam Long topicId,
            @RequestParam MultipartFile audio,
            @RequestParam(defaultValue = "0") Integer duration) {
        
        try {
            // 保存音频文件
            String audioUrl = speakingService.saveAudioFile(audio);
            
            // 提交并获取AI评分结果
            Map<String, Object> result = speakingService.submitAndScore(userId, topicId, audioUrl, duration);
            
            return Result.success(result);
        } catch (IOException e) {
            return Result.error("音频上传失败");
        }
    }

    /**
     * 获取口语练习历史
     */
    @GetMapping("/history")
    public Result<Map<String, Object>> getSpeakingHistory(
            @RequestAttribute Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        
        Page<UserSpeaking> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<UserSpeaking> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserSpeaking::getUserId, userId);
        wrapper.orderByDesc(UserSpeaking::getCreateTime);
        
        Page<UserSpeaking> result = userSpeakingMapper.selectPage(pageParam, wrapper);
        
        Map<String, Object> data = new HashMap<>();
        data.put("list", result.getRecords());
        data.put("total", result.getTotal());
        
        return Result.success(data);
    }
}
