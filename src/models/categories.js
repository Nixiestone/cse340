import db from './db.js';

const getAllCategories = async () => {
    const query = `
        SELECT category_id, category_name
        FROM category
        ORDER BY category_name
    `;
    const result = await db.query(query);
    return result.rows;
};

const getCategoryDetails = async (categoryId) => {
    const query = `
        SELECT category_id, category_name
        FROM category
        WHERE category_id = $1
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows[0];
};

const getCategoriesByProjectId = async (projectId) => {
    const query = `
        SELECT category.category_id, category.category_name
        FROM category
        JOIN project_category ON category.category_id = project_category.category_id
        WHERE project_category.project_id = $1
        ORDER BY category.category_name
    `;
    const result = await db.query(query, [projectId]);
    return result.rows;
};

/**
 * Creates a new category.
 * @param {string} name - The name of the category.
 * @returns {number} The id of the newly created category.
 */
const createCategory = async (name) => {
    const query = `
        INSERT INTO category (category_name)
        VALUES ($1)
        RETURNING category_id
    `;
    const result = await db.query(query, [name]);

    if (result.rows.length === 0) {
        throw new Error('Failed to create category');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new category with ID:', result.rows[0].category_id);
    }

    return result.rows[0].category_id;
};

/**
 * Updates an existing category's name.
 * @returns {number} The id of the updated category.
 */
const updateCategory = async (categoryId, name) => {
    const query = `
        UPDATE category
        SET category_name = $1
        WHERE category_id = $2
        RETURNING category_id
    `;
    const result = await db.query(query, [name, categoryId]);

    if (result.rows.length === 0) {
        throw new Error('Category not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated category with ID:', categoryId);
    }

    return result.rows[0].category_id;
};

/**
 * Links one category to one project. Not exported: it is only used by
 * updateCategoryAssignments below, and it runs on the transaction's client.
 */
const assignCategoryToProject = async (client, categoryId, projectId) => {
    const query = `
        INSERT INTO project_category (category_id, project_id)
        VALUES ($1, $2)
    `;
    await client.query(query, [categoryId, projectId]);
};

/**
 * Replaces a project's categories with the given list.
 * Runs as a transaction so it either fully succeeds or changes nothing.
 * @param {number|string} projectId
 * @param {Array<number|string>} categoryIds - the full list of categories the project should have
 */
const updateCategoryAssignments = async (projectId, categoryIds) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // First, remove existing category assignments for the project
        await client.query('DELETE FROM project_category WHERE project_id = $1', [projectId]);

        // Next, add the new category assignments
        for (const categoryId of categoryIds) {
            await assignCategoryToProject(client, categoryId, projectId);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export {
    getAllCategories,
    getCategoryDetails,
    getCategoriesByProjectId,
    createCategory,
    updateCategory,
    updateCategoryAssignments
};