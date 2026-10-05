import bcrypt from 'bcrypt';
import db from './db.js';

/**
 * Creates a new user with the default "user" role.
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email (used as their username).
 * @param {string} passwordHash - The bcrypt hash of the user's password (never the plain password).
 * @returns {number} The id of the newly created user record.
 */
const createUser = async (name, email, passwordHash) => {
    const default_role = 'user';
    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4))
        RETURNING user_id
    `;
    const queryParams = [name, email, passwordHash, default_role];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

/**
 * Finds a user by email, including the name of their role.
 * @param {string} email - The email to look up.
 * @returns {Object|null} The user record (including password_hash), or null if not found.
 */
const findUserByEmail = async (email) => {
    // LEFT JOIN keeps the user even if their role_id is somehow empty
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;
    const queryParams = [email];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        return null; // User not found
    }

    return result.rows[0];
};

// Compares a plain text password against a stored bcrypt hash
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Checks an email and password against the database.
 * @returns {Object|null} The user (WITHOUT password_hash) if the credentials are valid, otherwise null.
 */
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) {
        return null;
    }

    const passwordIsValid = await verifyPassword(password, user.password_hash);
    if (!passwordIsValid) {
        return null;
    }

    // Never keep the hash around once it has been checked
    delete user.password_hash;
    return user;
};

/**
 * Gets every registered user with their role name (used by the admin Users page).
 * The password hash is deliberately NOT selected.
 * @returns {Array} All users, sorted by name.
 */
const getAllUsers = async () => {
    const query = `
        SELECT u.user_id, u.name, u.email, r.role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.name, u.email
    `;
    const result = await db.query(query);
    return result.rows;
};

export { createUser, authenticateUser, getAllUsers };