const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;
const JWT_SECRET = 'linguaworld-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// SQLite Database
const dbPath = path.join(__dirname, 'linguaworld.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize Database Tables
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tb_user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      nickname TEXT,
      avatar TEXT DEFAULT '/assets/default-avatar.png',
      role INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      total_words INTEGER DEFAULT 0,
      total_minutes INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tb_course (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      cover_image TEXT,
      language TEXT,
      level TEXT,
      price REAL DEFAULT 0,
      rating REAL DEFAULT 5.0,
      enrolled_count INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tb_chapter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      sort INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES tb_course(id)
    );

    CREATE TABLE IF NOT EXISTS tb_lesson (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      video_url TEXT,
      duration INTEGER DEFAULT 0,
      sort INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapter_id) REFERENCES tb_chapter(id)
    );

    CREATE TABLE IF NOT EXISTS tb_vocabulary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      pronunciation TEXT,
      translation TEXT NOT NULL,
      example TEXT,
      example_translation TEXT,
      language TEXT NOT NULL,
      difficulty TEXT DEFAULT 'beginner',
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tb_user_word (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      vocabulary_id INTEGER NOT NULL,
      status INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES tb_user(id),
      FOREIGN KEY (vocabulary_id) REFERENCES tb_vocabulary(id),
      UNIQUE(user_id, vocabulary_id)
    );

    CREATE TABLE IF NOT EXISTS tb_speaking_topic (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      translation TEXT,
      language TEXT NOT NULL,
      difficulty TEXT DEFAULT 'beginner',
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tb_user_speaking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      topic_id INTEGER NOT NULL,
      audio_url TEXT,
      duration INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      feedback TEXT,
      error_points TEXT,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES tb_user(id),
      FOREIGN KEY (topic_id) REFERENCES tb_speaking_topic(id)
    );

    CREATE TABLE IF NOT EXISTS tb_enrollment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      enroll_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES tb_user(id),
      FOREIGN KEY (course_id) REFERENCES tb_course(id),
      UNIQUE(user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS tb_user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      progress REAL DEFAULT 0,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES tb_user(id),
      UNIQUE(user_id, course_id, lesson_id)
    );
  `);

  // Seed initial data if empty
  const courseCount = db.prepare('SELECT COUNT(*) as count FROM tb_course').get();
  if (courseCount.count === 0) {
    seedData();
  }
}

function seedData() {
  // Seed courses
  const insertCourse = db.prepare(`
    INSERT INTO tb_course (title, description, cover_image, language, level, rating, enrolled_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const courses = [
    ['英语基础入门', '从零开始学习英语，掌握日常交流必备词汇和语法', '/assets/courses/en-beginner.jpg', 'en', 'beginner', 4.8, 1234],
    ['英语中级进阶', '提升英语表达能力，学习商务沟通技巧', '/assets/courses/en-intermediate.jpg', 'en', 'intermediate', 4.7, 856],
    ['英语高级口语', '流利英语对话，深度文化理解', '/assets/courses/en-advanced.jpg', 'en', 'advanced', 4.9, 543],
    ['日语五十音图', '轻松掌握日语假名，开启日语学习之旅', '/assets/courses/ja-beginner.jpg', 'ja', 'beginner', 4.9, 2345],
    ['日语基础会话', '日常日语交流，实用场景对话', '/assets/courses/ja-intermediate.jpg', 'ja', 'intermediate', 4.6, 987],
    ['韩语零基础', '从韩语字母开始，系统学习韩语', '/assets/courses/ko-beginner.jpg', 'ko', 'beginner', 4.8, 1567],
  ];

  const courseIds = [];
  for (const course of courses) {
    const result = insertCourse.run(...course);
    courseIds.push(result.lastInsertRowid);
  }

  // Seed chapters and lessons for first course
  const insertChapter = db.prepare('INSERT INTO tb_chapter (course_id, title, sort) VALUES (?, ?, ?)');
  const insertLesson = db.prepare('INSERT INTO tb_lesson (chapter_id, title, video_url, duration, sort) VALUES (?, ?, ?, ?, ?)');

  const chapters = [
    { title: '字母与发音', lessons: [
      { title: '字母A-H', duration: 600 },
      { title: '字母I-P', duration: 540 },
      { title: '字母Q-Z', duration: 480 }
    ]},
    { title: '基础词汇', lessons: [
      { title: '数字1-10', duration: 420 },
      { title: '颜色表达', duration: 380 },
      { title: '日常用品', duration: 450 }
    ]},
    { title: '简单对话', lessons: [
      { title: '打招呼', duration: 520 },
      { title: '自我介绍', duration: 600 }
    ]}
  ];

  for (let i = 0; i < chapters.length; i++) {
    const chapterResult = insertChapter.run(courseIds[0], chapters[i].title, i + 1);
    for (let j = 0; j < chapters[i].lessons.length; j++) {
      insertLesson.run(chapterResult.lastInsertRowid, chapters[i].lessons[j].title, '', chapters[i].lessons[j].duration, j + 1);
    }
  }

  // Seed vocabulary
  const insertVocab = db.prepare(`
    INSERT INTO tb_vocabulary (word, pronunciation, translation, example, example_translation, language, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const vocabularies = [
    ['hello', '/həˈloʊ/', '你好', 'Hello, how are you?', '你好，你好吗？', 'en', 'beginner'],
    ['world', '/wɜːrld/', '世界', 'The world is beautiful.', '世界很美丽。', 'en', 'beginner'],
    ['learn', '/lɜːrn/', '学习', 'I want to learn English.', '我想学英语。', 'en', 'beginner'],
    ['time', '/taɪm/', '时间', 'Time is precious.', '时间很宝贵。', 'en', 'beginner'],
    ['friend', '/frend/', '朋友', 'She is my best friend.', '她是我最好的朋友。', 'en', 'beginner'],
    ['こんにちは', '/konnichiwa/', '你好', 'こんにちは、元気ですか？', '你好，你好吗？', 'ja', 'beginner'],
    ['ありがとう', '/arigatou/', '谢谢', 'ありがとうございます。', '非常感谢。', 'ja', 'beginner'],
    ['世界', '/sekai/', '世界', '世界は広いですね。', '世界真广阔啊。', 'ja', 'beginner'],
    ['안녕하세요', '/annyeonghaseyo/', '你好', '안녕하세요, 만나서 반갑습니다.', '你好，见到你很高兴。', 'ko', 'beginner'],
    ['감사합니다', '/gamsahamnida/', '谢谢', '정말 감사합니다.', '真的非常感谢。', 'ko', 'beginner'],
  ];

  for (const vocab of vocabularies) {
    insertVocab.run(...vocab);
  }

  // Seed speaking topics
  const insertTopic = db.prepare(`
    INSERT INTO tb_speaking_topic (content, translation, language, difficulty)
    VALUES (?, ?, ?, ?)
  `);

  const topics = [
    ['Please introduce yourself.', '请介绍一下你自己。', 'en', 'beginner'],
    ['What did you do last weekend?', '你上周末做了什么？', 'en', 'intermediate'],
    ['Describe your favorite city.', '描述你最喜欢的城市。', 'en', 'advanced'],
    ['自己紹介をしてください。', '请做一下自我介绍。', 'ja', 'beginner'],
    ['今日の天気を教えてください。', '请告诉我今天的天气。', 'ja', 'intermediate'],
    ['자기소개를 해보세요.', '请做一下自我介绍。', 'ko', 'beginner'],
  ];

  for (const topic of topics) {
    insertTopic.run(...topic);
  }

  // Seed test user
  const hashedPassword = bcrypt.hashSync('123456', 10);
  db.prepare(`
    INSERT INTO tb_user (username, password, email, nickname, role)
    VALUES (?, ?, ?, ?, ?)
  `).run('test', hashedPassword, 'test@example.com', '测试用户', 0);

  db.prepare(`
    INSERT INTO tb_user (username, password, email, nickname, role)
    VALUES (?, ?, ?, ?, ?)
  `).run('admin', hashedPassword, 'admin@example.com', '管理员', 2);

  console.log('Database seeded successfully!');
}

// Initialize
initDatabase();

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'Token无效' });
  }
};

// ==================== User APIs ====================

app.post('/api/user/register', (req, res) => {
  try {
    const { username, password, email, nickname } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ code: 400, message: '参数不完整' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO tb_user (username, password, email, nickname, role, create_time)
      VALUES (?, ?, ?, ?, 0, datetime('now'))
    `);
    const result = stmt.run(username, hashedPassword, email, nickname || username);

    const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      code: 200,
      message: '注册成功',
      data: {
        token,
        userInfo: {
          id: result.lastInsertRowid,
          username,
          nickname: nickname || username,
          email,
          role: 0
        }
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ code: 500, message: '注册失败: ' + err.message });
  }
});

