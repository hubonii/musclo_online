ALTER TABLE users MODIFY COLUMN username VARCHAR(30) NOT NULL;
ALTER TABLE users ADD UNIQUE INDEX idx_users_username (username);
