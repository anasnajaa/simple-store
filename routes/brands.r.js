const { isAdmin } = require('../middleware/hasAuth');
const brand = require('../controllers/brand.c');

exports.init = (router)=>{
    router.get('/brands', brand.brands_list_advanced);

    router.get('/brands/simple', isAdmin, brand.brands_list_simple);

    router.get('/brands/:id', isAdmin, brand.get_brand);
    router.post('/brands', brand.add_brand);

    router.post('/brands/:id/upload/thumbnail', isAdmin, brand.upload_thumbnail);

    router.put('/brands/:id', isAdmin, brand.update_brand);

    router.delete('/brands/:id', isAdmin, brand.delete_brand);

    return router;
};