app.post('/api/user/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM tb_user WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ code: 401, message: '密码错误' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          avatar: user.avatar,
          level: user.level,
          exp: user.exp,
          role: user.role
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ code: 500, message: '登录失败' });
  }
});

app.get('/api/user/info', authenticate, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT id, username, email, nickname, avatar, level, exp, streak, total_words, total_minutes, role FROM tb_user WHERE id = ?'
    ).get(req.userId);

    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    res.json({ code: 200, data: user });
  } catch (err) {
    console.error('Get user info error:', err);
    res.status(500).json({ code: 500, message: '获取用户信息失败' });
  }
});

app.get('/api/user/stats', authenticate, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT total_words, total_minutes, level, exp, streak FROM tb_user WHERE id = ?'
    ).get(req.userId);

    const courseCount = db.prepare('SELECT COUNT(*) as count FROM tb_enrollment WHERE user_id = ?').get(req.userId);
    const speakingCount = db.prepare('SELECT COUNT(*) as count FROM tb_user_speaking WHERE user_id = ?').get(req.userId);

    res.json({
      code: 200,
      data: {
        ...user,
        courseCount: courseCount.count,
        speakingCount: speakingCount.count
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ code: 500, message: '获取统计信息失败' });
  }
});

// ==================== Course APIs ====================

