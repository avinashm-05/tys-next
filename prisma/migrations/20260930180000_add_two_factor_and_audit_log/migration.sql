-- AlterTable
ALTER TABLE `users` ADD COLUMN `two_factor_enabled` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `two_factors` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `secret` VARCHAR(255) NOT NULL,
    `backup_codes` TEXT NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT true,
    `failed_verification_count` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,

    INDEX `two_factors_user_id_index`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `action` VARCHAR(100) NOT NULL,
    `method` VARCHAR(10) NULL,
    `path` VARCHAR(255) NULL,
    `status_code` SMALLINT UNSIGNED NULL,
    `ip` VARCHAR(45) NULL,
    `detail` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `admin_audit_logs_created_at_index`(`created_at`),
    INDEX `admin_audit_logs_user_id_index`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `two_factors` ADD CONSTRAINT `two_factors_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `admin_audit_logs` ADD CONSTRAINT `admin_audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

