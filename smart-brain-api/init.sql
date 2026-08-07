-- SmartBrain database schema
-- Reconstructed from the columns actually used in:
--   controllers/Register.js  (inserts into login + users)
--   controllers/Signin.js    (reads email, hash from login)
--   controllers/Profile.js   (reads by users.id)
--   controllers/Image.js     (increments users.entries by id)

-- Stores secure login credentials, separate from public profile data.
CREATE TABLE IF NOT EXISTS login (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    hash TEXT NOT NULL
);

-- Stores public user profile data, linked by email to the login table.
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    entries INTEGER DEFAULT 0,
    joined TIMESTAMP NOT NULL DEFAULT NOW()
);
