-- AlterTable
ALTER TABLE `quotes` ADD COLUMN `preferred_time_slot` ENUM('morning', 'afternoon', 'evening') NULL,
    ADD COLUMN `timezone` VARCHAR(64) NULL;
