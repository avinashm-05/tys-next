-- CreateTable
CREATE TABLE `posts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `authorName` VARCHAR(255) NOT NULL DEFAULT 'Avinash',
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `publishedAt` TIMESTAMP(0) NULL,
    `hero_image_key` VARCHAR(255) NULL,
    `hero_image_content_type` VARCHAR(100) NULL,
    `hero_image_size_bytes` INTEGER NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `posts_slug_unique`(`slug`),
    INDEX `posts_status_index`(`status`),
    INDEX `posts_published_at_index`(`publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
