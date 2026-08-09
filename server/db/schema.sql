-- Product Feedback App — suggestions table
-- Matches PRD Section 3: Data Model

CREATE TABLE suggestions (
  id          SERIAL PRIMARY KEY,

  title       VARCHAR(100) NOT NULL
              CHECK (char_length(btrim(title)) >= 2),

  description TEXT NOT NULL
              CHECK (char_length(btrim(description)) BETWEEN 5 AND 500),

  category    VARCHAR(20) NOT NULL
              CHECK (category IN ('UI', 'UX', 'Enhancement', 'Bug', 'Feature')),

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
