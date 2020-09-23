const { isAdmin } = require('../middleware/hasAuth');
const brand = require('../controllers/brand.c');

exports.init = (router)=>{
    router.post('/brands', isAdmin, brand.brand_grid_data);
    router.get('/brands/:id', isAdmin, brand.get_brand);
    router.post('/brands/:id', isAdmin, brand.add_brand);
    router.post('/brands/:id/upload/thumbnail', isAdmin, brand.upload_thumbnail);
    router.put('/brands/:id', isAdmin, brand.update_brand);
    router.delete('/brands/:id', isAdmin, brand.delete_brand);
    return router;
};