app.get('/api/course/list', (req, res) => {
  try {
    const { language, level, page = 1, pageSize = 10 } = req.query;
    let sql = 'SELECT * FROM tb_course WHERE status = 1';
    const params = [];

    if (language) {
      sql += ' AND language = ?';
      params.push(language);
    }
    if (level) {
      sql += ' AND level = ?';
      params.push(level);
    }

    sql += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

    const courses = db.prepare(sql).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM tb_course WHERE status = 1').get().count;

    res.json({ code: 200, data: { list: courses, total } });
  } catch (err) {
    console.error('Get course list error:', err);
    res.status(500).json({ code: 500, message: '获取课程列表失败' });
  }
});

app.get('/api/course/recommend', (req, res) => {
  try {
    const courses = db.prepare(
      'SELECT * FROM tb_course WHERE status = 1 ORDER BY rating DESC, enrolled_count DESC LIMIT 6'
    ).all();
    res.json({ code: 200, data: courses });
  } catch (err) {
    console.error('Get recommend courses error:', err);
    res.status(500).json({ code: 500, message: '获取推荐课程失败' });
  }
});

app.get('/api/course/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const course = db.prepare('SELECT * FROM tb_course WHERE id = ?').get(id);

    if (!course) {
      return res.status(404).json({ code: 404, message: '课程不存在' });
    }

    const chapters = db.prepare('SELECT * FROM tb_chapter WHERE course_id = ? ORDER BY sort').all(id);
    const chapterIds = chapters.map(c => c.id);

    let lessons = [];
    if (chapterIds.length > 0) {
      const placeholders = chapterIds.map(() => '?').join(',');
      lessons = db.prepare(`SELECT * FROM tb_lesson WHERE chapter_id IN (${placeholders}) ORDER BY sort`).all(...chapterIds);
    }

    chapters.forEach(chapter => {
      chapter.lessons = lessons.filter(l => l.chapter_id === chapter.id);
    });

    res.json({ code: 200, data: { ...course, chapters } });
  } catch (err) {
    console.error('Get course detail error:', err);
    res.status(500).json({ code: 500, message: '获取课程详情失败' });
  }
});

