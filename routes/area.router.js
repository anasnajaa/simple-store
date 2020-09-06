const { isAdmin } = require('../middleware/hasAuth');
const area = require('../controllers/area.controller');

exports.areaRoutes = (router)=>{
    router.get('/areas', isAdmin, area.show_areas);
    router.post('/areas', isAdmin, area.show_areas);
    
    router.get(`/areas/:id/edit`, isAdmin, (req, res, next)=>{
        area.show_edit_area(req, res, next, {}, {});
    });
    router.post(`/areas/:id/edit`, isAdmin, area.edit_area);

    router.get(`/areas/add`, isAdmin, area.show_add_area);
    router.post(`/areas/add`, isAdmin, area.add_area);
    
    router.post(`/areas/:id/delete`, isAdmin, area.delete_area);
    return router;
};