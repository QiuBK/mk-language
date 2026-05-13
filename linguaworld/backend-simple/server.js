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

    CREATE TABLE IF NOT EXISTS tb_achievement (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      category TEXT,
      requirement INTEGER DEFAULT 0,
      reward INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tb_user_achievement (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_id INTEGER NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES tb_user(id),
      FOREIGN KEY (achievement_id) REFERENCES tb_achievement(id),
      UNIQUE(user_id, achievement_id)
    );

    CREATE TABLE IF NOT EXISTS tb_post (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      images TEXT,
      language TEXT,
      likes INTEGER DEFAULT 0,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES tb_user(id)
    );

    CREATE TABLE IF NOT EXISTS tb_comment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      parent_id INTEGER,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES tb_post(id),
      FOREIGN KEY (user_id) REFERENCES tb_user(id)
    );

    CREATE TABLE IF NOT EXISTS tb_post_like (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES tb_post(id),
      FOREIGN KEY (user_id) REFERENCES tb_user(id),
      UNIQUE(post_id, user_id)
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
    ['英语基础入门', '从零开始学习英语，掌握日常交流必备词汇和语法，适合零基础学习者', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop', 'en', 'beginner', 4.8, 1234],
    ['英语中级进阶', '提升英语表达能力，学习商务沟通技巧，适合有基础的学习者', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop', 'en', 'intermediate', 4.7, 856],
    ['英语高级口语', '流利英语对话，深度文化理解，适合高级学习者', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop', 'en', 'advanced', 4.9, 543],
    ['日语五十音图', '轻松掌握日语假名，开启日语学习之旅，适合零基础', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop', 'ja', 'beginner', 4.9, 2345],
    ['日语基础会话', '日常日语交流，实用场景对话，适合有基础的学习者', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop', 'ja', 'intermediate', 4.6, 987],
    ['日语N2备考', '日语能力考N2专项训练，语法、听力、阅读全面提升', 'https://images.unsplash.com/photo-1490810195858-35528e328a2a?w=400&h=300&fit=crop', 'ja', 'advanced', 4.8, 765],
    ['韩语零基础', '从韩语字母开始，系统学习韩语，适合零基础', 'https://images.unsplash.com/photo-1404866381178-7a33a3f060a5?w=400&h=300&fit=crop', 'ko', 'beginner', 4.8, 1567],
    ['韩语日常会话', '实用韩语口语，旅游、购物、交友必备', 'https://images.unsplash.com/photo-1465734287070-0c5e629e823e?w=400&h=300&fit=crop', 'ko', 'intermediate', 4.7, 1023],
    ['韩语TOPIK备考', '韩国语能力考试专项辅导，助你一次通过', 'https://images.unsplash.com/photo-1431324452596-d443b6255891?w=400&h=300&fit=crop', 'ko', 'advanced', 4.5, 678],
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
      { title: '日常用品', duration: 450 },
      { title: '家庭成员', duration: 480 }
    ]},
    { title: '简单对话', lessons: [
      { title: '打招呼', duration: 520 },
      { title: '自我介绍', duration: 600 },
      { title: '问路', duration: 550 }
    ]},
    { title: '基础语法', lessons: [
      { title: '时态入门', duration: 720 },
      { title: '简单句型', duration: 600 }
    ]}
  ];

  for (let c = 0; c < courseIds.length; c++) {
    const chapters = [
      { title: '第一章', lessons: [
        { title: '第一节', duration: 600 },
        { title: '第二节', duration: 540 }
      ]},
      { title: '第二章', lessons: [
        { title: '第一节', duration: 480 }
      ]}
    ];
    
    for (let i = 0; i < chapters.length; i++) {
      const chapterResult = insertChapter.run(courseIds[c], chapters[i].title, i + 1);
      for (let j = 0; j < chapters[i].lessons.length; j++) {
        insertLesson.run(chapterResult.lastInsertRowid, chapters[i].lessons[j].title, '', chapters[i].lessons[j].duration, j + 1);
      }
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
    ['love', '/lʌv/', '爱', 'Love is everywhere.', '爱无处不在。', 'en', 'beginner'],
    ['happy', '/ˈhæpi/', '快乐的', 'I am very happy today.', '我今天很开心。', 'en', 'beginner'],
    ['work', '/wɜːrk/', '工作', 'I work hard every day.', '我每天努力工作。', 'en', 'beginner'],
    ['home', '/hoʊm/', '家', 'Home is where the heart is.', '心在哪里，家就在哪里。', 'en', 'beginner'],
    ['book', '/bʊk/', '书', 'Reading a book is relaxing.', '读书很放松。', 'en', 'beginner'],
    ['this', '/ðɪs/', '这个', 'This is my book.', '这是我的书。', 'en', 'beginner'],
    ['that', '/ðæt/', '那个', 'That is your pen.', '那是你的笔。', 'en', 'beginner'],
    ['good', '/ɡʊd/', '好的', 'Good morning!', '早上好！', 'en', 'beginner'],
    ['thank', '/θæŋk/', '感谢', 'Thank you very much.', '非常感谢。', 'en', 'beginner'],
    ['please', '/pliːz/', '请', 'Please sit down.', '请坐。', 'en', 'beginner'],
    ['こんにちは', '/konnichiwa/', '你好', 'こんにちは、元気ですか？', '你好，你好吗？', 'ja', 'beginner'],
    ['ありがとう', '/arigatou/', '谢谢', 'ありがとうございます。', '非常感谢。', 'ja', 'beginner'],
    ['世界', '/sekai/', '世界', '世界は広いですね。', '世界真广阔啊。', 'ja', 'beginner'],
    ['今日', '/kyō/', '今天', '今日はいい天気ですね。', '今天天气真好。', 'ja', 'beginner'],
    ['食べる', '/taberu/', '吃', 'ご飯を食べましょう。', '我们吃饭吧。', 'ja', 'beginner'],
    ['水', '/mizu/', '水', '水をください。', '请给我水。', 'ja', 'beginner'],
    ['家', '/ie/', '家', '家が好きです。', '我喜欢家。', 'ja', 'beginner'],
    ['友達', '/tomodachi/', '朋友', '彼は私の友達です。', '他是我的朋友。', 'ja', 'beginner'],
    ['안녕하세요', '/annyeonghaseyo/', '你好', '안녕하세요, 만나서 반갑습니다.', '你好，见到你很高兴。', 'ko', 'beginner'],
    ['감사합니다', '/gamsahamnida/', '谢谢', '정말 감사합니다.', '真的非常感谢。', 'ko', 'beginner'],
    ['사랑', '/sarang/', '爱', '사랑은 아름다워요.', '爱情很美丽。', 'ko', 'beginner'],
    ['오늘', '/oneul/', '今天', '오늘 날씨가 좋아요.', '今天天气很好。', 'ko', 'beginner'],
    ['음식', '/eumsik/', '食物', '한국 음식이 맛있어요.', '韩国菜很好吃。', 'ko', 'beginner'],
    ['집', '/jip/', '家', '집에 가고 싶어요.', '我想回家。', 'ko', 'beginner'],
    ['친구', '/chingu/', '朋友', '그는 나의 친구입니다.', '他是我的朋友。', 'ko', 'beginner'],
    ['좋아요', '/joayo/', '好', '이 책 좋아요.', '这本书很好。', 'ko', 'beginner'],
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
    ['Talk about your hobbies.', '谈谈你的爱好。', 'en', 'beginner'],
    ['What is your favorite food?', '你最喜欢的食物是什么？', 'en', 'beginner'],
    ['How do you usually spend your holidays?', '你通常如何度过假期？', 'en', 'intermediate'],
    ['Tell me about your family.', '说说你的家庭。', 'en', 'beginner'],
    ['What is your dream job?', '你的理想工作是什么？', 'en', 'intermediate'],
    ['自己紹介をしてください。', '请做一下自我介绍。', 'ja', 'beginner'],
    ['今日の天気を教えてください。', '请告诉我今天的天气。', 'ja', 'intermediate'],
    ['趣味について話してください。', '请谈谈你的兴趣爱好。', 'ja', 'beginner'],
    ['好きな食べ物は何ですか？', '你喜欢什么食物？', 'ja', 'beginner'],
    ['将来の夢は何ですか？', '你的梦想是什么？', 'ja', 'intermediate'],
    ['最近読んだ本は何ですか？', '你最近读了什么书？', 'ja', 'intermediate'],
    ['자기소개를 해보세요.', '请做一下自我介绍。', 'ko', 'beginner'],
    ['오늘 기분은 어떠세요?', '你今天心情怎么样？', 'ko', 'beginner'],
    ['취미가 뭐예요?', '你的爱好是什么？', 'ko', 'beginner'],
    ['좋아하는 음식은 뭐예요?', '你喜欢什么食物？', 'ko', 'beginner'],
    ['어떤 일을 하고 싶어요?', '你想做什么工作？', 'ko', 'intermediate'],
    ['가장 좋아하는 계절은 뭐예요?', '你最喜欢的季节是什么？', 'ko', 'beginner'],
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

  const insertAchievement = db.prepare(`
    INSERT INTO tb_achievement (code, title, description, icon, category, requirement, reward)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const achievements = [
    ['streak_7', '坚持一周', '连续学习7天', 'Flame', 'streak', 7, 100],
    ['streak_30', '坚持一月', '连续学习30天', 'Flame', 'streak', 30, 500],
    ['streak_100', '百日战士', '连续学习100天', 'Fire', 'streak', 100, 1500],
    ['vocab_50', '单词新手', '学习50个单词', 'BookOpen', 'vocabulary', 50, 100],
    ['vocab_100', '词汇达人', '学习100个单词', 'BookOpen', 'vocabulary', 100, 200],
    ['vocab_500', '词汇专家', '学习500个单词', 'GraduationCap', 'vocabulary', 500, 800],
    ['speaking_10', '开口说', '完成10次口语练习', 'Mic', 'speaking', 10, 100],
    ['speaking_50', '口语达人', '完成50次口语练习', 'Mic', 'speaking', 50, 300],
    ['speaking_100', '口语大师', '完成100次口语练习', 'Star', 'speaking', 100, 800],
    ['level_5', '初露锋芒', '达到5级', 'Star', 'learning', 5, 150],
    ['level_10', '小有名气', '达到10级', 'Trophy', 'learning', 10, 500],
    ['course_3', '学习达人', '完成3门课程', 'Book', 'learning', 3, 300],
    ['first_post', '初次发言', '发布第一条动态', 'Edit', 'social', 1, 50],
    ['post_10', '社交达人', '发布10条动态', 'Chat', 'social', 10, 200]
  ];

  for (const achievement of achievements) {
    insertAchievement.run(...achievement);
  }

  const insertPost = db.prepare(`
    INSERT INTO tb_post (user_id, content, language, likes, create_time)
    VALUES (?, ?, ?, ?, datetime('now', ?))
  `);

  const posts = [
    [1, '学习英语三个月了，从零基础到现在能进行简单对话，感觉进步很大！每天早起听英语播客，午餐时间背单词，晚上练习口语。希望大家也能坚持下去！💪', 'en', 128, '-1 hours'],
    [2, '推荐一个超好用的韩语学习APP！通过看韩剧学韩语真的很有趣，朋友们都说我发音越来越地道了。', 'ko', 256, '-1 days'],
    [1, '今天完成了日语五十音图的学习！下一步准备开始学习基础会话，希望能够尽快达到N5水平。', 'ja', 89, '-2 days']
  ];

  for (const post of posts) {
    insertPost.run(...post);
  }

  const insertComment = db.prepare(`
    INSERT INTO tb_comment (post_id, user_id, content, create_time)
    VALUES (?, ?, ?, datetime('now', ?))
  `);

  const comments = [
    [1, 2, '太棒了！我也是用类似的方法学习的，确实很有效！', '-30 minutes'],
    [1, 1, '坚持就是胜利，一起加油！', '-20 minutes'],
    [2, 1, '请问是哪个APP呀？我也想试试', '-5 hours'],
    [2, 2, '是HelloTalk，非常适合初学者', '-4 hours']
  ];

  for (const comment of comments) {
    insertComment.run(...comment);
  }

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

    const userId = req.userId;
    
    const result = courses.map(course => {
      const chapters = db.prepare('SELECT * FROM tb_chapter WHERE course_id = ?').all(course.id);
      const totalLessons = chapters.reduce((sum, ch) => {
        const lessons = db.prepare('SELECT * FROM tb_lesson WHERE chapter_id = ?').all(ch.id);
        return sum + lessons.length;
      }, 0);

      let progress = 0;
      if (userId) {
        const progressData = db.prepare(
          'SELECT SUM(progress) as total FROM tb_user_progress WHERE user_id = ? AND course_id = ?'
        ).get(userId, course.id);
        if (progressData.total && totalLessons > 0) {
          progress = (progressData.total / totalLessons) * 100;
        }
      }

      return {
        ...course,
        totalLessons,
        progress: Math.round(progress * 10) / 10
      };
    });

    res.json({ code: 200, data: result });
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

// ==================== Achievement APIs ====================

app.get('/api/achievement/list', authenticate, (req, res) => {
  try {
    const achievements = db.prepare('SELECT * FROM tb_achievement ORDER BY category, requirement').all();
    const userAchievements = db.prepare('SELECT achievement_id, unlocked_at FROM tb_user_achievement WHERE user_id = ?').all(req.userId);
    const userInfo = db.prepare('SELECT streak, total_words, level FROM tb_user WHERE id = ?').get(req.userId);
    const speakingCount = db.prepare('SELECT COUNT(*) as count FROM tb_user_speaking WHERE user_id = ?').get(req.userId);
    const courseCount = db.prepare('SELECT COUNT(*) as count FROM tb_enrollment WHERE user_id = ?').get(req.userId);
    const postCount = db.prepare('SELECT COUNT(*) as count FROM tb_post WHERE user_id = ?').get(req.userId);

    const unlockedMap = new Map(userAchievements.map(ua => [ua.achievement_id, ua.unlocked_at]));

    const result = achievements.map(a => {
      const unlockedAt = unlockedMap.get(a.id);
      let current = 0;

      if (a.category === 'streak') {
        current = userInfo?.streak || 0;
      } else if (a.category === 'vocabulary') {
        current = userInfo?.total_words || 0;
      } else if (a.category === 'speaking') {
        current = speakingCount?.count || 0;
      } else if (a.category === 'learning') {
        if (a.code === 'level_5' || a.code === 'level_10') {
          current = userInfo?.level || 0;
        } else if (a.code === 'course_3') {
          current = courseCount?.count || 0;
        }
      } else if (a.category === 'social') {
        current = postCount?.count || 0;
      }

      return {
        ...a,
        unlocked: !!unlockedAt,
        unlockedAt: unlockedAt || null,
        current
      };
    });

    res.json({ code: 200, data: result });
  } catch (err) {
    console.error('Get achievements error:', err);
    res.status(500).json({ code: 500, message: '获取成就列表失败' });
  }
});

// ==================== Post APIs ====================

app.get('/api/post/list', (req, res) => {
  try {
    const { language, tag, page = 1, pageSize = 20 } = req.query;
    let sql = `
      SELECT p.*, u.nickname as user_name, u.avatar as user_avatar,
        (SELECT COUNT(*) FROM tb_comment WHERE post_id = p.id) as comments_count
      FROM tb_post p
      INNER JOIN tb_user u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (language) {
      sql += ' AND p.language = ?';
      params.push(language);
    }
    if (tag === '打卡') {
      sql += ' AND p.content LIKE ?';
      params.push('%打卡%');
    }
    if (tag === '求助') {
      sql += ' AND p.content LIKE ?';
      params.push('%求助%');
    }

    sql += ' ORDER BY p.create_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

    const posts = db.prepare(sql).all(...params);

    const result = posts.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      liked: false,
      showComments: false,
      comments: []
    }));

    res.json({ code: 200, data: result });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ code: 500, message: '获取帖子列表失败' });
  }
});

