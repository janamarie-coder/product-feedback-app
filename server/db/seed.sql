-- Sample rows for the suggestions table.
-- id and created_at are omitted so their defaults (SERIAL / now()) apply.

INSERT INTO suggestions (title, description, category) VALUES
  ('Add dark mode', 'It would be great to have a dark theme option in settings.', 'Feature'),
  ('Fix button alignment on mobile', 'The submit button overlaps the footer on small screens.', 'Bug'),
  ('Simplify onboarding flow', 'The signup form has too many steps before you reach the dashboard.', 'UX'),
  ('Improve contrast on form labels', 'Gray label text on white backgrounds is hard to read.', 'UI'),
   ('Add keyboard shortcuts', 'Power users would benefit from shortcuts for common actions.', 'Enhancement');
