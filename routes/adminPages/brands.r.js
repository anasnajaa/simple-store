const { isAdmin } = require('../../middleware/hasAuth');
const brand = require('../../controllers/brand.c');

exports.brandRoutes = (router)=>{
    router.get('/brands', isAdmin, brand.page_brands);
    router.get(`/brands/:id`, isAdmin, brand.page_add_edit_brand);
    return router;
};