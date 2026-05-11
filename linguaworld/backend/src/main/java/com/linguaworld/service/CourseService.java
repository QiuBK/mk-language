package com.linguaworld.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.linguaworld.entity.Course;
import com.linguaworld.entity.Enrollment;
import com.linguaworld.mapper.CourseMapper;
import com.linguaworld.mapper.EnrollmentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CourseService extends ServiceImpl<CourseMapper, Course> {

    @Autowired(required = false)
    private CourseMapper courseMapper;
    
    @Autowired(required = false)
    private EnrollmentMapper enrollmentMapper;

    public List<Course> getRecommendCourses(Integer limit) {
        return courseMapper.selectRecommendCourses("en", limit);
    }

    @Transactional
    public void enrollCourse(Long userId, Long courseId) {
        // 检查是否已报名
        Enrollment existing = enrollmentMapper.selectOne(
            new LambdaQueryWrapper<Enrollment>()
                .eq(Enrollment::getUserId, userId)
                .eq(Enrollment::getCourseId, courseId)
        );
        
        if (existing == null) {
            Enrollment enrollment = new Enrollment();
            enrollment.setUserId(userId);
            enrollment.setCourseId(courseId);
            enrollment.setStatus(0);
            enrollment.setProgress(0);
            enrollment.setCreateTime(java.time.LocalDateTime.now());
            enrollmentMapper.insert(enrollment);
            
            // 更新课程报名人数
            Course course = courseMapper.selectById(courseId);
            course.setEnrolledCount(course.getEnrolledCount() + 1);
            courseMapper.updateById(course);
        }
    }

    public List<Course> getMyEnrolledCourses(Long userId) {
        List<Enrollment> enrollments = enrollmentMapper.selectList(
            new LambdaQueryWrapper<Enrollment>().eq(Enrollment::getUserId, userId)
        );
        
        if (enrollments.isEmpty()) {
            return List.of();
        }
        
        List<Long> courseIds = enrollments.stream()
                .map(Enrollment::getCourseId)
                .toList();
        
        return courseMapper.selectList(
            new LambdaQueryWrapper<Course>()
                .in(Course::getId, courseIds)
                .eq(Course::getStatus, 1)
        );
    }

    public Map<String, Object> getCourseProgress(Long userId, Long courseId) {
        Enrollment enrollment = enrollmentMapper.selectOne(
            new LambdaQueryWrapper<Enrollment>()
                .eq(Enrollment::getUserId, userId)
                .eq(Enrollment::getCourseId, courseId)
        );
        
        Course course = courseMapper.selectById(courseId);
        
        Map<String, Object> progress = new HashMap<>();
        progress.put("progress", enrollment != null ? enrollment.getProgress() : 0);
        progress.put("completedLessons", enrollment != null ? enrollment.getProgress() : 0);
        progress.put("totalLessons", course != null ? course.getTotalLessons() : 0);
        
        return progress;
    }

    public void updateProgress(Long userId, Long courseId, Long lessonId, Integer position) {
        Enrollment enrollment = enrollmentMapper.selectOne(
            new LambdaQueryWrapper<Enrollment>()
                .eq(Enrollment::getUserId, userId)
                .eq(Enrollment::getCourseId, courseId)
        );
        
        if (enrollment != null) {
            // 更新进度百分比
            Course course = courseMapper.selectById(courseId);
            int progressPercent = course.getTotalLessons() > 0 
                ? (enrollment.getProgress() + 1) * 100 / course.getTotalLessons() 
                : 0;
            
            enrollment.setProgress(Math.min(progressPercent, 100));
            enrollmentMapper.updateById(enrollment);
        }
    }
}
