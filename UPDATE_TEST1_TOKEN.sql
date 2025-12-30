-- UPDATE USER TOKEN SCRIPT
-- Update user test1 dengan token JWT yang valid

UPDATE `users` SET `token` = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3NjcxMDE0NjksImV4cCI6MTc2NzcwNjI2OX0.ATcVKVHcGOOsC6BVsyoF7HG7EgH5J5o4CmBZpfEmgGg' WHERE `username` = 'test1';

-- Verify hasil update
SELECT `username`, `name`, `token`, `is_admin`, `createdAt` FROM `users` WHERE `username` = 'test1';
