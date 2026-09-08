DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS organization;
DROP TABLE IF EXISTS category;

CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    organization_name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(150) NOT NULL,
    description TEXT
);

CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    description TEXT,
    organization_id INT NOT NULL REFERENCES organization(organization_id),
    category_id INT NOT NULL REFERENCES category(category_id)
);

INSERT INTO category (category_name) VALUES
('Environmental'),
('Educational'),
('Community Service'),
('Health and Wellness');

INSERT INTO organization (organization_name, contact_email, description) VALUES
('BrightFuture Builders', 'info@brightfuture.org', 'Building homes and futures.'),
('GreenHarvest Growers', 'contact@greenharvest.org', 'Sustainable community gardening.'),
('UnityServe Volunteers', 'hello@unityserve.org', 'Connecting volunteers with causes.');

INSERT INTO project (project_name, description, organization_id, category_id) VALUES
('Park Cleanup', 'Join us to clean up local parks and make them beautiful!', 1, 1),
('Food Drive', 'Help collect and distribute food to those in need.', 2, 3),
('Community Tutoring', 'Volunteer to tutor students in various subjects.', 3, 2);