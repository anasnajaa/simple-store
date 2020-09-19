const { isAdmin } = require('../middleware/hasAuth');
const brand = require('../controllers/brand.controller');

exports.brandRoutes = (router)=>{
    // pages
    router.get('/brands', isAdmin, brand.page_brands);
    router.get(`/brands/:id`, isAdmin, brand.page_add_edit_brand);

    // api
    // router.get(`/brands/:id/edit`, isAdmin, (req, res, next)=>{
    //     brand.show_edit_brand(req, res, next, {}, {});
    // });
    // router.post(`/brands/:id/edit`, isAdmin, brand.edit_brand);

    // router.get(`/brands/add`, isAdmin, brand.show_add_brand);
    // router.post(`/brands/add`, isAdmin, brand.add_brand);

    // router.get(`/brands/:id/add-category`, isAdmin, (req, res, next)=>{
    //     brand.show_add_brand_category(req, res, next, {}, {});
    // });
    // router.post(`/brands/:id/add-category`, isAdmin, brand.add_brand_category);
    
    // router.post(`/brands/:id/delete`, isAdmin, brand.delete_brand);

    return router;
};