const { render } = require('../util/express');

exports.show_home = (req, res, next) => {
    render(req, res, next, 'admin.home.ejs', {});
};