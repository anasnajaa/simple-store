const { parseFilterQuery } = require('../util/knexQueryHelper');
const { apiError } = require('../util/errorHandler');
const brandModel = require('../models/brand.m');
const v = require('../validators');
const { isEmpty, merge } = require('lodash');


exports.get_brand = async (req, res, next)=>{
    try {
        const id = req.params.id;
        const brand = await brandModel.findOneById(id);
        if(brand){
            res.json(brand);
        } else {
            res.status(404).json({});
        }
        
    } catch (error) {
        apiError(res, error);
    }
}

exports.delete_brand = async (req, res, next) => {
    try {
        const id = req.params.id;
        const deleted = await brandModel.deleteOne(id);
        res.json({ deleted });
    } catch (error) {
        apiError(res, error);
    }
};

exports.brands_list_advanced = async (req, res, next)=>{
    try {
        const query = parseFilterQuery(req.query);
        const list = await brandModel.findAllAdvanced(query);
        res.json(merge({status: 1}, list));
    } catch (error) {
        apiError(res, error);
    }
};

exports.brands_list_simple = async (req, res, next) => {
    try {
        const query = parseFilterQuery(req.body);
        const response = await brandModel.findAllAdvanced(query);
        res.json(response);
    } catch (error) {
        apiError(res, error);
    }
};

exports.add_brand = async (req, res, next)=>{
    try {
        const errors = {};
        const {name, thumbnail_url} = req.body;

        v.vEmpty(errors, name, "name");
        v.vBrandExist(errors, name, "name");
    
        if(!isEmpty(errors)){
            res.status(402).json({
                messages: [
                    {
                        message: "please fill all required fields"
                    }
                ]
            })
            return;
        }

        try {
            const brand = await brandModel.insertOne(name, thumbnail_url);
            res.status(200).json({
                data: {
                    brand
                },
                messages: [
                    {
                        message: "record added"
                    }
                ]
            });
        } catch (error) {
            res.status(400).json({
                messages: [
                    {
                        message: "something went wrong"
                    }
                ]
            });
        }
    } catch (error) {
        res.status(500).json({
            messages: [
                {
                    message: "server error"
                }
            ]
        });
        apiError(res, error);
    }
};

exports.update_brand = async (req, res, next)=> {
    try {
        const errors = {};
        const id = req.params.id;
        const { name, delete_thumb } = req.body;
        let thumbnail = null;

        v.vEmpty(errors, name, "name");
        await v.vBrandExist("name", errors, name);
        
        if(req.files && !isEmpty(req.files) && req.files.thumbnail_file){
            thumbnail = req.files.thumbnail_file;
            v.vIsJpegFile("thumbnail_url", errors, thumbnail);
        }

        if(!isEmpty(errors)){
            return;
        }

        const brand = await brandModel.findOneById(id);

        if (thumbnail) {
            const thumbUpdated = await brand.updateThumb(thumbnail);
            if(!thumbUpdated){
                errors["thumbnail_url"] = "Upload failed, please try again";
                return;
            }
        } else if (delete_thumb){
            await brand.deleteThumb();
        }

        brand.updateName(name);

        if(brand.save()){
        } else {
            return;
        }
    } catch (error) {
        apiError(res, error);
    }
};

exports.upload_thumbnail = async (req, res, next)=> {
    try {
        const errors = {};
        const id = req.params.id;
        const { delete_thumb } = req.body;
        let thumbnail = null;
        
        if(req.files && !isEmpty(req.files) && req.files.file_brand_thumbnail){
            thumbnail = req.files.file_brand_thumbnail;
            v.vIsJpegFile("thumbnail_url", errors, thumbnail);
        }

        if(!isEmpty(errors)){
            res.status(500).json(errors);
        }

        const brand = await brandModel.findOneById(id);

        if (thumbnail) {
            const thumbUpdated = await brand.updateThumb(thumbnail);
            if(!thumbUpdated){
                errors["thumbnail_url"] = "Uploaded failed, please try again";
                res.status(500).json(errors);
            }
        } else if (delete_thumb){
            await brand.deleteThumb();
        }

        if(brand.save()){
            res.json(brand)
        } else {
            res.status(500).json(errors);
        }
    } catch (error) {
        apiError(res, error);
    }  
}