/*
  Warnings:

  - You are about to drop the column `pictures` on the `postings` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE `pictures` (
    `id` CHAR(36) NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `postingId` CHAR(36) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrate existing picture data from JSON to pictures table
INSERT INTO `pictures` (`id`, `url`, `postingId`, `createdAt`)
SELECT
    UUID() as `id`,
    JSON_UNQUOTE(JSON_EXTRACT(picture.value, '$')) as `url`,
    p.id as `postingId`,
    NOW() as `createdAt`
FROM `postings` p
CROSS JOIN JSON_TABLE(
    COALESCE(NULLIF(p.pictures, ''), '[]'),
    '$[*]' COLUMNS (value VARCHAR(255) PATH '$')
) as picture
WHERE JSON_VALID(p.pictures) = 1
  AND JSON_LENGTH(p.pictures) > 0
  AND picture.value IS NOT NULL
  AND picture.value != '';

-- AddForeignKey
ALTER TABLE `pictures` ADD CONSTRAINT `pictures_postingId_fkey` FOREIGN KEY (`postingId`) REFERENCES `postings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `postings` DROP COLUMN `pictures`;
