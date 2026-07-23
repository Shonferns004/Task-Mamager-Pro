-- Update status CHECK constraint to use pending, partially_done, done
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('pending', 'partially_done', 'done'));

-- Update default value
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'pending';
