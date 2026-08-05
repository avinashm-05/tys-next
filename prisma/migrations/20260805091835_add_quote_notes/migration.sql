-- CreateTable
CREATE TABLE `quote_notes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `quote_id` BIGINT UNSIGNED NOT NULL,
    `comment` TEXT NOT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `quote_notes_quote_id_index`(`quote_id`),
    INDEX `quote_notes_created_at_index`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `quote_notes` ADD CONSTRAINT `quote_notes_quote_id_foreign` FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `quote_notes` ADD CONSTRAINT `quote_notes_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
