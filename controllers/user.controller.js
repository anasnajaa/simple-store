exports.show_login = (req, res) => {
    res.render('user/login', {formData: {}, error: {}});
};

exports.show_signup = (req, res) => {
    res.render('user/signup', {formData: {}, error: {}});
};