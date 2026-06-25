-- 食光小程序 MySQL 数据库

CREATE DATABASE IF NOT EXISTS shiguang DEFAULT CHARSET utf8mb4;
USE shiguang;

SET NAMES utf8mb4;

-- 先删旧表（防止导入残留）
DROP TABLE IF EXISTS order_chat, orders, restaurant_menu, restaurant_members, feeds, favorites, cooking_records, recipes, categories, restaurants, users;

-- ===== 用户表 =====
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(64) UNIQUE NOT NULL COMMENT '微信openid',
  nickname VARCHAR(32) DEFAULT '美食家',
  avatar VARCHAR(500) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===== 分类表 =====
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(10) NOT NULL COMMENT '分类名(≤4字)',
  is_system TINYINT DEFAULT 0 COMMENT '0自定义 1系统预设',
  sort INT DEFAULT 0,
  color VARCHAR(10) DEFAULT '#ff8baa',
  user_id INT COMMENT 'NULL=全局分类',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 预设分类
INSERT INTO categories (name, is_system, sort, color) VALUES
('荤菜',1,0,'#ff8baa'),('素菜',1,1,'#79bcff'),('凉菜',1,2,'#d18bff'),
('汤羹',1,3,'#ffb37c'),('主食',1,4,'#6de192'),('甜点',1,5,'#6de192'),('酒水',1,6,'#d18bff');

-- ===== 菜谱表 =====
CREATE TABLE recipes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  category_id INT,
  color VARCHAR(10) DEFAULT '#ff8baa',
  price DECIMAL(8,2) DEFAULT 0,
  ingredients JSON COMMENT '[{"name":"鸡胸肉","amount":"300g","cat":"肉类"}]',
  steps JSON COMMENT '[{"text":"切丁","img":""}]',
  reference TEXT,
  tags JSON COMMENT '首页筛选标签，如["午餐","肉类"]',
  cover_img VARCHAR(500),
  cover_emoji VARCHAR(10) DEFAULT ':)',
  is_public TINYINT DEFAULT 0 COMMENT '0=DIY私有 1=公共菜谱',
  is_draft TINYINT DEFAULT 0,
  user_id INT COMMENT 'NULL=公共菜谱',
  copied_from INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 公共菜谱种子数据
INSERT INTO recipes (name, category_id, color, price, is_public, tags, ingredients, steps, cover_emoji) VALUES
('宫保鸡丁',1,'#ff8baa',38,1,'["午餐","晚餐","肉类"]',
 '[{"name":"鸡胸肉","amount":"300g","cat":"肉类"},{"name":"花生米","amount":"50g","cat":"豆制品"},{"name":"干辣椒","amount":"10个","cat":"调味料"}]',
 '[{"text":"鸡胸肉切丁腌制15分钟"},{"text":"花生米小火炒至金黄"},{"text":"热油爆香干辣椒和花椒"},{"text":"下鸡丁大火翻炒至变色"},{"text":"加入酱汁翻炒均匀，加花生米出锅"}]',
 '[鸡]'),
('麻婆豆腐',2,'#79bcff',22,1,'["午餐","晚餐","蔬菜"]',
 '[{"name":"嫩豆腐","amount":"1块","cat":"豆制品"},{"name":"猪肉末","amount":"100g","cat":"肉类"},{"name":"豆瓣酱","amount":"2勺","cat":"调味料"}]',
 '[{"text":"豆腐切小块焯水去腥"},{"text":"热油炒香肉末和豆瓣酱"},{"text":"加适量水，放入豆腐小火炖煮5分钟"},{"text":"勾芡收汁，撒花椒粉和葱花"}]',
 '[豆]'),
('清蒸鲈鱼',1,'#ff8baa',58,1,'["午餐","晚餐","海鲜"]',
 '[{"name":"鲈鱼","amount":"1条约500g","cat":"水产"},{"name":"姜片","amount":"适量","cat":"调味料"},{"name":"葱丝","amount":"适量","cat":"蔬菜"}]',
 '[{"text":"鲈鱼处理干净，两面各划三刀"},{"text":"鱼身抹少许盐和料酒，铺上姜片"},{"text":"大火蒸8-10分钟"},{"text":"倒掉汤汁，铺葱丝，淋热油和蒸鱼豉油"}]',
 '[鱼]'),
