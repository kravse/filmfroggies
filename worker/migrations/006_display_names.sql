-- display_name becomes "set by the user, or NULL". Every value written before this
-- migration was derived from the email at signup, so clearing those is lossless.
UPDATE users SET display_name = NULL
WHERE display_name IS NOT NULL
  AND display_name = substr(email, 1, instr(email, '@') - 1);

CREATE UNIQUE INDEX IF NOT EXISTS users_display_name_unique
  ON users(display_name COLLATE NOCASE)
  WHERE display_name IS NOT NULL;
