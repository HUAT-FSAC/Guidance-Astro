-- src/db/seed.sql
-- 创建初始 super_admin 账号
--
-- ⚠️ 默认密码为 admin123456，仅供开发/测试使用，上线前务必修改！
--
-- 如需自定义密码，请先生成 bcrypt hash：
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('你的密码', 10).then(h => console.log(h))"
-- 然后替换下面的 password_hash 值

INSERT OR IGNORE INTO users (id, username, email, password_hash, display_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'admin@huat-fsac.eu.org',
  '$2b$10$oJPl4dGVWAFSRp54grYEAu7N33DqNbMOvy3pQJftOlJIzPZh8tNri',
  '超级管理员',
  'super_admin',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);
