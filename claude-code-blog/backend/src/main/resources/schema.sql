-- ============================================
-- Claude Code 博客系统数据库初始化脚本
-- ============================================

CREATE DATABASE IF NOT EXISTS claude_code_blog
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE claude_code_blog;

-- ============================================
-- 1. 管理员用户表
-- ============================================
CREATE TABLE IF NOT EXISTS sys_admin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(BCrypt加密)',
    nickname VARCHAR(50) DEFAULT '' COMMENT '昵称',
    avatar VARCHAR(500) DEFAULT '' COMMENT '头像URL',
    email VARCHAR(100) DEFAULT '' COMMENT '邮箱',
    status TINYINT DEFAULT 1 COMMENT '状态: 0=禁用, 1=启用',
    last_login_time DATETIME COMMENT '最后登录时间',
    last_login_ip VARCHAR(50) COMMENT '最后登录IP',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB COMMENT='管理员用户表';

-- 默认管理员: admin / admin123
INSERT INTO sys_admin (username, password, nickname, email) VALUES
('admin', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36PQm1z8qMGr3U6PYKOKP2G', '管理员', 'admin@claudecode.blog');

-- ============================================
-- 2. 文章分类表
-- ============================================
CREATE TABLE IF NOT EXISTS blog_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL别名',
    icon VARCHAR(50) DEFAULT '' COMMENT '图标class',
    color VARCHAR(20) DEFAULT '#3b82f6' COMMENT '主题色',
    description TEXT COMMENT '分类描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID, 0=顶级',
    article_count INT DEFAULT 0 COMMENT '文章数',
    status TINYINT DEFAULT 1 COMMENT '状态: 0=禁用, 1=启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB COMMENT='文章分类表';

-- ============================================
-- 3. 文章标签表
-- ============================================
CREATE TABLE IF NOT EXISTS blog_tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
    slug VARCHAR(50) NOT NULL UNIQUE COMMENT 'URL别名',
    color VARCHAR(20) DEFAULT '#6366f1' COMMENT '标签颜色',
    article_count INT DEFAULT 0 COMMENT '文章数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB COMMENT='文章标签表';

-- ============================================
-- 4. 文章表
-- ============================================
CREATE TABLE IF NOT EXISTS blog_article (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '文章标题',
    slug VARCHAR(255) NOT NULL UNIQUE COMMENT 'URL别名',
    summary TEXT COMMENT '文章摘要',
    content LONGTEXT COMMENT '文章内容(Markdown)',
    content_html LONGTEXT COMMENT '文章内容(HTML渲染)',
    cover_image VARCHAR(500) DEFAULT '' COMMENT '封面图',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    author VARCHAR(50) DEFAULT 'Claude Code Blog' COMMENT '作者',
    source_file VARCHAR(500) DEFAULT '' COMMENT '对应源码文件路径',
    difficulty TINYINT DEFAULT 2 COMMENT '难度: 1=入门, 2=中级, 3=高级, 4=专家',
    is_top TINYINT DEFAULT 0 COMMENT '是否置顶',
    is_recommended TINYINT DEFAULT 0 COMMENT '是否推荐',
    status TINYINT DEFAULT 1 COMMENT '状态: 0=草稿, 1=已发布',
    view_count BIGINT DEFAULT 0 COMMENT '浏览量',
    like_count BIGINT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    word_count INT DEFAULT 0 COMMENT '字数',
    read_time INT DEFAULT 0 COMMENT '预计阅读时间(分钟)',
    sort_order INT DEFAULT 0 COMMENT '排序',
    published_at DATETIME COMMENT '发布时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    INDEX idx_category(category_id),
    INDEX idx_slug(slug),
    INDEX idx_status(status),
    INDEX idx_published(published_at)
) ENGINE=InnoDB COMMENT='文章表';

-- ============================================
-- 5. 文章-标签关联表
-- ============================================
CREATE TABLE IF NOT EXISTS blog_article_tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    UNIQUE INDEX idx_article_tag(article_id, tag_id),
    INDEX idx_tag(tag_id)
) ENGINE=InnoDB COMMENT='文章标签关联表';

