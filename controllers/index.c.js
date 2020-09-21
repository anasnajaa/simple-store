const { render } = require('../util/express');

exports.page_landing = (req, res, next) => {
    render(req, res, next, 'landing', {});
};