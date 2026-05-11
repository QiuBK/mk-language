package com.linguaworld.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.linguaworld.entity.Vocabulary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;

@Mapper
public interface VocabularyMapper extends BaseMapper<Vocabulary> {
    
    @Select("SELECT * FROM tb_vocabulary WHERE language = #{language} ORDER BY RAND() LIMIT #{count}")
    java.util.List<Vocabulary> selectRandomWords(String language, Integer count);
}