-- ============================================
-- 6. 访问日志表(用于统计分析)
-- ============================================
CREATE TABLE IF NOT EXISTS sys_visit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visitor_ip VARCHAR(50) COMMENT '访客IP',
    visitor_ua VARCHAR(500) COMMENT 'User-Agent',
    visitor_referer VARCHAR(500) COMMENT '来源页面',
    page_url VARCHAR(500) COMMENT '访问页面',
    article_id BIGINT DEFAULT NULL COMMENT '文章ID(如有)',
    session_id VARCHAR(100) COMMENT '会话ID',
    device_type VARCHAR(20) DEFAULT 'unknown' COMMENT '设备类型: pc/mobile/tablet',
    browser VARCHAR(50) COMMENT '浏览器',
    os VARCHAR(50) COMMENT '操作系统',
    country VARCHAR(50) COMMENT '国家',
    province VARCHAR(50) COMMENT '省份',
    city VARCHAR(50) COMMENT '城市',
    visit_duration INT DEFAULT 0 COMMENT '访问时长(秒)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip(visitor_ip),
    INDEX idx_article(article_id),
    INDEX idx_created(created_at),
    INDEX idx_session(session_id)
) ENGINE=InnoDB COMMENT='访问日志表';

-- ============================================
-- 7. 每日统计汇总表
-- ============================================
CREATE TABLE IF NOT EXISTS sys_daily_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE COMMENT '统计日期',
    pv INT DEFAULT 0 COMMENT '页面浏览量',
    uv INT DEFAULT 0 COMMENT '独立访客数',
    ip_count INT DEFAULT 0 COMMENT '独立IP数',
    new_visitor INT DEFAULT 0 COMMENT '新访客数',
    avg_duration INT DEFAULT 0 COMMENT '平均访问时长(秒)',
    bounce_rate DECIMAL(5,2) DEFAULT 0 COMMENT '跳出率(%)',
    article_views INT DEFAULT 0 COMMENT '文章总浏览量',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date(stat_date)
) ENGINE=InnoDB COMMENT='每日统计汇总表';

-- ============================================
-- 8. 评论表
-- ============================================
CREATE TABLE IF NOT EXISTS blog_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT NOT NULL COMMENT '文章ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父评论ID',
    nickname VARCHAR(50) NOT NULL COMMENT '昵称',
    email VARCHAR(100) DEFAULT '' COMMENT '邮箱',
    avatar VARCHAR(500) DEFAULT '' COMMENT '头像',
    content TEXT NOT NULL COMMENT '评论内容',
    ip VARCHAR(50) COMMENT 'IP',
    status TINYINT DEFAULT 0 COMMENT '状态: 0=待审核, 1=已通过, 2=已拒绝',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    INDEX idx_article(article_id),
    INDEX idx_parent(parent_id)
) ENGINE=InnoDB COMMENT='评论表';

-- ============================================
-- 9. 系统配置表
-- ============================================
CREATE TABLE IF NOT EXISTS sys_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type VARCHAR(20) DEFAULT 'string' COMMENT '类型: string/number/boolean/json',
    description VARCHAR(255) DEFAULT '' COMMENT '描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='系统配置表';

-- 初始化配置
INSERT INTO sys_config (config_key, config_value, config_type, description) VALUES
('site_name', 'Claude Code 深度解读', 'string', '站点名称'),
('site_description', '全网最深度的 Claude Code 源码解析与实战博客', 'string', '站点描述'),
('site_keywords', 'Claude Code,源码解读,AI编程,Anthropic,Claude', 'string', '站点关键词'),
('site_logo', '/logo.svg', 'string', '站点Logo'),
('github_url', 'https://github.com/anthropics/claude-code', 'string', 'GitHub地址'),
('icp_number', '', 'string', 'ICP备案号'),
('analytics_enabled', 'true', 'boolean', '是否启用访问统计');

