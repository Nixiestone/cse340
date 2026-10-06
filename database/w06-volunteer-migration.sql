-- Safe to run on your EXISTING database (local and Render): it only adds the W06 volunteer table
-- and never deletes data. (Unlike setup.sql, which drops everything first.)

CREATE TABLE IF NOT EXISTS volunteer (
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    project_id INT NOT NULL REFERENCES project(project_id) ON DELETE CASCADE,
    signed_up_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, project_id)
);

-- Verify (should return zero rows at first, with no error)
SELECT * FROM volunteer;