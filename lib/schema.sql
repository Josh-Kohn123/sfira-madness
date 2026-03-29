CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  omer_start_date DATE NOT NULL
);

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cookie_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  pin_hash TEXT NOT NULL,
  avatar_url TEXT,
  is_creator BOOLEAN NOT NULL DEFAULT false,
  eliminated_on_day INTEGER CHECK (eliminated_on_day >= 1 AND eliminated_on_day <= 49),
  predictions_locked BOOLEAN NOT NULL DEFAULT false,
  timezone TEXT,
  push_subscription JSONB,
  reminders_enabled BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, name)
);

CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  predictor_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  predicted_day INTEGER NOT NULL CHECK (predicted_day >= 1 AND predicted_day <= 49),
  UNIQUE(predictor_id, subject_id)
);

CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  reactor_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('😱', '🫡', '💀', '🕯️', '😂')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reactor_id, subject_id, emoji)
);

CREATE INDEX idx_members_group ON members(group_id);
CREATE INDEX idx_members_cookie ON members(cookie_token);
CREATE INDEX idx_predictions_group ON predictions(group_id);
CREATE INDEX idx_predictions_predictor ON predictions(predictor_id);
CREATE INDEX idx_reactions_subject ON reactions(subject_id);
