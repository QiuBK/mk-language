package com.linguaworld.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.linguaworld.common.Result;
import com.linguaworld.entity.Course;
import com.linguaworld.entity.Chapter;
import com.linguaworld.entity.Lesson;
import com.linguaworld.entity.Enrollment;
import com.linguaworld.mapper.CourseMapper;
import com.linguaworld.mapper.ChapterMapper;
import com.linguaworld.mapper.LessonMapper;
import com.linguaworld.mapper.EnrollmentMapper;
import com.linguaworld.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/course")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    
    @Autowired(required = false)
    private CourseMapper courseMapper;
    
    @Autowired(required = false)
    private ChapterMapper chapterMapper;
    
    @Autowired(required = false)
    private LessonMapper lessonMapper;
    
    @Autowired(required = false)
    private EnrollmentMapper enrollmentMapper;

    /**
     * 获取课程列表
     */
    @GetMapping("/list")
    public Result<Map<String, Object>> getCourseList(
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String level,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "12") Integer pageSize) {
        
        Page<Course> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<>();
        
        if (language != null && !language.isEmpty()) {
            wrapper.eq(Course::getLanguage, language);
        }
        if (level != null && !level.isEmpty()) {
            wrapper.eq(Course::getLevel, level);
        }
        wrapper.eq(Course::getStatus, 1);
        wrapper.orderByDesc(Course::getCreateTime);
        
        Page<Course> result = courseMapper.selectPage(pageParam, wrapper);
        
        Map<String, Object> data = new HashMap<>();
        data.put("list", result.getRecords());
        data.put("total", result.getTotal());
        
        return Result.success(data);
    }

    /**
     * 获取课程详情
     */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> getCourseDetail(@PathVariable Long id) {
        Course course = courseMapper.selectById(id);
        
        if (course == null) {
            return Result.error("课程不存在");
        }
        
        // 获取章节列表
        List<Chapter> chapters = chapterMapper.selectList(
            new LambdaQueryWrapper<Chapter>().eq(Chapter::getCourseId, id).orderByAsc(Chapter::getSortOrder)
        );
        
        // 获取每个章节的课时列表
        for (Chapter chapter : chapters) {
            List<Lesson> lessons = lessonMapper.selectList(
                new LambdaQueryWrapper<Lesson>().eq(Lesson::getChapterId, chapter.getId()).orderByAsc(Lesson::getSortOrder)
            );
            chapter.setLessons(lessons);
        }
        
        Map<String, Object> data = new HashMap<>();
        data.putAll(courseMapper.selectById(id));
        data.put("chapters", chapters);
        
        return Result.success(data);
    }

    /**
     * 获取推荐课程
     */
    @GetMapping("/recommend")
    public Result<List<Course>> getRecommendCourses(@RequestParam(defaultValue = "4") Integer limit) {
        List<Course> courses = courseService.getRecommendCourses(limit);
        return Result.success(courses);
    }

    /**
     * 报名课程
     */
    @PostMapping("/enroll")
    public Result<Void> enrollCourse(@RequestAttribute Long userId, @RequestParam Long courseId) {
        courseService.enrollCourse(userId, courseId);
        return Result.success();
    }

    /**
     * 获取用户报名的课程
     */
    @GetMapping("/my")
    public Result<List<Course>> getMyCourses(@RequestAttribute Long userId) {
        List<Course> courses = courseService.getMyEnrolledCourses(userId);
        return Result.success(courses);
    }

    /**
     * 获取课程学习进度
     */
    @GetMapping("/{courseId}/progress")
    public Result<Map<String, Object>> getCourseProgress(
            @RequestAttribute Long userId,
            @PathVariable Long courseId) {
        
        Map<String, Object> progress = courseService.getCourseProgress(userId, courseId);
        return Result.success(progress);
    }

    /**
     * 更新课程学习进度
     */
    @PostMapping("/progress")
    public Result<Void> updateCourseProgress(
            @RequestAttribute Long userId,
            @RequestBody Map<String, Object> params) {
        
        Long courseId = Long.valueOf(params.get("courseId").toString());
        Long lessonId = Long.valueOf(params.get("lessonId").toString());
        Integer position = Integer.valueOf(params.get("position").toString());
        
        courseService.updateProgress(userId, courseId, lessonId, position);
        return Result.success();
    }
}
