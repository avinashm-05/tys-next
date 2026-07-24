-- AlterTable
ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(30) NULL,
    MODIFY `password` VARCHAR(191) NULL;