app.post('/api/course/enroll', authenticate, (req, res) => {
  try {
    const { courseId } = req.body;
    
    const existing = db.prepare('SELECT * FROM tb_enrollment WHERE user_id = ? AND course_id = ?').get(req.userId, courseId);

    if (existing) {
      return res.json({ code: 200, message: '已报名该课程' });
    }

    db.prepare('INSERT INTO tb_enrollment (user_id, course_id, enroll_time) VALUES (?, ?, datetime("now"))').run(req.userId, courseId);
    db.prepare('UPDATE tb_course SET enrolled_count = enrolled_count + 1 WHERE id = ?').run(courseId);

    res.json({ code: 200, message: '报名成功' });
  } catch (err) {
    console.error('Enroll course error:', err);
    res.status(500).json({ code: 500, message: '报名课程失败' });
  }
});

app.get('/api/course/my', authenticate, (req, res) => {
  try {
    const courses = db.prepare(`
      SELECT c.* FROM tb_course c 
      INNER JOIN tb_enrollment e ON c.id = e.course_id 
      WHERE e.user_id = ?
    `).all(req.userId);
    res.json({ code: 200, data: courses });
  } catch (err) {
    console.error('Get my courses error:', err);
    res.status(500).json({ code: 500, message: '获取我的课程失败' });
  }
});

app.post('/api/course/progress', authenticate, (req, res) => {
  try {
    const { courseId, lessonId, progress } = req.body;
    
    const existing = db.prepare('SELECT * FROM tb_user_progress WHERE user_id = ? AND course_id = ? AND lesson_id = ?').get(req.userId, courseId, lessonId);

    if (existing) {
      db.prepare('UPDATE tb_user_progress SET progress = ?, update_time = datetime("now") WHERE user_id = ? AND course_id = ? AND lesson_id = ?').run(progress, req.userId, courseId, lessonId);
    } else {
      db.prepare('INSERT INTO tb_user_progress (user_id, course_id, lesson_id, progress, update_time) VALUES (?, ?, ?, ?, datetime("now"))').run(req.userId, courseId, lessonId, progress);
    }

    res.json({ code: 200, message: '进度更新成功' });
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ code: 500, message: '更新进度失败' });
  }
});

// ==================== Vocabulary APIs ====================

