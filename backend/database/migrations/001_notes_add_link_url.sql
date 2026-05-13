-- Run once on existing databases: adds optional external link to notes.
ALTER TABLE notes
  ADD COLUMN link_url VARCHAR(2000) NULL AFTER category;
