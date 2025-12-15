/*
  Warnings:

  - Added the required column `username` to the `blogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `postings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `blogs` ADD COLUMN `username` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `postings` ADD COLUMN `username` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `is_admin` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `name` VARCHAR(50) NOT NULL;

-- AddForeignKey
ALTER TABLE `postings` ADD CONSTRAINT `postings_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogs` ADD CONSTRAINT `blogs_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE CASCADE ON UPDATE CASCADE;
