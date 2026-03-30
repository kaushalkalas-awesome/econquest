-- EconQuest MySQL schema (run once)
CREATE DATABASE IF NOT EXISTS econquest;
USE econquest;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar VARCHAR(50) DEFAULT 'avatar1',
  title VARCHAR(100) DEFAULT 'Economics Novice',
  level INT DEFAULT 1,
  current_xp INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  coins INT DEFAULT 100,
  gems INT DEFAULT 5,
  streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE NULL,
  lives INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE quests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('MICROECONOMICS','MACROECONOMICS','PERSONAL_FINANCE','BEHAVIORAL_ECONOMICS') NOT NULL,
  difficulty ENUM('BEGINNER','INTERMEDIATE','ADVANCED') NOT NULL,
  order_index INT NOT NULL,
  xp_reward INT DEFAULT 100,
  coin_reward INT DEFAULT 25,
  icon_emoji VARCHAR(10) DEFAULT '📚',
  prerequisite_id INT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prerequisite_id) REFERENCES quests(id)
);

CREATE TABLE lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quest_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  key_terms JSON,
  fun_fact TEXT NULL,
  real_world_example TEXT NULL,
  order_index INT NOT NULL,
  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE
);

CREATE TABLE challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quest_id INT NOT NULL,
  type ENUM('MULTIPLE_CHOICE','TRUE_FALSE','FILL_BLANK','SCENARIO') NOT NULL,
  question TEXT NOT NULL,
  options JSON NULL,
  correct_answer VARCHAR(500) NOT NULL,
  explanation TEXT NOT NULL,
  hint TEXT NULL,
  difficulty ENUM('BEGINNER','INTERMEDIATE','ADVANCED') NOT NULL,
  time_limit INT DEFAULT 30,
  xp_reward INT DEFAULT 10,
  order_index INT NOT NULL,
  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE
);

CREATE TABLE quest_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quest_id INT NOT NULL,
  status ENUM('LOCKED','AVAILABLE','IN_PROGRESS','COMPLETED') DEFAULT 'LOCKED',
  lessons_completed INT DEFAULT 0,
  challenges_completed INT DEFAULT 0,
  best_score INT DEFAULT 0,
  stars INT DEFAULT 0,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_quest (user_id, quest_id)
);

CREATE TABLE challenge_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  challenge_id INT NOT NULL,
  user_answer VARCHAR(500) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

CREATE TABLE achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  icon VARCHAR(10) DEFAULT '🏆',
  category ENUM('LEARNING','STREAK','MASTERY','COLLECTION') NOT NULL,
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INT NOT NULL,
  xp_reward INT DEFAULT 50,
  coin_reward INT DEFAULT 25,
  rarity ENUM('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY') NOT NULL
);

CREATE TABLE user_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

CREATE TABLE shop_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  type ENUM('AVATAR','TITLE','POWER_UP') NOT NULL,
  price INT NOT NULL,
  currency ENUM('COINS','GEMS') DEFAULT 'COINS',
  icon VARCHAR(10) DEFAULT '🛍️',
  data JSON NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  shop_item_id INT NOT NULL,
  is_equipped BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shop_item_id) REFERENCES shop_items(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_item (user_id, shop_item_id)
);

CREATE TABLE daily_challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  challenge_date DATE NOT NULL,
  question TEXT NOT NULL,
  options JSON NOT NULL,
  correct_answer VARCHAR(500) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, challenge_date)
);
