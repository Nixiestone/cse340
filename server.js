import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'url';
import path from 'path';
import { testConnection } from './src/models/db.js';
import router from './src/routes.js';
import flash from './src/middleware/flash.js';

const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Fail loudly at startup if the secret is missing, instead of with a confusing error later
if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not set. Add it to your .env file and to Render.');
}

// Serve static files from the public directory (before sessions so they never create one)
app.use(express.static(path.join(__dirname, 'public')));

// Sessions must come BEFORE flash, because flash stores its messages inside the session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 2
    }
}));

// Flash messages (needs req.session to exist)
app.use(flash);

// Parse HTML form submissions so req.body is filled in (needed for every POST route)
app.use(express.urlencoded({ extended: true }));

// Set EJS as the templating engine and tell Express where the templates live
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Log every incoming request (development only)
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next();
});

// Make NODE_ENV available to all templates
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// Use the imported router to handle routes
app.use(router);

// Catch-all route for 404 errors
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Global error handler. Express knows this is an error handler ONLY because it has
// 4 parameters, so `next` must stay in the signature even though we don't use it.
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const status = err.status || 500;
    const isProduction = NODE_ENV === 'production';

    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);

    const template = status === 404 ? '404' : '500';
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: isProduction ? 'An unexpected error occurred.' : err.message,
        stack: isProduction ? null : err.stack
    };

    res.status(status).render(`errors/${template}`, context);
});

app.listen(PORT, async () => {
    try {
        await testConnection();
        console.log(`Server is running at http://127.0.0.1:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
});