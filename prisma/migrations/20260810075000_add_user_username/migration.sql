-- AlterTable
ALTER TABLE `users` ADD COLUMN `username` VARCHAR(30) NULL,
    ADD COLUMN `display_username` VARCHAR(30) NULL;

-- CreateIndex
-- Nullable + UNIQUE: MySQL allows many NULLs in a unique index, so existing
-- rows stay valid until scripts/backfill-usernames.ts fills them in.
CREATE UNIQUE INDEX `users_username_unique` ON `users`(`username`);
