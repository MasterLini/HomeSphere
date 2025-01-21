/**
 * Logs all registered routes in the application, grouped by their source.
 * @param {Object} app - The Express application instance.
 */
const logRoutes = (app) => {
    const routes = {};
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {

            routes['Direct'] = routes['Direct'] || [];
            routes['Direct'].push({
                method: Object.keys(middleware.route.methods)[0].toUpperCase(),
                path: middleware.route.path,
            });
        } else if (middleware.name === 'router') {

            const source = middleware.handle.routerName || 'Unknown';
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const methods = Object.keys(handler.route.methods).map((m) => m.toUpperCase());
                    routes[source] = routes[source] || [];
                    routes[source].push({
                        method: methods.join(', '),
                        path: handler.route.path,
                    });
                }
            });
        }
    });

    Object.entries(routes).forEach(([source, routes]) => {
        console.log(`Routes from: ${source}`);
        console.table(routes);
        console.log('--------------------------------------------------');
    });
};

module.exports = { logRoutes };
