-- CreateTable
CREATE TABLE `callback_requests` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `country_code` VARCHAR(10) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `time_slot` ENUM('morning', 'afternoon', 'evening') NOT NULL,
    `package_type` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `callback_requests_created_at_index`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