app.get('/api/vocabulary/list', (req, res) => {
  try {
    const { language = 'en', page = 1, pageSize = 20 } = req.query;
    
    const vocabularies = db.prepare(
      'SELECT * FROM tb_vocabulary WHERE language = ? LIMIT ? OFFSET ?'
    ).all(language, parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

    res.json({ code: 200, data: vocabularies });
  } catch (err) {
    console.error('Get vocabulary list error:', err);
    res.status(500).json({ code: 500, message: '获取单词列表失败' });
  }
});

app.get('/api/vocabulary/random', (req, res) => {
  try {
    const { language = 'en', count = 20 } = req.query;
    
    const vocabularies = db.prepare(
      'SELECT * FROM tb_vocabulary WHERE language = ? ORDER BY RANDOM() LIMIT ?'
    ).all(language, parseInt(count));

    res.json({ code: 200, data: vocabularies });
  } catch (err) {
    console.error('Get random vocabulary error:', err);
    res.status(500).json({ code: 500, message: '获取随机单词失败' });
  }
});

app.post('/api/vocabulary/mark', authenticate, (req, res) => {
  try {
    const { vocabularyId, status } = req.body;
    
    const existing = db.prepare('SELECT * FROM tb_user_word WHERE user_id = ? AND vocabulary_id = ?').get(req.userId, vocabularyId);

    if (existing) {
      db.prepare('UPDATE tb_user_word SET status = ?, update_time = datetime("now") WHERE user_id = ? AND vocabulary_id = ?').run(status, req.userId, vocabularyId);
    } else {
      db.prepare('INSERT INTO tb_user_word (user_id, vocabulary_id, status, create_time) VALUES (?, ?, ?, datetime("now"))').run(req.userId, vocabularyId, status);
    }

    if (status === 1) {
      db.prepare('UPDATE tb_user SET total_words = total_words + 1 WHERE id = ?').run(req.userId);
    }

    res.json({ code: 200, message: '标记成功' });
  } catch (err) {
    console.error('Mark vocabulary error:', err);
    res.status(500).json({ code: 500, message: '标记单词失败' });
  }
});

app.get('/api/vocabulary/wrong', authenticate, (req, res) => {
  try {
    const vocabularies = db.prepare(`
      SELECT v.* FROM tb_vocabulary v 
      INNER JOIN tb_user_word uw ON v.id = uw.vocabulary_id 
      WHERE uw.user_id = ? AND uw.status = 0
    `).all(req.userId);

    res.json({ code: 200, data: vocabularies });
  } catch (err) {
    console.error('Get wrong vocabulary error:', err);
    res.status(500).json({ code: 500, message: '获取错题本失败' });
  }
});

// ==================== Speaking APIs ====================

app.get('/api/speaking/topics', (req, res) => {
  try {
    const { language = 'en', level } = req.query;
    let sql = 'SELECT * FROM tb_speaking_topic WHERE 1=1';
    const params = [];

    if (language) {
      sql += ' AND language = ?';
      params.push(language);
    }
    if (level) {
      sql += ' AND difficulty = ?';
      params.push(level);
    }

    sql += ' ORDER BY create_time DESC';

    const topics = db.prepare(sql).all(...params);
    res.json({ code: 200, data: topics });
  } catch (err) {
    console.error('Get speaking topics error:', err);
    res.status(500).json({ code: 500, message: '获取口语题目失败' });
  }
});

app.get('/api/speaking/random', (req, res) => {
  try {
    const { language = 'en' } = req.query;
    
    const topics = db.prepare('SELECT * FROM tb_speaking_topic WHERE language = ? ORDER BY RANDOM() LIMIT 1').all(language);

    res.json({ code: 200, data: topics[0] || null });
  } catch (err) {
    console.error('Get random speaking topic error:', err);
    res.status(500).json({ code: 500, message: '获取随机题目失败' });
  }
});

app.post('/api/speaking/submit', authenticate, (req, res) => {
  try {
    const { topicId, audioUrl, duration } = req.body;
    
    const score = Math.floor(Math.random() * 20) + 75;
    const feedbackList = [
      '发音清晰准确，语调自然流畅',
      '整体表现良好，注意个别音节发音',
      '语调自然，但语速可以稍慢一些',
      '发音标准，连读处理得当',
      '需加强辅音结尾的发音'
    ];
    const feedback = feedbackList[Math.floor(Math.random() * feedbackList.length)];

    const errorPoints = [];
    if (score < 85) {
      errorPoints.push('注意单词重音位置');
      if (score < 80) {
        errorPoints.push('语速稍快，连读不够自然');
      }
    }

    const result = db.prepare(
      'INSERT INTO tb_user_speaking (user_id, topic_id, audio_url, duration, score, feedback, error_points, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))'
    ).run(req.userId, topicId, audioUrl || '', duration || 0, score, feedback, JSON.stringify(errorPoints));

    db.prepare('UPDATE tb_user SET total_minutes = total_minutes + ? WHERE id = ?').run(Math.ceil((duration || 60) / 60), req.userId);

    res.json({
      code: 200,
      data: {
        id: result.lastInsertRowid,
        score,
        feedback,
        errorPoints
      }
    });
  } catch (err) {
    console.error('Submit speaking error:', err);
    res.status(500).json({ code: 500, message: '提交口语练习失败' });
  }
});

app.get('/api/speaking/history', authenticate, (req, res) => {
  try {
    const history = db.prepare(`
      SELECT us.*, st.content as topic_content, st.language 
      FROM tb_user_speaking us 
      INNER JOIN tb_speaking_topic st ON us.topic_id = st.id 
      WHERE us.user_id = ? 
      ORDER BY us.create_time DESC 
      LIMIT 20
    `).all(req.userId);

    res.json({ code: 200, data: history });
  } catch (err) {
    console.error('Get speaking history error:', err);
    res.status(500).json({ code: 500, message: '获取练习历史失败' });
  }
});

// ==================== Health Check ====================

app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: 'OK', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`LinguaWorld Backend API Server running on http://0.0.0.0:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
