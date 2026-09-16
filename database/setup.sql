DROP TABLE IF EXISTS project_category;
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
    description TEXT,
    logo VARCHAR(150) NOT NULL
);

CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(150) NOT NULL,
    project_date DATE NOT NULL,
    organization_id INT NOT NULL REFERENCES organization(organization_id)
);

-- Junction table: this is what makes project <-> category many-to-many.
-- A project can have multiple categories, a category can apply to multiple projects.
CREATE TABLE project_category (
    project_id INT NOT NULL REFERENCES project(project_id),
    category_id INT NOT NULL REFERENCES category(category_id),
    PRIMARY KEY (project_id, category_id)
);

INSERT INTO category (category_name) VALUES
('Environmental'),
('Educational'),
('Community Service'),
('Health and Wellness');

INSERT INTO organization (organization_name, contact_email, description, logo) VALUES
('BrightFuture Builders', 'info@brightfuture.org', 'Building homes and futures.', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'contact@greenharvest.org', 'Sustainable community gardening.', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'hello@unityserve.org', 'Connecting volunteers with causes.', 'unityserve-logo.png');

-- BrightFuture Builders (organization_id = 1) — 5 projects
INSERT INTO project (project_name, description, location, project_date, organization_id) VALUES
('Park Cleanup', 'Join us to clean up local parks and make them beautiful!', 'Riverside Park', '2026-10-03', 1),
('Home Repair Day', 'Help repair homes for elderly residents.', 'Downtown District', '2026-10-17', 1),
('Habitat Build', 'Assist in building a new home for a family in need.', 'Maple Street', '2026-11-07', 1),
('Winter Shelter Setup', 'Prepare emergency shelters ahead of winter.', 'Community Center', '2026-11-21', 1),
('Neighborhood Painting', 'Repaint community buildings and fences.', 'Oak Avenue', '2026-12-05', 1);

-- GreenHarvest Growers (organization_id = 2) — 5 projects
INSERT INTO project (project_name, description, location, project_date, organization_id) VALUES
('Food Drive', 'Help collect and distribute food to those in need.', 'City Food Bank', '2026-10-10', 2),
('Community Garden Planting', 'Plant vegetables in the shared community garden.', 'Greenfield Lot', '2026-10-24', 2),
('Composting Workshop', 'Teach composting basics to local residents.', 'Library Annex', '2026-11-14', 2),
('Farmers Market Support', 'Volunteer to help run the weekly farmers market.', 'Town Square', '2026-11-28', 2),
('Tree Planting Day', 'Plant trees along the riverside walking trail.', 'Riverside Park', '2026-12-12', 2);

-- UnityServe Volunteers (organization_id = 3) — 5 projects
INSERT INTO project (project_name, description, location, project_date, organization_id) VALUES
('Community Tutoring', 'Volunteer to tutor students in various subjects.', 'Lincoln Elementary', '2026-10-05', 3),
('Health Screening Day', 'Offer free basic health screenings to the community.', 'Community Center', '2026-10-19', 3),
('Senior Companionship Visits', 'Spend time with elderly residents at the care home.', 'Sunrise Senior Home', '2026-11-02', 3),
('Youth Mentorship Program', 'Mentor local youth in academics and life skills.', 'Lincoln Elementary', '2026-11-16', 3),
('Blood Drive', 'Host a community blood donation drive.', 'Town Square', '2026-12-07', 3);

-- Map each project to one or more categories (many-to-many in action)
INSERT INTO project_category (project_id, category_id) VALUES
(1, 1),             -- Park Cleanup -> Environmental
(2, 3),             -- Home Repair Day -> Community Service
(3, 3),             -- Habitat Build -> Community Service
(4, 3), (4, 4),     -- Winter Shelter Setup -> Community Service, Health and Wellness
(5, 3),             -- Neighborhood Painting -> Community Service
(6, 3), (6, 4),     -- Food Drive -> Community Service, Health and Wellness
(7, 1),             -- Community Garden Planting -> Environmental
(8, 1), (8, 2),     -- Composting Workshop -> Environmental, Educational
(9, 3),             -- Farmers Market Support -> Community Service
(10, 1),            -- Tree Planting Day -> Environmental
(11, 2),            -- Community Tutoring -> Educational
(12, 4),            -- Health Screening Day -> Health and Wellness
(13, 3), (13, 4),   -- Senior Companionship Visits -> Community Service, Health and Wellness
(14, 2),            -- Youth Mentorship Program -> Educational
(15, 4);            -- Blood Drive -> Health and Wellness