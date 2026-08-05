-- AlterTable
ALTER TABLE `users` ADD COLUMN `address_line_1` VARCHAR(255) NULL,
    ADD COLUMN `address_line_2` VARCHAR(255) NULL,
    ADD COLUMN `address_line_3` VARCHAR(255) NULL,
    ADD COLUMN `city` VARCHAR(100) NULL,
    ADD COLUMN `company_name` VARCHAR(255) NULL,
    ADD COLUMN `country` VARCHAR(100) NULL,
    ADD COLUMN `postal_code` VARCHAR(20) NULL,
    ADD COLUMN `state` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `shipments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `linked_quote_id` BIGINT UNSIGNED NULL,
    `tracking_number` VARCHAR(30) NULL,
    `shipment_type` ENUM('air', 'ground', 'ocean') NOT NULL,
    `from_country` VARCHAR(100) NOT NULL,
    `to_country` VARCHAR(100) NOT NULL,
    `status` ENUM('new_request', 'ready_for_pickup', 'in_transit', 'delivered', 'on_hold', 'cancelled') NOT NULL DEFAULT 'new_request',
    `pickup_provider` VARCHAR(100) NULL,
    `pickup_date` DATE NULL,
    `pickup_start_time` VARCHAR(10) NULL,
    `pickup_end_time` VARCHAR(10) NULL,
    `special_instruction` TEXT NULL,
    `sender_contact_name` VARCHAR(255) NOT NULL,
    `sender_company_name` VARCHAR(255) NULL,
    `sender_address_line_1` VARCHAR(255) NOT NULL,
    `sender_address_line_2` VARCHAR(255) NULL,
    `sender_address_line_3` VARCHAR(255) NULL,
    `sender_city` VARCHAR(100) NOT NULL,
    `sender_state` VARCHAR(100) NOT NULL,
    `sender_country` VARCHAR(100) NOT NULL,
    `sender_postal_code` VARCHAR(20) NOT NULL,
    `sender_phone_1` VARCHAR(30) NOT NULL,
    `sender_phone_2` VARCHAR(30) NULL,
    `sender_email` VARCHAR(255) NULL,
    `recipient_contact_name` VARCHAR(255) NOT NULL,
    `recipient_company_name` VARCHAR(255) NULL,
    `recipient_address_line_1` VARCHAR(255) NOT NULL,
    `recipient_address_line_2` VARCHAR(255) NULL,
    `recipient_address_line_3` VARCHAR(255) NULL,
    `recipient_city` VARCHAR(100) NOT NULL,
    `recipient_state` VARCHAR(100) NOT NULL,
    `recipient_country` VARCHAR(100) NOT NULL,
    `recipient_postal_code` VARCHAR(20) NOT NULL,
    `recipient_phone_1` VARCHAR(30) NOT NULL,
    `recipient_phone_2` VARCHAR(30) NULL,
    `recipient_email` VARCHAR(255) NULL,
    `recipient_location_type` ENUM('residential', 'commercial') NOT NULL DEFAULT 'residential',
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `shipments_tracking_number_unique`(`tracking_number`),
    INDEX `shipments_user_id_index`(`user_id`),
    INDEX `shipments_status_index`(`status`),
    INDEX `shipments_linked_quote_id_index`(`linked_quote_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_package_lines` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shipment_id` BIGINT UNSIGNED NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `weight` DECIMAL(10, 2) NULL,
    `weight_unit` ENUM('lb', 'kg') NULL,
    `length` DECIMAL(10, 2) NULL,
    `width` DECIMAL(10, 2) NULL,
    `height` DECIMAL(10, 2) NULL,
    `chargeable_weight` DECIMAL(10, 2) NULL,
    `insured_value` DECIMAL(10, 2) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `shipment_package_lines_shipment_id_index`(`shipment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_linked_quote_id_foreign` FOREIGN KEY (`linked_quote_id`) REFERENCES `quotes`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment_package_lines` ADD CONSTRAINT `shipment_package_lines_shipment_id_foreign` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
