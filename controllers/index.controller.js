const { render } = require('../util/express');

exports.get_landing = (req, res, next) => {
    render(req, res, next, 'landing', {});
};