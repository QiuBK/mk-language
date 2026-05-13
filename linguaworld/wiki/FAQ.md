# 常见问题

本文档收集了 LinguaWorld 平台使用和开发过程中的常见问题及解决方案。

## 目录

- [使用问题](#使用问题)
- [开发问题](#开发问题)
- [部署问题](#部署问题)
- [功能疑问](#功能疑问)

---

## 使用问题

### Q: 如何注册账号？

**A:** 访问平台首页，点击右上角的「注册」按钮，填写用户名、邮箱和密码即可完成注册。

### Q: 忘记密码怎么办？

**A:** 目前版本暂不支持自助找回密码功能，请联系管理员重置密码。

### Q: 支持哪些语言学习？

**A:** 目前支持英语、日语、韩语三种语言的学习。

### Q: 如何切换界面语言？

**A:** 点击页面右上角的语言切换按钮，选择你想要的界面语言（中文/English/日本語/한국어）。

### Q: 学习进度会保存吗？

**A:** 是的，你的所有学习进度都会自动保存到服务器，包括课程进度、单词掌握状态、口语练习记录等。

### Q: 视频播放支持倍速吗？

**A:** 支持！视频播放器提供 0.5x、0.75x、1x、1.25x、1.5x、2x 倍速选项。

### Q: 口语练习的评分准确吗？

**A:** 当前版本使用模拟评分，主要用于学习反馈。后续版本将集成真实的 AI 语音评测服务。

### Q: 如何获得成就徽章？

**A:** 通过完成学习任务获得成就，如连续学习天数、掌握单词数量、完成课程等。

---

## 开发问题

### Q: 前端启动时报错 "Cannot find module"

**A:** 请先安装依赖：

```bash
cd frontend
npm install
```

### Q: 后端启动失败，提示端口被占用

**A:** 可以修改 `backend-simple/server.js` 中的端口号，或终止占用端口的进程：

```bash
# 查找占用 8080 端口的进程
lsof -i:8080

# 终止进程
kill -9 <PID>
```

### Q: 前端无法连接后端 API

**A:** 请检查：

1. 后端服务是否正常启动
2. `frontend/vite.config.ts` 中的代理配置是否正确
3. 浏览器控制台是否有 CORS 相关错误

### Q: 如何修改数据库中的数据？

**A:** 可以使用 SQLite 客户端工具直接操作数据库文件：

```bash
cd backend-simple
sqlite3 linguaworld.db

# 查看所有表
.tables

# 查询用户
SELECT * FROM tb_user;

# 退出
.quit
```

### Q: TypeScript 类型错误怎么办？

**A:** 运行类型检查：

```bash
cd frontend
npm run type-check
```

根据错误提示修复类型问题。

### Q: 如何添加新的示例数据？

**A:** 编辑 `backend-simple/server.js` 中的数据库初始化部分，添加 INSERT 语句。

### Q: Vue DevTools 不显示组件

**A:** 确保使用的是开发环境构建，并且在浏览器中安装了 Vue DevTools 扩展。

---

## 部署问题

### Q: 前端部署后刷新页面 404

**A:** 这是 Vue Router history 模式的问题，请配置 Nginx：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Q: 如何升级 Node.js 版本？

**A:** 推荐使用 nvm (Node Version Manager)：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装 Node.js 18
nvm install 18
nvm use 18
```

### Q: HTTPS 如何配置？

**A:** 使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

### Q: 如何监控服务器状态？

**A:** 使用 PM2 监控：

```bash
pm2 monit
```

或使用监控工具如 htop、Prometheus + Grafana。

### Q: 数据库文件越来越大怎么办？

**A:** 可以执行 VACUUM 命令清理数据库：

```sql
VACUUM;
```

或定期清理历史数据。

---

## 功能疑问

### Q: 未来会支持更多语言吗？

**A:** 是的！我们计划在未来版本中添加法语、德语、西班牙语等更多语言。

### Q: 会有移动端 App 吗？

**A:** 目前专注于 Web 端，移动端可以使用浏览器访问，响应式设计已适配移动端。

### Q: 支持离线学习吗？

**A:** 当前版本需要网络连接，离线学习功能在规划中。

### Q: 如何提交功能建议或 Bug 反馈？

**A:** 可以通过以下方式：
- GitHub Issues（如果开源）
- 社区板块发帖
- 联系客服邮箱

### Q: 数据会导出吗？

**A:** 目前版本暂不支持数据导出，此功能在开发计划中。

### Q: 有教师端吗？

**A:** 教师管理功能在规划中，包括课程创建、作业批改、学生管理等。

---

## 更多帮助

如果本文档没有解决你的问题，请：

1. 查看其他 Wiki 页面
2. 检查 GitHub Issues（如果开源）
3. 联系技术支持

---

## 贡献指南

如果你发现了新的问题或解决方案，欢迎补充本文档！
