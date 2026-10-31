CREATE TABLE IF NOT EXISTS carte_pin_reset_otps (
    id BIGSERIAL PRIMARY KEY,
    carte_id BIGINT NOT NULL REFERENCES cartes(id) ON DELETE CASCADE,
    code_hash VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_carte_pin_reset_otps_carte_created
    ON carte_pin_reset_otps (carte_id, created_at DESC);
