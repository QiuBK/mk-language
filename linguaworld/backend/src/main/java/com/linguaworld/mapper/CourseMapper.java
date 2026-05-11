package com.linguaworld.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.linguaworld.entity.Course;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface CourseMapper extends BaseMapper<Course> {
    
    @Select("SELECT * FROM tb_course WHERE language = #{language} AND status = 1 ORDER BY RAND() LIMIT #{limit}")
    java.util.List<Course> selectRecommendCourses(String language, Integer limit);
}
