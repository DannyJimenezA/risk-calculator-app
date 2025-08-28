-- Remove category, owner, and status columns from risks table
ALTER TABLE risks DROP COLUMN IF EXISTS category;
ALTER TABLE risks DROP COLUMN IF EXISTS owner;
ALTER TABLE risks DROP COLUMN IF EXISTS status;
