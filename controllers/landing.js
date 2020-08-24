exports.get_landing = (req, res, next) => {
    res.render('landing', { title: 'Express' });
};