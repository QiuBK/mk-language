package com.linguaworld.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.linguaworld.entity.Vocabulary;
import com.linguaworld.entity.UserWord;
import com.linguaworld.mapper.VocabularyMapper;
import com.linguaworld.mapper.UserWordMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VocabularyService extends ServiceImpl<VocabularyMapper, Vocabulary> {

    @Autowired(required = false)
    private VocabularyMapper vocabularyMapper;
    
    @Autowired(required = false)
    private UserWordMapper userWordMapper;

    public List<Vocabulary> getRandomWords(String language, Integer count) {
        return vocabularyMapper.selectRandomWords(language, count);
    }

    @Transactional
    public void markWordStatus(Long userId, Long wordId, Integer status) {
        Vocabulary vocabulary = vocabularyMapper.selectById(wordId);
        
        // 检查是否已记录
        UserWord userWord = userWordMapper.selectOne(
            new LambdaQueryWrapper<UserWord>()
                .eq(UserWord::getUserId, userId)
                .eq(UserWord::getWordId, wordId)
        );
        
        if (userWord == null) {
            userWord = new UserWord();
            userWord.setUserId(userId);
            userWord.setWordId(wordId);
            userWord.setLanguage(vocabulary.getLanguage());
            userWord.setStatus(status);
            userWord.setReviewCount(1);
            userWord.setCreateTime(LocalDateTime.now());
            userWord.setUpdateTime(LocalDateTime.now());
            userWordMapper.insert(userWord);
        } else {
            userWord.setStatus(status);
            userWord.setReviewCount(userWord.getReviewCount() + 1);
            userWord.setUpdateTime(LocalDateTime.now());
            
            // 设置下次复习时间（基于SM2算法的简化版）
            int days = calculateNextReviewDays(userWord.getReviewCount(), status);
            userWord.setNextReviewAt(LocalDateTime.now().plusDays(days));
            
            userWordMapper.updateById(userWord);
        }
    }

    private int calculateNextReviewDays(int reviewCount, int status) {
        if (status == 2) { // 不认识
            return 1;
        } else if (status == 1) { // 记住了
            return switch (reviewCount) {
                case 1 -> 1;
                case 2 -> 3;
                case 3 -> 7;
                case 4 -> 14;
                default -> 30;
            };
        }
        return 1;
    }

    public Map<String, Object> getWordProgress(Long userId, String language) {
        List<UserWord> userWords = userWordMapper.selectList(
            new LambdaQueryWrapper<UserWord>()
                .eq(UserWord::getUserId, userId)
                .eq(UserWord::getLanguage, language)
        );
        
        Map<String, Object> progress = new HashMap<>();
        progress.put("total", userWords.size());
        progress.put("mastered", userWords.stream().filter(w -> w.getStatus() == 1).count());
        progress.put("learning", userWords.stream().filter(w -> w.getStatus() == 0).count());
        progress.put("forgot", userWords.stream().filter(w -> w.getStatus() == 2).count());
        
        return progress;
    }

    public List<Vocabulary> getWrongWords(Long userId) {
        List<UserWord> userWords = userWordMapper.selectList(
            new LambdaQueryWrapper<UserWord>()
                .eq(UserWord::getUserId, userId)
                .eq(UserWord::getStatus, 2)
        );
        
        if (userWords.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Long> wordIds = userWords.stream()
                .map(UserWord::getWordId)
                .collect(Collectors.toList());
        
        return vocabularyMapper.selectList(
            new LambdaQueryWrapper<Vocabulary>()
                .in(Vocabulary::getId, wordIds)
        );
    }
}
