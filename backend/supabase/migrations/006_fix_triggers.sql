-- Remove priority references from log_task_activity trigger
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (task_id, user_id, action, details)
    VALUES (NEW.id, NEW.created_by, 'task_created', jsonb_build_object('title', NEW.title));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status <> NEW.status THEN
      INSERT INTO activity_logs (task_id, user_id, action, details)
      VALUES (NEW.id, NEW.created_by, 'status_changed', jsonb_build_object('from', OLD.status, 'to', NEW.status));
    END IF;
    IF OLD.title <> NEW.title THEN
      INSERT INTO activity_logs (task_id, user_id, action, details)
      VALUES (NEW.id, NEW.created_by, 'title_changed', jsonb_build_object('from', OLD.title, 'to', NEW.title));
    END IF;
    IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
      INSERT INTO activity_logs (task_id, user_id, action, details)
      VALUES (NEW.id, NEW.created_by, 'task_completed', '{}'::jsonb);
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
