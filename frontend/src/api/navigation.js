/**
 * Helper to perform programmatic redirects cleanly and mockably.
 * @param {string} path - Target path to redirect to.
 */
export const redirectTo = (path) => {
    if (typeof window !== 'undefined' && window.location) {
        window.location.assign(path);
    }
};
