-- ==============================================================================
-- FitManage SaaS - Hostinger MySQL Database Schema
-- Ready for phpMyAdmin / Hostinger MySQL Databases / Cloud MySQL
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Gyms (Tenants)
CREATE TABLE IF NOT EXISTS `gyms` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `owner_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `address` TEXT,
  `plan_tier` ENUM('starter', 'growth', 'pro') DEFAULT 'pro',
  `status` ENUM('active', 'suspended', 'trial') DEFAULT 'active',
  `settings_json` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users & Roles
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `gym_id` VARCHAR(64) NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `role` ENUM('super_admin', 'gym_owner', 'staff', 'trainer', 'member') NOT NULL DEFAULT 'gym_owner',
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `avatar_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_gym` (`gym_id`),
  CONSTRAINT `fk_users_gym` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Membership Plans
CREATE TABLE IF NOT EXISTS `membership_plans` (
  `id` VARCHAR(64) PRIMARY KEY,
  `gym_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `duration_months` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10, 2) NOT NULL,
  `admission_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `description` TEXT,
  `popular` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `features_json` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_plans_gym` (`gym_id`),
  CONSTRAINT `fk_plans_gym` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Trainers
CREATE TABLE IF NOT EXISTS `trainers` (
  `id` VARCHAR(64) PRIMARY KEY,
  `gym_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255),
  `specialization` VARCHAR(255),
  `experience_years` INT DEFAULT 1,
  `shift` ENUM('morning', 'evening', 'full_day') DEFAULT 'morning',
  `rating` DECIMAL(2, 1) DEFAULT 5.0,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `photo_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_trainers_gym` (`gym_id`),
  CONSTRAINT `fk_trainers_gym` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Members
CREATE TABLE IF NOT EXISTS `members` (
  `id` VARCHAR(64) PRIMARY KEY,
  `gym_id` VARCHAR(64) NOT NULL,
  `member_code` VARCHAR(50) NOT NULL,
  `qr_token` VARCHAR(100) UNIQUE,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255),
  `whatsapp_number` VARCHAR(50),
  `gender` ENUM('male', 'female', 'other') DEFAULT 'male',
  `date_of_birth` DATE,
  `address` TEXT,
  `emergency_name` VARCHAR(150),
  `emergency_phone` VARCHAR(50),
  `current_plan_id` VARCHAR(64),
  `current_plan_name` VARCHAR(255),
  `start_date` DATE NOT NULL,
  `expiry_date` DATE NOT NULL,
  `plan_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `discount` DECIMAL(10, 2) DEFAULT 0.00,
  `final_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `total_paid` DECIMAL(10, 2) DEFAULT 0.00,
  `balance_due` DECIMAL(10, 2) DEFAULT 0.00,
  `assigned_trainer_id` VARCHAR(64),
  `assigned_trainer_name` VARCHAR(255),
  `status` ENUM('active', 'expiring_soon', 'expired', 'paused', 'cancelled') DEFAULT 'active',
  `total_visits` INT DEFAULT 0,
  `last_visit_date` DATE,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_members_gym` (`gym_id`),
  INDEX `idx_members_status` (`status`),
  INDEX `idx_members_code` (`member_code`),
  CONSTRAINT `fk_members_gym` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(64) PRIMARY KEY,
  `gym_id` VARCHAR(64) NOT NULL,
  `receipt_number` VARCHAR(100) NOT NULL,
  `member_id` VARCHAR(64) NOT NULL,
  `member_name` VARCHAR(255) NOT NULL,
  `member_code` VARCHAR(50) NOT NULL,
  `plan_id` VARCHAR(64),
  `plan_name` VARCHAR(255),
  `amount` DECIMAL(10, 2) NOT NULL,
  `payment_method` ENUM('cash', 'upi', 'card', 'bank_transfer', 'other') DEFAULT 'cash',
  `payment_date` DATE NOT NULL,
  `reference_number` VARCHAR(100),
  `balance_remaining` DECIMAL(10, 2) DEFAULT 0.00,
  `collected_by_name` VARCHAR(255) DEFAULT 'Staff',
  `notes` TEXT,
  `status` ENUM('completed', 'refunded', 'failed') DEFAULT 'completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_payments_gym` (`gym_id`),
  INDEX `idx_payments_member` (`member_id`),
  CONSTRAINT `fk_payments_gym` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Attendance
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` VARCHAR(64) PRIMARY KEY,
  `gym_id` VARCHAR(64) NOT NULL,
  `member_id` VARCHAR(64) NOT NULL,
  `member_name` VARCHAR(255) NOT NULL,
  `member_code` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `time` VARCHAR(20) NOT NULL,
  `method` ENUM('qr_code', 'manual', 'barcode', 'kiosk') DEFAULT 'manual',
  `staff_name` VARCHAR(255) DEFAULT 'System',
  `status` ENUM('present', 'absent', 'late') DEFAULT 'present',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_attendance_gym_date` (`gym_id`, `date`),
  INDEX `idx_attendance_member` (`member_id`),
  CONSTRAINT `fk_attendance_gym` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Progress & Body Measurements
CREATE TABLE IF NOT EXISTS `progress_records` (
  `id` VARCHAR(64) PRIMARY KEY,
  `gym_id` VARCHAR(64) NOT NULL,
  `member_id` VARCHAR(64) NOT NULL,
  `date` DATE NOT NULL,
  `weight_kg` DECIMAL(5, 2) NOT NULL,
  `height_cm` DECIMAL(5, 2),
  `chest_inches` DECIMAL(5, 2),
  `waist_inches` DECIMAL(5, 2),
  `hips_inches` DECIMAL(5, 2),
  `biceps_inches` DECIMAL(5, 2),
  `body_fat_percent` DECIMAL(4, 1),
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_progress_member` (`member_id`),
  CONSTRAINT `fk_progress_gym` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Workout Plans
CREATE TABLE IF NOT EXISTS `workout_plans` (
  `id` VARCHAR(64) PRIMARY KEY,
  `gym_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `goal` VARCHAR(100) DEFAULT 'general_fitness',
  `level` ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
  `days_per_week` INT DEFAULT 5,
  `duration_weeks` INT DEFAULT 8,
  `description` TEXT,
  `schedule_json` JSON,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_workouts_gym` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Diet Plans
CREATE TABLE IF NOT EXISTS `diet_plans` (
  `id` VARCHAR(64) PRIMARY KEY,
  `gym_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `goal` VARCHAR(100) DEFAULT 'muscle_gain',
  `daily_calories` INT DEFAULT 2400,
  `description` TEXT,
  `meals_json` JSON,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_diets_gym` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Audit Logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(64) PRIMARY KEY,
  `gym_id` VARCHAR(64),
  `user_id` VARCHAR(64),
  `user_name` VARCHAR(255),
  `user_role` VARCHAR(50),
  `action` VARCHAR(100) NOT NULL,
  `entity` VARCHAR(100) NOT NULL,
  `entity_id` VARCHAR(64),
  `details` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_gym` (`gym_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(64) PRIMARY KEY,
  `gym_id` VARCHAR(64),
  `user_id` VARCHAR(64),
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `entity_id` VARCHAR(64),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notif_gym` (`gym_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- SEED DATA (Ready to Run on Hostinger MySQL)
-- ==============================================================================
INSERT IGNORE INTO `gyms` (`id`, `name`, `slug`, `owner_name`, `email`, `phone`, `address`, `plan_tier`, `status`, `settings_json`)
VALUES (
  'gym_powerfit',
  'PowerFit Arena',
  'powerfit-arena',
  'Vikram Sharma',
  'vikram@powerfit.com',
  '+91 98765 43210',
  'Plot 42, Cyber Hub Rd, Sector 29, Gurugram, HR',
  'pro',
  'active',
  '{"currency": "INR", "currencySymbol": "₹", "timezone": "Asia/Kolkata", "receiptPrefix": "REC", "memberIdPrefix": "FIT", "duplicateAttendanceMinutes": 45, "enableQrAttendance": true}'
);

INSERT IGNORE INTO `users` (`id`, `gym_id`, `name`, `email`, `password_hash`, `phone`, `role`, `status`)
VALUES 
  ('usr_admin', NULL, 'Master SuperAdmin', 'admin@fitmanage.com', '$2b$10$YourHashedPassHere', '+91 99999 00000', 'super_admin', 'active'),
  ('usr_owner', 'gym_powerfit', 'Vikram Sharma', 'vikram@powerfit.com', '$2b$10$YourHashedPassHere', '+91 98765 43210', 'gym_owner', 'active'),
  ('usr_staff', 'gym_powerfit', 'Pooja Verma', 'pooja@powerfit.com', '$2b$10$YourHashedPassHere', '+91 98111 22233', 'staff', 'active');

INSERT IGNORE INTO `membership_plans` (`id`, `gym_id`, `name`, `duration_months`, `price`, `admission_fee`, `popular`, `features_json`)
VALUES
  ('plan_monthly', 'gym_powerfit', 'Monthly Strength Access', 1, 1999.00, 500.00, FALSE, '["Full Gym Floor", "Locker Room", "Cardio Zone"]'),
  ('plan_quarterly', 'gym_powerfit', 'Quarterly Transformation', 3, 4999.00, 0.00, TRUE, '["Full Gym Floor", "Steam & Sauna", "1 PT Assessment", "Diet Chart"]'),
  ('plan_annual', 'gym_powerfit', 'Annual Elite VIP', 12, 14999.00, 0.00, FALSE, '["Unlimited 24/7 Access", "All Group Classes", "Sauna & Steam", "Free Locker", "Quarterly DEXA Scan"]');

INSERT IGNORE INTO `trainers` (`id`, `gym_id`, `name`, `phone`, `email`, `specialization`, `experience_years`, `shift`, `rating`)
VALUES
  ('trn_arjun', 'gym_powerfit', 'Arjun Kapoor', '+91 98222 33445', 'arjun@powerfit.com', 'CrossFit & Hypertrophy', 6, 'morning', 4.9),
  ('trn_sneha', 'gym_powerfit', 'Sneha Patel', '+91 98333 44556', 'sneha@powerfit.com', 'Yoga & Core Mobility', 4, 'evening', 4.8);

INSERT IGNORE INTO `members` (`id`, `gym_id`, `member_code`, `qr_token`, `first_name`, `last_name`, `phone`, `email`, `gender`, `start_date`, `expiry_date`, `plan_fee`, `final_amount`, `total_paid`, `balance_due`, `status`, `total_visits`)
VALUES
  ('mem_rahul', 'gym_powerfit', 'FIT-0001', 'FIT_0001_QR_TOKEN', 'Rahul', 'Mehta', '+91 98765 11111', 'rahul.mehta@gmail.com', 'male', CURDATE() - INTERVAL 20 DAY, CURDATE() + INTERVAL 70 DAY, 4999.00, 4999.00, 4999.00, 0.00, 'active', 14),
  ('mem_ananya', 'gym_powerfit', 'FIT-0002', 'FIT_0002_QR_TOKEN', 'Ananya', 'Iyer', '+91 98765 22222', 'ananya.iyer@gmail.com', 'female', CURDATE() - INTERVAL 85 DAY, CURDATE() + INTERVAL 5 DAY, 4999.00, 4999.00, 4999.00, 0.00, 'expiring_soon', 32),
  ('mem_rohit', 'gym_powerfit', 'FIT-0003', 'FIT_0003_QR_TOKEN', 'Rohit', 'Chopra', '+91 98765 33333', 'rohit.c@gmail.com', 'male', CURDATE() - INTERVAL 40 DAY, CURDATE() - INTERVAL 10 DAY, 1999.00, 1999.00, 1999.00, 0.00, 'expired', 18),
  ('mem_priya', 'gym_powerfit', 'FIT-0004', 'FIT_0004_QR_TOKEN', 'Priya', 'Nair', '+91 98765 44444', 'priya.nair@gmail.com', 'female', CURDATE() - INTERVAL 10 DAY, CURDATE() + INTERVAL 355 DAY, 14999.00, 14999.00, 10000.00, 4999.00, 'active', 8);

INSERT IGNORE INTO `payments` (`id`, `gym_id`, `receipt_number`, `member_id`, `member_name`, `member_code`, `amount`, `payment_method`, `payment_date`, `balance_remaining`, `collected_by_name`)
VALUES
  ('pay_001', 'gym_powerfit', 'REC-2026-000001', 'mem_rahul', 'Rahul Mehta', 'FIT-0001', 4999.00, 'upi', CURDATE() - INTERVAL 20 DAY, 0.00, 'Pooja Verma'),
  ('pay_002', 'gym_powerfit', 'REC-2026-000002', 'mem_priya', 'Priya Nair', 'FIT-0004', 10000.00, 'card', CURDATE() - INTERVAL 10 DAY, 4999.00, 'Vikram Sharma');

INSERT IGNORE INTO `attendance` (`id`, `gym_id`, `member_id`, `member_name`, `member_code`, `date`, `time`, `method`, `staff_name`)
VALUES
  ('att_001', 'gym_powerfit', 'mem_rahul', 'Rahul Mehta', 'FIT-0001', CURDATE(), '07:15 AM', 'qr_code', 'Reception Scanner'),
  ('att_002', 'gym_powerfit', 'mem_priya', 'Priya Nair', 'FIT-0004', CURDATE(), '08:30 AM', 'manual', 'Pooja Verma');
