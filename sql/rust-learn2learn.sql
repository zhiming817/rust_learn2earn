/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50728 (5.7.28)
 Source Host           : localhost:3306
 Source Schema         : rust-learn2learn

 Target Server Type    : MySQL
 Target Server Version : 50728 (5.7.28)
 File Encoding         : 65001

 Date: 17/08/2025 13:12:20
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_permission
-- ----------------------------
DROP TABLE IF EXISTS `sys_permission`;
CREATE TABLE `sys_permission` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL,
  `name` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of sys_permission
-- ----------------------------
BEGIN;
INSERT INTO `sys_permission` (`id`, `code`, `name`) VALUES (1, 'admin:access', 'Admin Access');
INSERT INTO `sys_permission` (`id`, `code`, `name`) VALUES (2, 'task:create', 'Create Task');
INSERT INTO `sys_permission` (`id`, `code`, `name`) VALUES (3, 'task:update', 'Update Task');
INSERT INTO `sys_permission` (`id`, `code`, `name`) VALUES (4, 'task:delete', 'Delete Task');
INSERT INTO `sys_permission` (`id`, `code`, `name`) VALUES (5, 'submission:review', 'Review Submission');
COMMIT;

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL,
  `name` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of sys_role
-- ----------------------------
BEGIN;
INSERT INTO `sys_role` (`id`, `code`, `name`) VALUES (1, 'admin', 'Administrator');
INSERT INTO `sys_role` (`id`, `code`, `name`) VALUES (2, 'user', 'User');
COMMIT;

-- ----------------------------
-- Table structure for sys_role_permission
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_permission`;
CREATE TABLE `sys_role_permission` (
  `role_id` bigint(20) NOT NULL,
  `permission_id` bigint(20) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `sys_role_permission_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sys_role_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `sys_permission` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of sys_role_permission
-- ----------------------------
BEGIN;
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES (1, 1);
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES (1, 2);
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES (1, 3);
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES (1, 4);
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES (1, 5);
COMMIT;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `salt` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
BEGIN;
INSERT INTO `sys_user` (`id`, `username`, `password_hash`, `status`, `created_at`, `updated_at`, `salt`) VALUES (1, 'admin', '$2b$12$WG/Wse8/wSOBnzTTdfjp9.dKQPqfcLHdvEUMcBXKtA8upSPvyMPGy', 1, '2025-08-14 15:32:36', '2025-08-17 00:32:43', 'Ae4HWPHbl2ofbZtI');
COMMIT;

-- ----------------------------
-- Table structure for sys_user_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role` (
  `user_id` bigint(20) NOT NULL,
  `role_id` bigint(20) NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `sys_user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sys_user_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of sys_user_role
-- ----------------------------
BEGIN;
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES (1, 1);
COMMIT;

-- ----------------------------
-- Table structure for task
-- ----------------------------
DROP TABLE IF EXISTS `task`;
CREATE TABLE `task` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` varchar(32) NOT NULL,
  `name` varchar(128) NOT NULL,
  `reward_cny` int(11) NOT NULL DEFAULT '0',
  `reward_token` varchar(64) NOT NULL DEFAULT '',
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of task
-- ----------------------------
BEGIN;
INSERT INTO `task` (`id`, `code`, `name`, `reward_cny`, `reward_token`, `description`, `created_at`, `updated_at`) VALUES (1, 'task_1', 'hello move', 10, '', '完成第一个合约部署上链', '2025-08-14 15:32:36', '2025-08-14 15:32:36');
INSERT INTO `task` (`id`, `code`, `name`, `reward_cny`, `reward_token`, `description`, `created_at`, `updated_at`) VALUES (2, 'task_2', 'move coin', 10, '', '完成Coin协议学习，并发布两个Coin上链', '2025-08-14 15:32:36', '2025-08-14 15:32:36');
INSERT INTO `task` (`id`, `code`, `name`, `reward_cny`, `reward_token`, `description`, `created_at`, `updated_at`) VALUES (3, 'task_3', 'move nft', 10, '', '完成NFT的学习，并发布NFT上链', '2025-08-14 15:32:36', '2025-08-14 15:32:36');
INSERT INTO `task` (`id`, `code`, `name`, `reward_cny`, `reward_token`, `description`, `created_at`, `updated_at`) VALUES (4, 'task_4', 'move game', 10, '', '完成链上游戏学习，并上链交互', '2025-08-14 15:32:36', '2025-08-14 15:32:36');
INSERT INTO `task` (`id`, `code`, `name`, `reward_cny`, `reward_token`, `description`, `created_at`, `updated_at`) VALUES (5, 'task_5', 'move swap', 10, '', '完成Swap学习，并上链交互', '2025-08-14 15:32:36', '2025-08-14 15:32:36');
INSERT INTO `task` (`id`, `code`, `name`, `reward_cny`, `reward_token`, `description`, `created_at`, `updated_at`) VALUES (6, 'task_6', 'sdk ptb', 10, 'NAVX', '完成SDK学习，并用SDK完成链上交互', '2025-08-14 15:32:36', '2025-08-14 15:32:36');
INSERT INTO `task` (`id`, `code`, `name`, `reward_cny`, `reward_token`, `description`, `created_at`, `updated_at`) VALUES (7, 'task_7', 'move ctf check in', 10, '', '完成move ctf check in', '2025-08-14 15:32:36', '2025-08-14 15:32:36');
INSERT INTO `task` (`id`, `code`, `name`, `reward_cny`, `reward_token`, `description`, `created_at`, `updated_at`) VALUES (8, 'task_8', 'move ctf pow', 10, '', '完成move ctf pow', '2025-08-14 15:32:36', '2025-08-14 15:32:36');
COMMIT;

-- ----------------------------
-- Table structure for task_submission
-- ----------------------------
DROP TABLE IF EXISTS `task_submission`;
CREATE TABLE `task_submission` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `pr_url` varchar(512) NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `note` varchar(512) NOT NULL DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `task_submission_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `task` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_submission_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of task_submission
-- ----------------------------
BEGIN;
INSERT INTO `task_submission` (`id`, `task_id`, `user_id`, `pr_url`, `status`, `note`, `created_at`, `updated_at`) VALUES (1, 8, 1, '222.jpg', 'approved', '重复提交', '2025-08-15 22:46:58', '2025-08-15 23:58:38');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