('番茄鸡蛋汤',4,'#ffb37c',15,1,'["午餐","晚餐","汤类"]',
 '[{"name":"番茄","amount":"2个","cat":"蔬菜"},{"name":"鸡蛋","amount":"2个","cat":"肉类"},{"name":"葱花","amount":"少许","cat":"调味料"}]',
 '[{"text":"番茄切块，鸡蛋打散备用"},{"text":"锅中热油炒番茄出汁"},{"text":"加水煮沸，淋入蛋液搅拌"},{"text":"加盐调味，撒葱花出锅"}]',
 '[茄]'),
('蛋炒饭',5,'#6de192',18,1,'["早餐","午餐","晚餐","面食"]',
 '[{"name":"隔夜米饭","amount":"2碗","cat":"主食"},{"name":"鸡蛋","amount":"2个","cat":"肉类"},{"name":"火腿肠","amount":"1根","cat":"肉类"}]',
 '[{"text":"鸡蛋打散，火腿肠切丁"},{"text":"热锅多油，炒散鸡蛋盛出"},{"text":"炒香火腿丁，加入米饭炒散"},{"text":"加入鸡蛋翻炒，调味撒葱花"}]',
 '[饭]'),
('红烧排骨',1,'#ff8baa',48,1,'["午餐","晚餐","肉类"]',
 '[{"name":"猪小排","amount":"500g","cat":"肉类"},{"name":"冰糖","amount":"30g","cat":"调味料"},{"name":"生抽老抽","amount":"各1勺","cat":"调味料"}]',
 '[{"text":"排骨冷水下锅焯水去血沫"},{"text":"小火炒冰糖至焦糖色"},{"text":"下排骨翻炒上色"},{"text":"加生抽老抽和热水，小火炖40分钟"},{"text":"大火收汁至浓稠"}]',
 '[骨]'),
('蒜蓉西蓝花',2,'#79bcff',16,1,'["午餐","晚餐","蔬菜"]',
 '[{"name":"西蓝花","amount":"1颗","cat":"蔬菜"},{"name":"蒜","amount":"5瓣","cat":"调味料"}]',
 '[{"text":"西蓝花掰小朵焯水"},{"text":"蒜剁成蒜蓉"},{"text":"热油爆香蒜蓉，加西蓝花翻炒"},{"text":"加蚝油调味出锅"}]',
 '[菜]'),
('芒果慕斯',6,'#6de192',35,1,'["甜点","小吃"]',
 '[{"name":"芒果","amount":"2个","cat":"水果"},{"name":"淡奶油","amount":"200ml","cat":"其他辅料"},{"name":"吉利丁片","amount":"10g","cat":"其他辅料"}]',
 '[{"text":"芒果打成泥，吉利丁片泡软"},{"text":"淡奶油打发至6成"},{"text":"芒果泥加热融化吉利丁，晾凉"},{"text":"混合淡奶油和芒果泥，冷藏4小时"}]',
 '[芒]');

-- ===== 餐厅表 =====
CREATE TABLE restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  invite_code VARCHAR(10) NOT NULL,
  code_expire BIGINT DEFAULT 0,
  owner_id INT NOT NULL,
  avatar VARCHAR(500) DEFAULT '',
  avg_rating DECIMAL(2,1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- ===== 餐厅菜单(上架菜品) =====
CREATE TABLE restaurant_menu (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  recipe_id INT NOT NULL,
  on_shelf TINYINT DEFAULT 1 COMMENT '1上架 0下架',
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

-- ===== 餐厅成员(食客) =====
CREATE TABLE restaurant_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ===== 订单表 =====
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  customer_id INT NOT NULL,
  items JSON COMMENT '[{"recipeId":1,"name":"宫保鸡丁","price":38,"emoji":"🍗"}]',
  status ENUM('pending','cooking','done','rejected') DEFAULT 'pending',
  urge_count INT DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT NULL,
  review TEXT,
  review_featured TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- ===== 订单交流记录 =====
CREATE TABLE order_chat (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  msg TEXT NOT NULL,
  sender ENUM('owner','customer') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ===== 感受分享 =====
CREATE TABLE feeds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  content TEXT,
  images JSON,
  restaurant_name VARCHAR(50),
  poster_role ENUM('owner','customer'),
  visibility ENUM('all','restaurant','self') DEFAULT 'all',
  show_location TINYINT DEFAULT 1,
  is_location_public TINYINT DEFAULT 1,
  location VARCHAR(200),
  loc_precision ENUM('exact','fuzzy') DEFAULT 'exact',
  custom_location VARCHAR(50),
  is_time_public TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ===== 收藏表 =====
CREATE TABLE favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

-- ===== 做菜记录 =====
CREATE TABLE cooking_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  recipe_id INT,
  recipe_name VARCHAR(50),
  cooked_at DATE,
  img VARCHAR(500),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