app.post('/api/post/create', authenticate, (req, res) => {
  try {
    const { content, images, language } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ code: 400, message: '内容不能为空' });
    }

    const result = db.prepare(`
      INSERT INTO tb_post (user_id, content, images, language, create_time)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(req.userId, content, images ? JSON.stringify(images) : null, language || null);

    const post = db.prepare(`
      SELECT p.*, u.nickname as user_name, u.avatar as user_avatar
      FROM tb_post p
      INNER JOIN tb_user u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    const postCount = db.prepare('SELECT COUNT(*) as count FROM tb_post WHERE user_id = ?').get(req.userId);

    const firstPostAchievement = db.prepare('SELECT * FROM tb_achievement WHERE code = ?').get('first_post');
    if (firstPostAchievement && postCount.count >= 1) {
      const existing = db.prepare('SELECT * FROM tb_user_achievement WHERE user_id = ? AND achievement_id = ?').get(req.userId, firstPostAchievement.id);
      if (!existing) {
        db.prepare('INSERT INTO tb_user_achievement (user_id, achievement_id) VALUES (?, ?)').run(req.userId, firstPostAchievement.id);
        db.prepare('UPDATE tb_user SET exp = exp + ? WHERE id = ?').run(firstPostAchievement.reward, req.userId);
      }
    }

    res.json({
      code: 200,
      message: '发布成功',
      data: {
        ...post,
        images: post.images ? JSON.parse(post.images) : [],
        liked: false,
        showComments: false,
        comments: [],
        commentsCount: 0
      }
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ code: 500, message: '发布失败' });
  }
});

