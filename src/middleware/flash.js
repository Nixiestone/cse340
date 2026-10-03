/**
 * Flash message middleware.
 * A flash message is stored in the session, shown once on the next page, then deleted.
 */
const flash = (req, res, next) => {
    // Adds req.flash(type, message) so controllers can queue a message
    req.flash = (type, message) => {
        if (!req.session.flash) {
            req.session.flash = {};
        }
        if (!req.session.flash[type]) {
            req.session.flash[type] = [];
        }
        req.session.flash[type].push(message);
    };

    // Adds flash() to every EJS template. Calling it returns the queued messages AND clears them.
    res.locals.flash = () => {
        const messages = req.session.flash || {};
        delete req.session.flash;
        return messages;
    };

    next();
};

export default flash;