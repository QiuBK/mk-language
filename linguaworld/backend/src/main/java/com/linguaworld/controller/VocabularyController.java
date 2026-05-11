package com.linguaworld.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.linguaworld.common.Result;
import com.linguaworld.entity.Vocabulary;
import com.linguaworld.entity.UserWord;
import com.linguaworld.mapper.VocabularyMapper;
import com.linguaworld.mapper.UserWordMapper;
import com.linguaworld.service.VocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vocabulary")
@RequiredArgsConstructor
public class VocabularyController {

    private final VocabularyService vocabularyService;
    
    @Autowired(required = false)
    private VocabularyMapper vocabularyMapper;
    
    @Autowired(required = false)
    private UserWordMapper userWordMapper;

    /**
     * 获取单词列表
     */
    @GetMapping("/list")
    public Result<Map<String, Object>> getVocabularyList(
            @RequestParam String language,
            @RequestParam(required = false) String level,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        
        Page<Vocabulary> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<Vocabulary> wrapper = new LambdaQueryWrapper<>();
        
        wrapper.eq(Vocabulary::getLanguage, language);
        if (level != null && !level.isEmpty()) {
            wrapper.eq(Vocabulary::getLevel, level);
        }
        wrapper.orderByAsc(Vocabulary::getFrequency);
        
        Page<Vocabulary> result = vocabularyMapper.selectPage(pageParam, wrapper);
        
        Map<String, Object> data = new HashMap<>();
        data.put("list", result.getRecords());
        data.put("total", result.getTotal());
        
        return Result.success(data);
    }

    /**
     * 获取随机单词
     */
    @GetMapping("/random")
    public Result<List<Vocabulary>> getRandomWords(
            @RequestParam String language,
            @RequestParam(defaultValue = "20") Integer count) {
        
        List<Vocabulary> words = vocabularyService.getRandomWords(language, count);
        return Result.success(words);
    }

    /**
     * 标记单词状态
     */
    @PostMapping("/mark")
    public Result<Void> markWordStatus(
            @RequestAttribute Long userId,
            @RequestParam Long wordId,
            @RequestParam Integer status) {
        
        vocabularyService.markWordStatus(userId, wordId, status);
        return Result.success();
    }

    /**
     * 获取用户单词学习进度
     */
    @GetMapping("/progress")
    public Result<Map<String, Object>> getWordProgress(
            @RequestAttribute Long userId,
            @RequestParam String language) {
        
        Map<String, Object> progress = vocabularyService.getWordProgress(userId, language);
        return Result.success(progress);
    }

    /**
     * 获取错题本
     */
    @GetMapping("/wrong")
    public Result<List<Vocabulary>> getWrongWords(@RequestAttribute Long userId) {
        List<Vocabulary> wrongWords = vocabularyService.getWrongWords(userId);
        return Result.success(wrongWords);
    }
}
