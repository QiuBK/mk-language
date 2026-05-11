-- ============================================
-- 多语种在线教育平台数据库设计
-- LinguaWorld Database Schema
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS linguaworld CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE linguaworld;

-- ============================================
-- 1. 用户表 (tb_user)
-- ============================================
DROP TABLE IF EXISTS tb_user;
CREATE TABLE tb_user (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username        VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password        VARCHAR(255) NOT NULL COMMENT '密码(加密存储)',
    email           VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    phone           VARCHAR(20) COMMENT '手机号',
    nickname        VARCHAR(50) COMMENT '昵称',
    avatar          VARCHAR(255) DEFAULT '/assets/default-avatar.png' COMMENT '头像URL',
    role            TINYINT NOT NULL DEFAULT 0 COMMENT '角色: 0-普通用户, 1-教师, 2-管理员',
    native_language VARCHAR(10) DEFAULT 'zh' COMMENT '母语',
    current_language VARCHAR(10) DEFAULT 'en' COMMENT '当前学习语种',
    level           INT DEFAULT 1 COMMENT '用户等级',
    exp             INT DEFAULT 0 COMMENT '经验值',
    streak          INT DEFAULT 0 COMMENT '连续学习天数',
    total_words     INT DEFAULT 0 COMMENT '已学单词数',
    total_minutes   INT DEFAULT 0 COMMENT '学习总时长(分钟)',
    status          TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
    last_login_at   DATETIME COMMENT '最后登录时间',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_language (current_language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================
-- 2. 课程表 (tb_course)
-- ============================================
DROP TABLE IF EXISTS tb_course;
CREATE TABLE tb_course (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '课程ID',
    title           VARCHAR(200) NOT NULL COMMENT '课程标题',
    title_en        VARCHAR(200) COMMENT '英文标题',
    title_ja        VARCHAR(200) COMMENT '日语标题',
    title_ko        VARCHAR(200) COMMENT '韩语标题',
    description     TEXT COMMENT '课程描述',
    language        VARCHAR(10) NOT NULL COMMENT '语种: en/ja/ko',
    level           VARCHAR(20) NOT NULL COMMENT '难度: beginner/intermediate/advanced',
    type            VARCHAR(20) DEFAULT 'video' COMMENT '类型: video/live/private',
    cover_image     VARCHAR(255) COMMENT '封面图',
    video_url       VARCHAR(500) COMMENT '视频地址',
    duration        INT DEFAULT 0 COMMENT '课程时长(分钟)',
    price           DECIMAL(10,2) DEFAULT 0.00 COMMENT '价格',
    teacher_id      BIGINT COMMENT '授课教师ID',
    total_lessons   INT DEFAULT 0 COMMENT '总课时数',
    enrolled_count  INT DEFAULT 0 COMMENT '报名人数',
    rating          DECIMAL(2,1) DEFAULT 0.0 COMMENT '评分',
    status          TINYINT DEFAULT 1 COMMENT '状态: 0-下架, 1-上架',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_language (language),
    INDEX idx_level (level),
    INDEX idx_teacher (teacher_id),
    FOREIGN KEY (teacher_id) REFERENCES tb_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程表';

-- ============================================
-- 3. 章节表 (tb_chapter)
-- ============================================
DROP TABLE IF EXISTS tb_chapter;
CREATE TABLE tb_chapter (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '章节ID',
    course_id       BIGINT NOT NULL COMMENT '课程ID',
    title           VARCHAR(200) NOT NULL COMMENT '章节标题',
    sort_order      INT DEFAULT 0 COMMENT '排序',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_course (course_id),
    FOREIGN KEY (course_id) REFERENCES tb_course(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程章节表';

-- ============================================
-- 4. 课时表 (tb_lesson)
-- ============================================
DROP TABLE IF EXISTS tb_lesson;
CREATE TABLE tb_lesson (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '课时ID',
    chapter_id      BIGINT NOT NULL COMMENT '章节ID',
    title           VARCHAR(200) NOT NULL COMMENT '课时标题',
    type            VARCHAR(20) NOT NULL COMMENT '类型: video/vocabulary/grammar/speaking/listening',
    video_url       VARCHAR(500) COMMENT '视频URL',
    duration        INT DEFAULT 0 COMMENT '时长(秒)',
    sort_order      INT DEFAULT 0 COMMENT '排序',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_chapter (chapter_id),
    FOREIGN KEY (chapter_id) REFERENCES tb_chapter(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课时表';

-- ============================================
-- 5. 单词表 (tb_vocabulary)
-- ============================================
DROP TABLE IF EXISTS tb_vocabulary;
CREATE TABLE tb_vocabulary (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '单词ID',
    language        VARCHAR(10) NOT NULL COMMENT '语种',
    word            VARCHAR(100) NOT NULL COMMENT '单词',
    pronunciation   VARCHAR(100) COMMENT '发音',
    translation     VARCHAR(200) NOT NULL COMMENT '中文翻译',
    example         TEXT COMMENT '例句',
    example_translation TEXT COMMENT '例句翻译',
    audio_url       VARCHAR(500) COMMENT '发音音频',
    level           VARCHAR(20) DEFAULT 'beginner' COMMENT '难度级别',
    frequency       INT DEFAULT 0 COMMENT '使用频率',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_language (language),
    INDEX idx_word (word),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='单词表';

-- ============================================
-- 6. 单词书表 (tb_wordbook)
-- ============================================
DROP TABLE IF EXISTS tb_wordbook;
CREATE TABLE tb_wordbook (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '单词书ID',
    language        VARCHAR(10) NOT NULL COMMENT '语种',
    name            VARCHAR(100) NOT NULL COMMENT '单词书名称',
    description     TEXT COMMENT '描述',
    cover_image     VARCHAR(255) COMMENT '封面图',
    total_words     INT DEFAULT 0 COMMENT '总词数',
    difficulty      VARCHAR(20) DEFAULT 'beginner' COMMENT '难度',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='单词书表';

-- ============================================
-- 7. 单词书-单词关联表 (tb_wordbook_word)
-- ============================================
DROP TABLE IF EXISTS tb_wordbook_word;
CREATE TABLE tb_wordbook_word (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    wordbook_id     BIGINT NOT NULL COMMENT '单词书ID',
    word_id         BIGINT NOT NULL COMMENT '单词ID',
    sort_order      INT DEFAULT 0 COMMENT '排序',
    FOREIGN KEY (wordbook_id) REFERENCES tb_wordbook(id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES tb_vocabulary(id) ON DELETE CASCADE,
    UNIQUE KEY uk_wordbook_word (wordbook_id, word_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='单词书单词关联表';

-- ============================================
-- 8. 口语题目表 (tb_speaking_topic)
-- ============================================
DROP TABLE IF EXISTS tb_speaking_topic;
CREATE TABLE tb_speaking_topic (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '题目ID',
    language        VARCHAR(10) NOT NULL COMMENT '语种',
    title           VARCHAR(200) NOT NULL COMMENT '题目',
    content         TEXT COMMENT '题目内容',
    audio_url       VARCHAR(500) COMMENT '示例音频',
    type            VARCHAR(20) DEFAULT 'reading' COMMENT '类型: reading/free/dictation',
    difficulty      VARCHAR(20) DEFAULT 'beginner' COMMENT '难度',
    keywords        VARCHAR(500) COMMENT '关键词(逗号分隔)',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='口语题目表';

-- ============================================
-- 9. 用户学习进度表 (tb_user_progress)
-- ============================================
DROP TABLE IF EXISTS tb_user_progress;
CREATE TABLE tb_user_progress (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL COMMENT '用户ID',
    course_id       BIGINT COMMENT '课程ID',
    lesson_id       BIGINT COMMENT '课时ID',
    progress_type   VARCHAR(20) NOT NULL COMMENT '类型: course/lesson/vocabulary/speaking',
    progress        INT DEFAULT 0 COMMENT '进度百分比',
    status          TINYINT DEFAULT 0 COMMENT '状态: 0-进行中, 1-已完成',
    last_position   INT DEFAULT 0 COMMENT '视频最后位置(秒)',
    score           INT COMMENT '得分',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_progress (user_id, course_id, lesson_id, progress_type),
    FOREIGN KEY (user_id) REFERENCES tb_user(id),
    FOREIGN KEY (course_id) REFERENCES tb_course(id),
    FOREIGN KEY (lesson_id) REFERENCES tb_lesson(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户学习进度表';

-- ============================================
-- 10. 用户单词学习记录表 (tb_user_word)
-- ============================================
DROP TABLE IF EXISTS tb_user_word;
CREATE TABLE tb_user_word (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL COMMENT '用户ID',
    word_id         BIGINT NOT NULL COMMENT '单词ID',
    language        VARCHAR(10) NOT NULL COMMENT '语种',
    status          TINYINT DEFAULT 0 COMMENT '状态: 0-学习中, 1-已掌握, 2-不认识',
    review_count    INT DEFAULT 0 COMMENT '复习次数',
    next_review_at  DATETIME COMMENT '下次复习时间',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_word (user_id, word_id),
    FOREIGN KEY (user_id) REFERENCES tb_user(id),
    FOREIGN KEY (word_id) REFERENCES tb_vocabulary(id),
    INDEX idx_user_language (user_id, language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户单词学习记录表';

-- ============================================
-- 11. 口语练习记录表 (tb_user_speaking)
-- ============================================
DROP TABLE IF EXISTS tb_user_speaking;
CREATE TABLE tb_user_speaking (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    user_id         BIGINT NOT NULL COMMENT '用户ID',
    topic_id        BIGINT NOT NULL COMMENT '题目ID',
    audio_url       VARCHAR(500) COMMENT '录音文件URL',
    duration        INT DEFAULT 0 COMMENT '录音时长(秒)',
    score           INT DEFAULT 0 COMMENT 'AI评分',
    feedback        TEXT COMMENT 'AI反馈',
    error_points    TEXT COMMENT '错误点JSON',
    status          TINYINT DEFAULT 0 COMMENT '状态: 0-待批改, 1-已批改',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES tb_user(id),
    FOREIGN KEY (topic_id) REFERENCES tb_speaking_topic(id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户口语练习记录表';

-- ============================================
-- 12. 课程报名表 (tb_enrollment)
-- ============================================
DROP TABLE IF EXISTS tb_enrollment;
CREATE TABLE tb_enrollment (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL COMMENT '用户ID',
    course_id       BIGINT NOT NULL COMMENT '课程ID',
    status          TINYINT DEFAULT 0 COMMENT '状态: 0-报名, 1-学习中, 2-已完成',
    progress        INT DEFAULT 0 COMMENT '进度百分比',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_course (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES tb_user(id),
    FOREIGN KEY (course_id) REFERENCES tb_course(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程报名表';

-- ============================================
-- 13. 成就表 (tb_achievement)
-- ============================================
DROP TABLE IF EXISTS tb_achievement;
CREATE TABLE tb_achievement (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    code            VARCHAR(50) NOT NULL UNIQUE COMMENT '成就代码',
    title           VARCHAR(100) NOT NULL COMMENT '标题',
    description     VARCHAR(255) COMMENT '描述',
    icon            VARCHAR(50) COMMENT '图标',
    category        VARCHAR(20) COMMENT '分类',
    requirement     INT DEFAULT 0 COMMENT '达成条件数值',
    reward          INT DEFAULT 0 COMMENT '奖励经验',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成就表';

-- ============================================
-- 14. 用户成就表 (tb_user_achievement)
-- ============================================
DROP TABLE IF EXISTS tb_user_achievement;
CREATE TABLE tb_user_achievement (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL COMMENT '用户ID',
    achievement_id  BIGINT NOT NULL COMMENT '成就ID',
    unlocked_at     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '解锁时间',
    UNIQUE KEY uk_user_achievement (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES tb_user(id),
    FOREIGN KEY (achievement_id) REFERENCES tb_achievement(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户成就表';

-- ============================================
-- 15. 社区帖子表 (tb_post)
-- ============================================
DROP TABLE IF EXISTS tb_post;
CREATE TABLE tb_post (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '帖子ID',
    user_id         BIGINT NOT NULL COMMENT '用户ID',
    content         TEXT NOT NULL COMMENT '内容',
    images          VARCHAR(1000) COMMENT '图片JSON数组',
    language        VARCHAR(10) COMMENT '关联语种',
    likes           INT DEFAULT 0 COMMENT '点赞数',
    comments_count  INT DEFAULT 0 COMMENT '评论数',
    status          TINYINT DEFAULT 1 COMMENT '状态: 0-删除, 1-正常',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES tb_user(id),
    INDEX idx_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区帖子表';

-- ============================================
-- 16. 评论表 (tb_comment)
-- ============================================
DROP TABLE IF EXISTS tb_comment;
CREATE TABLE tb_comment (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
    post_id         BIGINT NOT NULL COMMENT '帖子ID',
    user_id         BIGINT NOT NULL COMMENT '用户ID',
    content         TEXT NOT NULL COMMENT '内容',
    parent_id       BIGINT COMMENT '父评论ID',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (post_id) REFERENCES tb_post(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES tb_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- ============================================
-- 17. 每日任务表 (tb_daily_task)
-- ============================================
DROP TABLE IF EXISTS tb_daily_task;
CREATE TABLE tb_daily_task (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    title           VARCHAR(100) NOT NULL COMMENT '任务名称',
    type            VARCHAR(20) NOT NULL COMMENT '类型',
    target          INT DEFAULT 1 COMMENT '目标数量',
    exp_reward      INT DEFAULT 0 COMMENT '经验奖励',
    language        VARCHAR(10) COMMENT '关联语种'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日任务表';

-- ============================================
-- 18. 用户任务记录表 (tb_user_task)
-- ============================================
DROP TABLE IF EXISTS tb_user_task;
CREATE TABLE tb_user_task (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL COMMENT '用户ID',
    task_id         BIGINT NOT NULL COMMENT '任务ID',
    progress        INT DEFAULT 0 COMMENT '当前进度',
    completed       TINYINT DEFAULT 0 COMMENT '是否完成',
    task_date       DATE NOT NULL COMMENT '任务日期',
    create_time     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_task_date (user_id, task_id, task_date),
    FOREIGN KEY (user_id) REFERENCES tb_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户任务记录表';

-- ============================================
-- 初始数据
-- ============================================

-- 插入成就数据
INSERT INTO tb_achievement (code, title, description, icon, category, requirement, reward) VALUES
('streak_7', '坚持一周', '连续学习7天', 'Flame', 'streak', 7, 100),
('streak_30', '坚持一月', '连续学习30天', 'Flame', 'streak', 30, 500),
('vocab_100', '词汇达人', '学习100个单词', 'BookOpen', 'vocabulary', 100, 200),
('vocab_500', '词汇专家', '学习500个单词', 'GraduationCap', 'vocabulary', 500, 800),
('speaking_50', '开口说', '完成50次口语练习', 'Mic', 'speaking', 50, 300),
('level_5', '初露锋芒', '达到5级', 'Star', 'vocabulary', 5, 150);

-- 插入单词数据(英语示例)
INSERT INTO tb_vocabulary (language, word, pronunciation, translation, example, example_translation, level) VALUES
('en', 'Serendipity', '/ˌser.ənˈdɪp.ə.ti/', '意外发现美好事物的运气', 'Finding that book was pure serendipity.', '找到那本书纯属意外之喜。', 'advanced'),
('en', 'Ephemeral', '/ɪˈfem.ər.əl/', '短暂的，瞬息的', 'Fame can be ephemeral in the digital age.', '在数字时代，名声可能是短暂的。', 'advanced'),
('en', 'Mellifluous', '/meˈlɪf.lu.əs/', '悦耳的，甜蜜的', 'She has a mellifluous voice.', '她有悦耳的嗓音。', 'advanced'),
('en', 'Hello', '/həˈloʊ/', '你好', 'Hello, how are you?', '你好，你好吗？', 'beginner'),
('en', 'Goodbye', '/ɡʊdˈbaɪ/', '再见', 'Goodbye, see you tomorrow!', '再见，明天见！', 'beginner');

-- 插入单词数据(日语示例)
INSERT INTO tb_vocabulary (language, word, pronunciation, translation, example, example_translation, level) VALUES
('ja', 'あ', 'a', '五十音第一行', 'あおい (blue)', '蓝色的', 'beginner'),
('ja', 'い', 'i', '五十音第一行', 'いぬ (dog)', '狗', 'beginner'),
('ja', 'う', 'u', '五十音第一行', 'うみ (sea)', '大海', 'beginner'),
('ja', '先生', 'sensei', '老师', '私は先生です。', '我是老师。', 'beginner'),
('ja', '学生', 'gakusei', '学生', '彼は学生です。', '他是学生。', 'beginner');

-- 插入单词数据(韩语示例)
INSERT INTO tb_vocabulary (language, word, pronunciation, translation, example, example_translation, level) VALUES
('ko', 'ㄱ', 'giyeok', '辅音字母', '가다 (去)', '去', 'beginner'),
('ko', 'ㄴ', 'nieun', '辅音字母', '나 (我)', '我', 'beginner'),
('ko', 'ㄷ', 'digeut', '辅音字母', '다 (多)', '多', 'beginner'),
('ko', '안녕하세요', 'annyeonghaseyo', '你好', '안녕하세요, 만나서 반갑습니다.', '你好，很高兴认识你。', 'beginner'),
('ko', '감사합니다', 'gamsahamnida', '谢谢', '대박 감사합니다!', '太感谢了！', 'beginner');

-- 插入口语题目
INSERT INTO tb_speaking_topic (language, title, content, type, difficulty, keywords) VALUES
('en', 'Introduce yourself', 'Please introduce yourself briefly including your name, occupation, and hobbies.', 'reading', 'beginner', 'name,occupation,hobbies'),
('en', 'Daily routine', 'Describe your typical day from morning to night.', 'free', 'intermediate', 'morning,activities,evening'),
('en', 'Travel experience', 'Share a memorable travel experience you had.', 'free', 'advanced', 'travel,experience,place'),
('ja', '自己紹介', ' 자신을 간단히 소개해주세요. 이름, 직업, 취미를 포함하세요.', 'reading', 'beginner', '名前,職業,趣味'),
('ja', '日本の文化', '日本の文化について何か話してください。', 'free', 'intermediate', '文化,日本,体験'),
('ko', '자기소개', ' 자신을 간단히 소개해주세요.', 'reading', 'beginner', '이름,직업,취미'),
('ko', '한국 음식', '좋아하는 한국 음식을 추천해주세요.', 'free', 'intermediate', '음식,추천,맛있');

-- 插入每日任务
INSERT INTO tb_daily_task (title, type, target, exp_reward) VALUES
('背诵单词', 'vocabulary', 10, 20),
('完成课程', 'course', 1, 30),
('口语练习', 'speaking', 5, 25),
('听力训练', 'listening', 10, 20),
('复习旧词', 'review', 5, 15);
