const apiRouter = require('./api');
const siteRouter = require('./site');

function route(app) {
    app.use('/api', apiRouter);
    app.use('/', siteRouter);
}

module.exports = route;
