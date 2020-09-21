const { render, flash, renderError, parseFilterQuery } = require('../util/express');
const { logError } = require('../util/errorHandler');
const brandModel = require('../models/brand.m');
const v = require('../validators');
const { isEmpty } = require('lodash');
const e = require('express');

const viewList = 'admin/brands/list';
const viewOne = 'admin/brands/details';
const urlShowBrandDetails = (id)=> `/admin/brands/${id}`;
const urlShowItemsList = ()=> `/admin/brands/`;

exports.page_add_edit_brand = async (req, res, next)=>{
    try {
        const id = req.params.id || 0;
        render(req, res, next, viewOne, {
            recordid: id, 
            crumbs: [
                {title: "home", url:"/"}, 
                {title: "admin", url:"/admin"},
                {title: "brands", url: "/admin/brands"},
                {title: id === 0 ? "Add" : "Edit", url: "/admin/brands", active: true},
            ]
        });
    } catch (error) {
        renderError(req, res, next, error);
    }
};

exports.page_brands = async (req, res, next)=>{
    try {
        render(req, res, next, viewList, {
            crumbs: [
                {title: "home", url:"/"}, 
                {title: "admin", url:"/admin"},
                {title: "brands", url: "/admin/brands", active: true}
            ]});
    } catch (error) {
        renderError(req, res, next, error);
    }
};

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
        res.status(500).json(error);
    }
}

exports.update_brand = async (req, res, next)=>{ 

}

exports.delete_brand = async (req, res, next) => {
    try {
        const id = req.params.id;
        const recordsDeleted = await brandModel.deleteOne(id);
        if(recordsDeleted === 1){
            flash(req, "success", null, "Record deleted"); 
            res.redirect(urlShowItemsList());
        } else {
            flash(req, "danger", null, "Failed to delete record"); 
            res.redirect(urlShowItemsList());
        }
    } catch (error) {
        renderError(req, res, next, error);
    }
};

exports.api_delete_brand = async (req, res, next) => {
    try {
        const id = req.params.id;
        const deleted = await brandModel.deleteOne(id);
        res.json({ deleted });
    } catch (error) {
        logError(error);
        res.json({error});
    }
};

exports.brand_grid_data = async (req, res, next)=>{
    try {
        const query = parseFilterQuery(req.body);
        const response = await brandModel.findAll(query);
        res.json(response);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
};

exports.add_brand = async (req, res, next)=>{
    try {
        const errors = {};
        const {name, thumbnail_url} = req.body;

        v.vEmpty(errors, name, "name");
        v.vBrandExist(errors, name, "name");
    
        if(!isEmpty(errors)){
            render(req, res, next, viewOne, {brand: req.body, mode: "add", errors});
            return;
        }

        const brand = await brandModel.insertOne(name, thumbnail_url);

        if(brand){
            flash(req, "success", null, "Record added");
            req.redirect(urlShowItemsList());
        } else {
            flash(req, "danger", null, "Failed to insert record");
            render(req, res, next, viewOne, {brand: req.body, mode: "add", errors: {}});
        }
    } catch (error) {
        renderError(req, res, next, error);
    }
};

exports.edit_brand = async (req, res, next)=> {
    try {
        const errors = {};
        const id = req.params.id;
        const { name, delete_thumb } = req.body;
        let thumbnail = null;

        const rerenderEditPage = ()=>{
            this.show_edit_brand(req, res, next, errors, req.body);
        };

        v.vEmpty(errors, name, "name");
        await v.vBrandExist("name", errors, name);
        
        if(req.files && !isEmpty(req.files) && req.files.thumbnail_file){
            thumbnail = req.files.thumbnail_file;
            v.vIsJpegFile("thumbnail_url", errors, thumbnail);
        }

        if(!isEmpty(errors)){
            rerenderEditPage();
            return;
        }

        const brand = await brandModel.findOneById(id);

        if (thumbnail) {
            const thumbUpdated = await brand.updateThumb(thumbnail);
            if(!thumbUpdated){
                errors["thumbnail_url"] = "Uploaded failed, please try again";
                rerenderEditPage();
                return;
            }
        } else if (delete_thumb){
            await brand.deleteThumb();
        }

        brand.updateName(name);

        if(brand.save()){
            flash(req, "success", null, "Record updated");
            res.redirect(urlShowBrandDetails(id));
        } else {
            flash(req, "danger", null, "Failed to update record");
            rerenderEditPage();
            return;
        }
    } catch (error) {
        renderError(req, res, next, error);
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
        res.status(500).json(error);
    }  
}