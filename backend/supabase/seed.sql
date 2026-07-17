-- Seed data for UCS Task Manager
-- Run this after migrations and after at least one user has signed in

-- Set admin role (replace with actual email after first sign-in)
-- UPDATE users SET role = 'admin' WHERE email = 'admin@ucs.com';

-- Sample tasks (run after at least one user exists)
-- INSERT INTO tasks (title, description, status, priority, created_by, due_date)
-- VALUES
--   ('Design homepage mockup', 'Create wireframes for the new company homepage', 'todo', 'high', (SELECT id FROM users LIMIT 1), NOW() + INTERVAL '7 days'),
--   ('Set up CI/CD pipeline', 'Configure GitHub Actions for automated deployment', 'in_progress', 'critical', (SELECT id FROM users LIMIT 1), NOW() + INTERVAL '3 days'),
--   ('Write API documentation', 'Document all REST endpoints with examples', 'done', 'medium', (SELECT id FROM users LIMIT 1), NOW() - INTERVAL '1 day'),
--   ('Fix login bug', 'Users reporting errors on Google sign-in', 'in_progress', 'critical', (SELECT id FROM users LIMIT 1), NOW() + INTERVAL '1 day'),
--   ('Database backup strategy', 'Implement automated daily backups', 'todo', 'medium', (SELECT id FROM users LIMIT 1), NOW() + INTERVAL '14 days');
