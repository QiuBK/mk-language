package com.linguaworld.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.linguaworld.entity.SpeakingTopic;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SpeakingTopicMapper extends BaseMapper<SpeakingTopic> {
    
    @Select("SELECT * FROM tb_speaking_topic WHERE language = #{language} ORDER BY RAND() LIMIT 1")
    SpeakingTopic selectRandomTopic(String language);
}
