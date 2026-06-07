-- 创建数据库
CREATE DATABASE IF NOT EXISTS franchise_store_supervision DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE franchise_store_supervision;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    role ENUM('admin', 'supervisor', 'store_manager', 'area_manager') NOT NULL COMMENT '角色: admin-总部管理员, supervisor-督导员, store_manager-店长, area_manager-区域经理',
    area_id INT UNSIGNED DEFAULT NULL COMMENT '所属区域ID',
    avatar VARCHAR(255) DEFAULT NULL COMMENT '头像',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_area_id (area_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 区域表
CREATE TABLE IF NOT EXISTS areas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '区域名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '区域编码',
    parent_id INT UNSIGNED DEFAULT NULL COMMENT '父区域ID',
    level TINYINT DEFAULT 1 COMMENT '层级: 1-大区, 2-城市, 3-片区',
    manager_id INT UNSIGNED DEFAULT NULL COMMENT '区域经理ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent_id (parent_id),
    INDEX idx_manager_id (manager_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='区域表';

-- 3. 门店表
CREATE TABLE IF NOT EXISTS stores (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '门店名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '门店编码',
    area_id INT UNSIGNED NOT NULL COMMENT '所属区域ID',
    address VARCHAR(255) NOT NULL COMMENT '门店地址',
    longitude DECIMAL(10, 7) NOT NULL COMMENT '经度',
    latitude DECIMAL(10, 7) NOT NULL COMMENT '纬度',
    checkin_radius INT DEFAULT 200 COMMENT '打卡有效半径(米)',
    manager_id INT UNSIGNED DEFAULT NULL COMMENT '店长ID',
    franchisee_name VARCHAR(50) DEFAULT NULL COMMENT '加盟商姓名',
    franchisee_phone VARCHAR(20) DEFAULT NULL COMMENT '加盟商电话',
    opening_date DATE DEFAULT NULL COMMENT '开业日期',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-正常营业, 0-已关闭',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_area_id (area_id),
    INDEX idx_manager_id (manager_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门店表';

-- 4. 检查项分类表
CREATE TABLE IF NOT EXISTS check_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '分类名称: 卫生、食材、出品、服务、员工形象',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    sort_order INT DEFAULT 0 COMMENT '排序',
    description VARCHAR(255) DEFAULT NULL COMMENT '描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检查项分类表';

-- 5. 检查项表
CREATE TABLE IF NOT EXISTS check_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED NOT NULL COMMENT '分类ID',
    name VARCHAR(200) NOT NULL COMMENT '检查项名称',
    scoring_criteria TEXT NOT NULL COMMENT '评分标准',
    weight DECIMAL(5, 2) NOT NULL DEFAULT 1.00 COMMENT '权重',
    max_score DECIMAL(5, 2) NOT NULL DEFAULT 10.00 COMMENT '满分',
    sort_order INT DEFAULT 0 COMMENT '排序',
    must_pass TINYINT DEFAULT 0 COMMENT '是否必过项: 1-是, 0-否',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_id (category_id),
    INDEX idx_sort_order (sort_order),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检查项表';

-- 6. 督导任务表
CREATE TABLE IF NOT EXISTS supervision_tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_no VARCHAR(50) NOT NULL UNIQUE COMMENT '任务编号',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    supervisor_id INT UNSIGNED NOT NULL COMMENT '督导员ID',
    description TEXT DEFAULT NULL COMMENT '任务描述',
    task_type ENUM('routine', 'special', 'recheck') NOT NULL DEFAULT 'routine' COMMENT '任务类型: routine-例行检查, special-专项检查, recheck-复检',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '状态: pending-待执行, in_progress-进行中, completed-已完成, cancelled-已取消',
    created_by INT UNSIGNED NOT NULL COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_status (status),
    INDEX idx_task_type (task_type),
    INDEX idx_date_range (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='督导任务表';

-- 7. 任务-门店关联表
CREATE TABLE IF NOT EXISTS task_stores (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id INT UNSIGNED NOT NULL COMMENT '任务ID',
    store_id INT UNSIGNED NOT NULL COMMENT '门店ID',
    check_status ENUM('pending', 'checked', 'recheck_needed') DEFAULT 'pending' COMMENT '检查状态: pending-待检查, checked-已检查, recheck_needed-需复检',
    checked_at TIMESTAMP NULL COMMENT '检查时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_task_store (task_id, store_id),
    INDEX idx_task_id (task_id),
    INDEX idx_store_id (store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务-门店关联表';

-- 8. 打卡记录表
CREATE TABLE IF NOT EXISTS checkin_records (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id INT UNSIGNED NOT NULL COMMENT '任务ID',
    store_id INT UNSIGNED NOT NULL COMMENT '门店ID',
    supervisor_id INT UNSIGNED NOT NULL COMMENT '督导员ID',
    longitude DECIMAL(10, 7) NOT NULL COMMENT '打卡经度',
    latitude DECIMAL(10, 7) NOT NULL COMMENT '打卡纬度',
    distance DECIMAL(8, 2) DEFAULT NULL COMMENT '与门店距离(米)',
    is_valid TINYINT DEFAULT 1 COMMENT '是否有效: 1-有效, 0-无效',
    invalid_reason VARCHAR(255) DEFAULT NULL COMMENT '无效原因',
    checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '打卡时间',
    photo_url VARCHAR(255) DEFAULT NULL COMMENT '打卡照片',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_task_store (task_id, store_id),
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_checkin_time (checkin_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打卡记录表';

-- 9. 检查报告表
CREATE TABLE IF NOT EXISTS inspection_reports (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_no VARCHAR(50) NOT NULL UNIQUE COMMENT '报告编号',
    task_id INT UNSIGNED NOT NULL COMMENT '任务ID',
    store_id INT UNSIGNED NOT NULL COMMENT '门店ID',
    supervisor_id INT UNSIGNED NOT NULL COMMENT '督导员ID',
    checkin_id INT UNSIGNED NOT NULL COMMENT '打卡记录ID',
    total_score DECIMAL(8, 2) NOT NULL COMMENT '总得分',
    max_score DECIMAL(8, 2) NOT NULL COMMENT '满分',
    score_rate DECIMAL(5, 2) NOT NULL COMMENT '得分率(%)',
    is_pass TINYINT DEFAULT 1 COMMENT '是否合格: 1-合格, 0-不合格',
    problem_count INT DEFAULT 0 COMMENT '问题数量',
    must_pass_failed TINYINT DEFAULT 0 COMMENT '必过项是否有不合格: 1-有, 0-无',
    summary TEXT DEFAULT NULL COMMENT '总体评价',
    improvement_suggestions TEXT DEFAULT NULL COMMENT '改进建议',
    inspection_date DATE NOT NULL COMMENT '检查日期',
    status ENUM('draft', 'submitted', 'confirmed') DEFAULT 'draft' COMMENT '状态: draft-草稿, submitted-已提交, confirmed-已确认',
    submitted_at TIMESTAMP NULL COMMENT '提交时间',
    confirmed_by INT UNSIGNED DEFAULT NULL COMMENT '确认人ID',
    confirmed_at TIMESTAMP NULL COMMENT '确认时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_task_id (task_id),
    INDEX idx_store_id (store_id),
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_inspection_date (inspection_date),
    INDEX idx_is_pass (is_pass)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检查报告表';

-- 10. 检查项得分表
CREATE TABLE IF NOT EXISTS inspection_item_scores (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_id INT UNSIGNED NOT NULL COMMENT '报告ID',
    item_id INT UNSIGNED NOT NULL COMMENT '检查项ID',
    category_id INT UNSIGNED NOT NULL COMMENT '分类ID',
    score DECIMAL(8, 2) NOT NULL COMMENT '得分',
    max_score DECIMAL(8, 2) NOT NULL COMMENT '该项满分',
    weight DECIMAL(5, 2) NOT NULL COMMENT '权重',
    weighted_score DECIMAL(8, 2) NOT NULL COMMENT '加权得分',
    is_pass TINYINT DEFAULT 1 COMMENT '是否合格: 1-合格, 0-不合格',
    must_pass TINYINT DEFAULT 0 COMMENT '是否必过项',
    problem_description TEXT DEFAULT NULL COMMENT '问题描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_id (report_id),
    INDEX idx_item_id (item_id),
    INDEX idx_category_id (category_id),
    INDEX idx_is_pass (is_pass)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检查项得分表';

-- 11. 检查照片表
CREATE TABLE IF NOT EXISTS inspection_photos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_id INT UNSIGNED NOT NULL COMMENT '报告ID',
    item_score_id INT UNSIGNED DEFAULT NULL COMMENT '检查项得分ID(可选)',
    photo_url VARCHAR(255) NOT NULL COMMENT '照片URL',
    photo_type ENUM('overall', 'problem', 'evidence') DEFAULT 'evidence' COMMENT '照片类型: overall-整体照, problem-问题照, evidence-取证照',
    description VARCHAR(255) DEFAULT NULL COMMENT '照片描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_id (report_id),
    INDEX idx_item_score_id (item_score_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检查照片表';

-- 12. 整改单表
CREATE TABLE IF NOT EXISTS rectification_orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '整改单编号',
    report_id INT UNSIGNED NOT NULL COMMENT '检查报告ID',
    store_id INT UNSIGNED NOT NULL COMMENT '门店ID',
    item_score_id INT UNSIGNED NOT NULL COMMENT '不合格检查项ID',
    title VARCHAR(255) NOT NULL COMMENT '整改标题',
    problem_description TEXT NOT NULL COMMENT '问题描述',
    rectification_requirements TEXT NOT NULL COMMENT '整改要求',
    deadline_days INT NOT NULL DEFAULT 7 COMMENT '整改期限(天)',
    deadline DATE NOT NULL COMMENT '整改截止日期',
    status ENUM('pending', 'rectified', 'rechecked', 'overdue') DEFAULT 'pending' COMMENT '状态: pending-待整改, rectified-已整改, rechecked-已复检, overdue-已逾期',
    rectification_description TEXT DEFAULT NULL COMMENT '整改说明',
    rectified_at TIMESTAMP NULL COMMENT '整改完成时间',
    rectified_by INT UNSIGNED DEFAULT NULL COMMENT '整改人ID(店长)',
    recheck_report_id INT UNSIGNED DEFAULT NULL COMMENT '复检报告ID',
    recheck_result ENUM('pass', 'fail') DEFAULT NULL COMMENT '复检结果: pass-通过, fail-不通过',
    rechecked_at TIMESTAMP NULL COMMENT '复检时间',
    rechecked_by INT UNSIGNED DEFAULT NULL COMMENT '复检人ID',
    created_by INT UNSIGNED NOT NULL COMMENT '创建人ID(督导员)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_report_id (report_id),
    INDEX idx_store_id (store_id),
    INDEX idx_status (status),
    INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='整改单表';

-- 13. 整改照片表
CREATE TABLE IF NOT EXISTS rectification_photos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rectification_id INT UNSIGNED NOT NULL COMMENT '整改单ID',
    photo_url VARCHAR(255) NOT NULL COMMENT '照片URL',
    photo_type ENUM('before', 'after') NOT NULL COMMENT '照片类型: before-整改前, after-整改后',
    description VARCHAR(255) DEFAULT NULL COMMENT '照片描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rectification_id (rectification_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='整改照片表';

-- 14. 月度评分表
CREATE TABLE IF NOT EXISTS monthly_scores (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id INT UNSIGNED NOT NULL COMMENT '门店ID',
    area_id INT UNSIGNED NOT NULL COMMENT '区域ID',
    year INT NOT NULL COMMENT '年份',
    month TINYINT NOT NULL COMMENT '月份',
    inspection_count INT DEFAULT 0 COMMENT '检查次数',
    avg_score DECIMAL(8, 2) DEFAULT 0 COMMENT '平均得分',
    avg_score_rate DECIMAL(5, 2) DEFAULT 0 COMMENT '平均得分率',
    pass_count INT DEFAULT 0 COMMENT '合格次数',
    fail_count INT DEFAULT 0 COMMENT '不合格次数',
    problem_count INT DEFAULT 0 COMMENT '问题总数',
    rectification_count INT DEFAULT 0 COMMENT '整改单数量',
    rank_in_area INT DEFAULT NULL COMMENT '区域内排名',
    rank_city INT DEFAULT NULL COMMENT '城市内排名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_store_month (store_id, year, month),
    INDEX idx_area_month (area_id, year, month),
    INDEX idx_rank_area (area_id, year, month, rank_in_area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='月度评分表';

-- 15. 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL COMMENT '操作人ID',
    user_name VARCHAR(50) NOT NULL COMMENT '操作人姓名',
    module VARCHAR(50) NOT NULL COMMENT '操作模块',
    action VARCHAR(50) NOT NULL COMMENT '操作动作',
    target_id INT UNSIGNED DEFAULT NULL COMMENT '目标ID',
    target_name VARCHAR(255) DEFAULT NULL COMMENT '目标名称',
    ip_address VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    user_agent VARCHAR(500) DEFAULT NULL COMMENT '用户代理',
    details TEXT DEFAULT NULL COMMENT '操作详情(JSON)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_module_action (module, action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- ==================== 初始化数据 ====================

-- 插入检查项分类
INSERT INTO check_categories (name, code, sort_order, description) VALUES
('卫生', 'hygiene', 1, '门店环境卫生检查'),
('食材', 'ingredients', 2, '食材质量与存储检查'),
('出品', 'production', 3, '产品出品质量检查'),
('服务', 'service', 4, '对客服务质量检查'),
('员工形象', 'staff_image', 5, '员工仪容仪表检查');

-- 插入检查项 - 卫生类
INSERT INTO check_items (category_id, name, scoring_criteria, weight, max_score, sort_order, must_pass) VALUES
(1, '门店整体清洁度', '地面无油污、无垃圾；墙面无污渍；玻璃明亮；空气无异味。发现1处不达标扣2分。', 1.2, 10, 1, 0),
(1, '厨房卫生', '灶台、操作台干净；地面无积水、无油污；垃圾桶及时清理且有盖。发现1处不达标扣2分。', 1.5, 10, 2, 1),
(1, '卫生间卫生', '地面干爽、无异味；洗手台干净；卫生纸品充足。发现1处不达标扣1分。', 1.0, 10, 3, 0),
(1, '餐具消毒', '餐具按规定消毒；消毒柜正常使用；消毒记录完整。未按规定消毒此项0分。', 1.5, 10, 4, 1),
(1, '仓储区域卫生', '仓库物品分类摆放、离地离墙；无过期物品；无鼠虫痕迹。发现1处不达标扣2分。', 1.2, 10, 5, 0);

-- 插入检查项 - 食材类
INSERT INTO check_items (category_id, name, scoring_criteria, weight, max_score, sort_order, must_pass) VALUES
(2, '食材保质期', '所有食材在保质期内；无过期、变质食材。发现过期食材此项0分。', 2.0, 10, 1, 1),
(2, '食材存储条件', '冷藏冷冻温度符合要求；食材密封保存；生熟分开。温度不达标扣5分。', 1.8, 10, 2, 1),
(2, '食材溯源', '有完整的进货记录；有供应商资质；食材可溯源。记录不全扣3-5分。', 1.5, 10, 3, 0),
(2, '食材摆放规范', '食材分类摆放；标识清晰；离地离墙。摆放混乱扣2-4分。', 1.0, 10, 4, 0);

-- 插入检查项 - 出品类
INSERT INTO check_items (category_id, name, scoring_criteria, weight, max_score, sort_order, must_pass) VALUES
(3, '产品制作标准', '严格按照SOP制作；分量标准；配料齐全。发现1份不达标扣2分。', 1.8, 10, 1, 0),
(3, '产品外观与口感', '产品外观符合标准；口感正常；温度适宜。发现1份不达标扣2分。', 1.5, 10, 2, 0),
(3, '出餐速度', '正常点餐10分钟内出餐；高峰时段15分钟内。超时扣2-5分。', 1.2, 10, 3, 0),
(3, '包装规范', '包装完整、无破损；打包袋/盒符合标准；标签清晰。发现1份不达标扣1分。', 1.0, 10, 4, 0);

-- 插入检查项 - 服务类
INSERT INTO check_items (category_id, name, scoring_criteria, weight, max_score, sort_order, must_pass) VALUES
(4, '服务用语规范', '使用标准问候语；使用礼貌用语；与顾客有眼神交流。发现1次不达标扣2分。', 1.5, 10, 1, 0),
(4, '服务态度', '主动热情；耐心解答顾客问题；无争吵、无投诉。有投诉此项0分。', 1.8, 10, 2, 1),
(4, '服务效率', '顾客进店30秒内有人接待；点单、结账快速准确。超时扣2分。', 1.2, 10, 3, 0),
(4, '投诉处理', '有完善的投诉处理机制；投诉记录完整；处理及时。无记录扣3分。', 1.0, 10, 4, 0);

-- 插入检查项 - 员工形象类
INSERT INTO check_items (category_id, name, scoring_criteria, weight, max_score, sort_order, must_pass) VALUES
(5, '工作服规范', '统一穿着工作服；干净整洁；无破损、无污渍。发现1人不达标扣2分。', 1.5, 10, 1, 0),
(5, '仪容仪表', '发型整洁；不戴夸张首饰；女员工淡妆上岗。发现1人不达标扣1分。', 1.2, 10, 2, 0),
(5, '个人卫生', '指甲干净、不留长指甲；不涂有色指甲油；上岗前洗手消毒。发现1人不达标扣2分。', 1.5, 10, 3, 1),
(5, '工牌佩戴', '所有员工佩戴工牌；工牌信息清晰。发现1人不达标扣1分。', 1.0, 10, 4, 0);

-- 插入测试区域数据
INSERT INTO areas (name, code, parent_id, level) VALUES
('华东大区', 'east_china', NULL, 1),
('上海市', 'shanghai', 1, 2),
('浦东新区', 'pudong', 2, 3),
('黄浦区', 'huangpu', 2, 3),
('徐汇区', 'xuhui', 2, 3);

-- 插入测试门店数据
INSERT INTO stores (name, code, area_id, address, longitude, latitude, checkin_radius, franchisee_name, franchisee_phone, opening_date) VALUES
('上海浦东陆家嘴店', 'SHPD001', 3, '上海市浦东新区陆家嘴环路1000号', 121.5049, 31.2397, 200, '张三', '13800138001', '2023-01-15'),
('上海浦东张江店', 'SHPD002', 3, '上海市浦东新区张江高科技园区博云路2号', 121.5912, 31.2056, 200, '李四', '13800138002', '2023-03-20'),
('上海黄浦南京东路店', 'SHHP001', 4, '上海市黄浦区南京东路300号', 121.4802, 31.2357, 200, '王五', '13800138003', '2022-11-08'),
('上海徐汇徐家汇店', 'SHXH001', 5, '上海市徐汇区徐家汇路100号', 121.4375, 31.1998, 200, '赵六', '13800138004', '2023-05-12'),
('上海徐汇漕河泾店', 'SHXH002', 5, '上海市徐汇区漕河泾开发区桂平路333号', 121.3987, 31.1765, 200, '钱七', '13800138005', '2023-07-01');

-- 插入测试用户数据 (密码: 123456, 需要bcrypt加密，这里先用明文占位，实际应用中需要加密)
-- 注意：实际应用中密码需要使用bcrypt加密，这里只是演示数据
INSERT INTO users (username, password, real_name, phone, role, area_id) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', '13900139000', 'admin', NULL),
('area_manager1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '王经理', '13900139001', 'area_manager', 2),
('supervisor1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '李督导', '13900139002', 'supervisor', 2),
('supervisor2', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '张督导', '13900139003', 'supervisor', 2),
('manager1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '店长A', '13900139004', 'store_manager', NULL),
('manager2', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '店长B', '13900139005', 'store_manager', NULL);

-- 更新门店店长ID
UPDATE stores SET manager_id = 5 WHERE id = 1;
UPDATE stores SET manager_id = 6 WHERE id = 2;

-- 更新区域经理ID
UPDATE areas SET manager_id = 2 WHERE id = 2;
