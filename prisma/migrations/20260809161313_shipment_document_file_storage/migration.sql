-- AlterTable
ALTER TABLE `shipment_documents` ADD COLUMN `content_type` VARCHAR(100) NULL,
    ADD COLUMN `size_bytes` INTEGER NULL,
    ADD COLUMN `storage_key` VARCHAR(255) NULL,
    ADD COLUMN `tracking_number` VARCHAR(30) NULL;
