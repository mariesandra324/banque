CREATE TABLE IF NOT EXISTS password_reset_otps (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255),
  telephone VARCHAR(50),
  cin VARCHAR(20),
  code VARCHAR(6),
  expires_at TIMESTAMP,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP
);
