-- AlterTable
ALTER TABLE `shipments` ADD COLUMN `all_clear` ENUM('ready', 'not_ready') NOT NULL DEFAULT 'not_ready',
    ADD COLUMN `do_not_show_on_my_shipment` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `duties_taxes_paid_by` VARCHAR(100) NULL,
    ADD COLUMN `managed_by` VARCHAR(255) NULL,
    ADD COLUMN `package_type` ENUM('package', 'document', 'pallet') NOT NULL DEFAULT 'package',
    ADD COLUMN `payment_issued` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `service_type` VARCHAR(100) NULL,
    ADD COLUMN `ship_date` DATE NULL,
    ADD COLUMN `sub_service_type` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `shipment_invoice_lines` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shipment_id` BIGINT UNSIGNED NOT NULL,
    `package_number` INTEGER NOT NULL,
    `package_content` VARCHAR(255) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `value_per_qty` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `shipment_invoice_lines_shipment_id_index`(`shipment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_documents` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shipment_id` BIGINT UNSIGNED NOT NULL,
    `document_type` VARCHAR(100) NOT NULL,
    `document_name` VARCHAR(255) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `shipment_documents_shipment_id_index`(`shipment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_tracking_events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shipment_id` BIGINT UNSIGNED NOT NULL,
    `source` ENUM('manual', 'carrier') NOT NULL DEFAULT 'manual',
    `occurred_at` DATETIME(3) NOT NULL,
    `status` VARCHAR(100) NOT NULL,
    `location` VARCHAR(255) NULL,
    `note` TEXT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NULL,

    INDEX `shipment_tracking_events_shipment_id_index`(`shipment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_notes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shipment_id` BIGINT UNSIGNED NOT NULL,
    `comment` TEXT NOT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `shipment_notes_shipment_id_index`(`shipment_id`),
    INDEX `shipment_notes_created_at_index`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `shipment_invoice_lines` ADD CONSTRAINT `shipment_invoice_lines_shipment_id_foreign` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment_documents` ADD CONSTRAINT `shipment_documents_shipment_id_foreign` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment_tracking_events` ADD CONSTRAINT `shipment_tracking_events_shipment_id_foreign` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment_tracking_events` ADD CONSTRAINT `shipment_tracking_events_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment_notes` ADD CONSTRAINT `shipment_notes_shipment_id_foreign` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment_notes` ADD CONSTRAINT `shipment_notes_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
