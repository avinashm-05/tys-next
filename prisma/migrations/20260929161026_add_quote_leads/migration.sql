-- CreateTable
CREATE TABLE `quote_leads` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `country_code` VARCHAR(10) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `from_country` VARCHAR(50) NULL,
    `to_country` VARCHAR(50) NULL,
    `quote_id` BIGINT UNSIGNED NULL,
    `converted_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `quote_leads_token_unique`(`token`),
    INDEX `quote_leads_created_at_index`(`created_at`),
    INDEX `quote_leads_email_index`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
