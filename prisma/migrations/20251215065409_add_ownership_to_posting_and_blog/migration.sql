-- DropForeignKey
ALTER TABLE `blogs` DROP FOREIGN KEY `blogs_username_fkey`;

-- DropForeignKey
ALTER TABLE `postings` DROP FOREIGN KEY `postings_username_fkey`;

-- DropIndex
DROP INDEX `blogs_username_fkey` ON `blogs`;

-- DropIndex
DROP INDEX `postings_username_fkey` ON `postings`;

-- AlterTable
ALTER TABLE `blogs` MODIFY `username` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `postings` MODIFY `username` VARCHAR(100) NULL;
