const { isAdmin } = require('../middleware/hasAuth');
const category = require('../controllers/categories.c');

exports.init = (router)=>{
    router.get('/categories', isAdmin, category.get_categories_list);
    return router;
};