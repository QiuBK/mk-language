package com.linguaworld.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.linguaworld.entity.SpeakingTopic;
import com.linguaworld.entity.UserSpeaking;
import com.linguaworld.mapper.SpeakingTopicMapper;
import com.linguaworld.mapper.UserSpeakingMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class SpeakingService extends ServiceImpl<SpeakingTopicMapper, SpeakingTopic> {

    @Autowired(required = false)
    private SpeakingTopicMapper speakingTopicMapper;
    
    @Autowired(required = false)
    private UserSpeakingMapper userSpeakingMapper;
    
    @Value("${file.upload.path:/tmp/uploads}")
    private String uploadPath;

    public SpeakingTopic getRandomTopic(String language) {
        return speakingTopicMapper.selectRandomTopic(language);
    }

    public String saveAudioFile(MultipartFile audio) throws IOException {
        // 创建上传目录
        File uploadDir = new File(uploadPath + "/audio");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        
        // 生成唯一文件名
        String originalFilename = audio.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : ".webm";
        String filename = UUID.randomUUID().toString() + extension;
        
        // 保存文件
        Path filePath = Path.of(uploadPath + "/audio", filename);
        Files.write(filePath, audio.getBytes());
        
        // 返回访问路径
        return "/uploads/audio/" + filename;
    }

    public Map<String, Object> submitAndScore(Long userId, Long topicId, String audioUrl, Integer duration) {
        // 模拟AI评分逻辑（实际项目中应调用AI服务）
        int score = simulateAIScoring();
        
        // 生成反馈
        String feedback = generateFeedback(score);
        
        // 解析错误点
        String[] errorPoints = generateErrorPoints();
        
        // 保存记录
        UserSpeaking record = new UserSpeaking();
        record.setUserId(userId);
        record.setTopicId(topicId);
        record.setAudioUrl(audioUrl);
        record.setDuration(duration);
        record.setScore(score);
        record.setFeedback(feedback);
        record.setErrorPoints(String.join(",", errorPoints));
        record.setStatus(1);
        record.setCreateTime(LocalDateTime.now());
        
        userSpeakingMapper.insert(record);
        
        // 返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("id", record.getId());
        result.put("score", score);
        result.put("feedback", feedback);
        result.put("errorPoints", errorPoints);
        result.put("createTime", record.getCreateTime());
        
        return result;
    }

    private int simulateAIScoring() {
        // 模拟AI评分：生成60-100之间的随机分数
        return (int) (Math.random() * 40) + 60;
    }

    private String generateFeedback(int score) {
        if (score >= 90) {
            return "太棒了！发音非常标准，语调自然流畅！";
        } else if (score >= 80) {
            return "很好！发音基本准确，可以继续优化语调。";
        } else if (score >= 70) {
            return "不错！有一些地方需要注意，继续练习会更好的。";
        } else {
            return "还需要多加练习，注意发音和语调。";
        }
    }

    private String[] generateErrorPoints() {
        String[][] allPoints = {
            {"发音准确", "语调稍有偏差", "建议：升调再明显一些"},
            {"流畅度一般", "注意连读"},
            {"注意辅音结尾"},
            {"重音位置正确"}
        };
        
        // 随机选择2-3个反馈点
        int count = (int) (Math.random() * 2) + 2;
        String[] result = new String[count];
        for (int i = 0; i < count; i++) {
            result[i] = allPoints[(int) (Math.random() * allPoints.length)];
        }
        
        return result;
    }
}