-- ============================================
-- 初始化分类数据
-- ============================================
INSERT INTO blog_category (name, slug, icon, color, description, sort_order, parent_id) VALUES
-- 一级分类
('快速入门', 'getting-started', 'rocket', '#10b981', 'Claude Code 安装配置与基础使用教程', 1, 0),
('源码架构', 'architecture', 'building', '#3b82f6', 'Claude Code 整体架构与设计模式深度解析', 2, 0),
('核心机制', 'core-mechanism', 'cog', '#8b5cf6', 'Claude Code 核心引擎、提示词系统、上下文管理等核心机制', 3, 0),
('工具系统', 'tool-system', 'wrench', '#f59e0b', 'Claude Code 42个内置工具的源码级深度剖析', 4, 0),
('深度研究', 'deep-dive', 'microscope', '#ef4444', '状态管理、权限安全、Plan模式等专题深度研究', 5, 0),
('扩展能力', 'extensions', 'puzzle', '#06b6d4', 'MCP协议、插件系统、Skills、多智能体等扩展机制', 6, 0),
('实战应用', 'practice', 'lightning', '#f97316', 'Claude Code 实际项目中的最佳实践与应用案例', 7, 0),
('请求流程', 'request-flow', 'flow', '#ec4899', '一次完整的 Claude Code 请求从输入到响应的全链路解析', 8, 0),
('项目架构图', 'diagrams', 'diagram', '#14b8a6', 'Claude Code 各模块架构图与流程图集合', 9, 0);

-- 二级分类
INSERT INTO blog_category (name, slug, icon, color, description, sort_order, parent_id) VALUES
('安装配置', 'installation', 'download', '#10b981', '环境搭建与初始配置', 1, 1),
('基础命令', 'basic-commands', 'terminal', '#10b981', '常用命令与快捷键', 2, 1),
('CLAUDE.md编写', 'claude-md', 'file', '#10b981', 'CLAUDE.md 项目说明文件编写指南', 3, 1),
('高级技巧', 'advanced-tips', 'star', '#10b981', '进阶使用技巧与隐藏功能', 4, 1),

('启动流程', 'startup-flow', 'play', '#3b82f6', '从 cli.tsx 到 REPL 的完整启动链路', 1, 2),
('目录结构', 'directory-structure', 'folder', '#3b82f6', '1900+源文件的组织架构', 2, 2),
('模块依赖', 'module-deps', 'link', '#3b82f6', '核心模块依赖关系与数据流', 3, 2),
('设计模式', 'design-patterns', 'pattern', '#3b82f6', '源码中的设计模式应用', 4, 2),

('QueryEngine解析', 'query-engine', 'engine', '#8b5cf6', '请求执行引擎的工作原理', 1, 3),
('提示词系统', 'prompt-system', 'chat', '#8b5cf6', 'System Prompt 的构建与优化策略', 2, 3),
('上下文管理', 'context-management', 'layers', '#8b5cf6', '上下文窗口管理与自动压缩', 3, 3),
('Slash命令', 'slash-commands', 'command', '#8b5cf6', '60+斜杠命令的注册与执行机制', 4, 3),

('文件操作工具', 'file-tools', 'file-code', '#f59e0b', 'FileRead/FileEdit/FileWrite/Glob/Grep', 1, 4),
('执行工具', 'exec-tools', 'terminal', '#f59e0b', 'BashTool/PowerShell/REPL', 2, 4),
('搜索工具', 'search-tools', 'search', '#f59e0b', 'WebSearch/WebFetch/GrepTool', 3, 4),
('智能体工具', 'agent-tools', 'robot', '#f59e0b', 'AgentTool/TaskTool/SendMessage', 4, 4),
('MCP工具', 'mcp-tools', 'plug', '#f59e0b', 'MCPTool/ListMcpResources/ReadMcpResource', 5, 4);

-- ============================================
-- 初始化标签数据
-- ============================================
INSERT INTO blog_tag (name, slug, color) VALUES
('TypeScript', 'typescript', '#3178c6'),
('React', 'react', '#61dafb'),
('Ink', 'ink', '#ff6b6b'),
('源码解读', 'source-code', '#10b981'),
('架构设计', 'architecture', '#3b82f6'),
('工具实现', 'tool-impl', '#f59e0b'),
('MCP协议', 'mcp', '#8b5cf6'),
('提示词工程', 'prompt-engineering', '#ec4899'),
('安全机制', 'security', '#ef4444'),
('性能优化', 'performance', '#06b6d4'),
('状态管理', 'state-management', '#14b8a6'),
('CLI开发', 'cli-dev', '#6366f1'),
('AI编程', 'ai-coding', '#f97316'),
('实战案例', 'practice', '#84cc16'),
('流程图', 'flowchart', '#a855f7');
