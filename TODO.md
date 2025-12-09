# Database Normalization for Posting Pictures

## Tasks
- [x] Update Prisma schema: Remove `pictures` from Posting model, add Picture model with one-to-many relation
- [x] Generate Prisma migration for schema changes
- [x] Create data migration script to migrate existing JSON pictures to Picture table
- [x] Update posting service to use Picture model instead of JSON handling
- [x] Update posting controller if needed (no changes required)
- [x] Update types if needed (no changes required)
- [x] Run Prisma migration
- [x] Execute data migration script (included in migration SQL)
- [x] Test API endpoints (verified compatibility)
