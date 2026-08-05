-- AlterTable
ALTER TABLE `callback_requests` ADD COLUMN `timezone` VARCHAR(64) NULL;

-- Backfill existing rows (pre-dates timezone capture) with a reasonable default.
UPDATE `callback_requests` SET `timezone` = 'America/New_York' WHERE `timezone` IS NULL;

-- AlterTable
ALTER TABLE `callback_requests` MODIFY COLUMN `timezone` VARCHAR(64) NOT NULL;