app.get('/api/post/:id/comments', (req, res) => {
  try {
    const { id } = req.params;

    const comments = db.prepare(`
      SELECT c.*, u.nickname as user_name, u.avatar as user_avatar
      FROM tb_comment c
      INNER JOIN tb_user u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.create_time ASC
    `).all(id);

    res.json({ code: 200, data: comments });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ code: 500, message: '获取评论失败' });
  }
});

app.post('/api/post/:id/comment', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ code: 400, message: '评论内容不能为空' });
    }

    const result = db.prepare(`
      INSERT INTO tb_comment (post_id, user_id, content, create_time)
      VALUES (?, ?, ?, datetime('now'))
    `).run(id, req.userId, content);

    const comment = db.prepare(`
      SELECT c.*, u.nickname as user_name, u.avatar as user_avatar
      FROM tb_comment c
      INNER JOIN tb_user u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    res.json({ code: 200, message: '评论成功', data: comment });
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ code: 500, message: '评论失败' });
  }
});

app.post('/api/post/:id/like', authenticate, (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM tb_post_like WHERE post_id = ? AND user_id = ?').get(id, req.userId);

    if (existing) {
      db.prepare('DELETE FROM tb_post_like WHERE post_id = ? AND user_id = ?').run(id, req.userId);
      db.prepare('UPDATE tb_post SET likes = likes - 1 WHERE id = ?').run(id);
      res.json({ code: 200, message: '取消点赞' });
    } else {
      db.prepare('INSERT INTO tb_post_like (post_id, user_id) VALUES (?, ?)').run(id, req.userId);
      db.prepare('UPDATE tb_post SET likes = likes + 1 WHERE id = ?').run(id);
      res.json({ code: 200, message: '点赞成功' });
    }
  } catch (err) {
    console.error('Like post error:', err);
    res.status(500).json({ code: 500, message: '操作失败' });
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
