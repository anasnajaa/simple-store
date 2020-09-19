const categoryModel = require('../models/category.model');

exports.get_categories_list = async (req, res, next)=>{
    try {
        const categories = await categoryModel.findAll();
        res.json(categories);
    } catch (error) {
        console.log(error);
        res.status(500).json({});
    }
};