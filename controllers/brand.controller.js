const { render, flash, renderError, getFilterQuery, buildPaginationQuery, parseFilterQuery } = require('../util/express');
const { logError } = require('../util/errorHandler');
const brandModel = require('../models/brand.model');
const categoryModel = require('../models/category.model');
const v = require('../validators');
const { isEmpty } = require('lodash');
const e = require('express');
const awsS3Helper = require('../util/awsS3');

const viewList = 'admin.brand.list.ejs';
const viewEdit = 'admin.brand.edit.ejs';
const viewAddBrandCategory = 'admin.brand.categories.add.ejs';
const viewOne = 'admin.brand.details.ejs';
const urlShowBrandDetails = (id)=> `/admin/brands/${id}`;
const urlShowEditBrand = (id)=> `/admin/brands/${id}/edit`;
const urlShowItemsList = ()=> `/admin/brands/`;

exports.show_brand = async (req, res, next)=>{
    try {
        const id = req.params.id;
        const brand = await brandModel.findOneById(id);
        if(brand) {
            render(req, res, next, viewOne, {
                brand, 
                errors: {},
                crumbs: [
                    {title: "home", url:"/"}, 
                    {title: "admin", url:"/admin"},
                    {title: "brands", url: "/admin/brands"},
                    {title: brand.name, url: "/admin/brands/"+brand.id, active: true}
                ]
            });
        } else {
            throw(new Error("Item not found"));
        }
    } catch (error) {
        renderError(req, res, next, error);
    }
};

exports.show_brands = async (req, res, next)=>{
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

exports.show_add_brand = async (req, res, next)=> {
    try {
        const id = req.params.id;
        const brand = await brandModel.findOneById(id);

        if(brand) {
            render(req, res, next, viewEdit, {brand, mode: "add", errors: {}});
        } else {
            new Error("Item not found")
        }
    } catch (error) {
        renderError(req, res, next, error);
    }
};

exports.add_brand = async (req, res, next)=>{
    try {
        const errors = {};
        const {name, thumbnail_url} = req.body;

        v.vEmpty(errors, name, "name");
        v.vBrandExist(errors, name, "name");
    
        if(!isEmpty(errors)){
            render(req, res, next, viewEdit, {brand: req.body, mode: "add", errors});
            return;
        }

        const brand = await brandModel.insertOne(name, thumbnail_url);

        if(brand){
            flash(req, "success", null, "Record added");
            req.redirect(urlShowItemsList());
        } else {
            flash(req, "danger", null, "Failed to insert record");
            render(req, res, next, viewEdit, {brand: req.body, mode: "add", errors: {}});
        }
    } catch (error) {
        renderError(req, res, next, error);
    }
};

exports.show_edit_brand = async (req, res, next, errors, formData)=> {
    try {
        const id = req.params.id;
        const brand = await brandModel.findOneById(id);
        const categories = await categoryModel.findAll();

        if(brand) {
            render(req, res, next, viewEdit, {
                brand, 
                mode: "edit",
                categories,
                errors: errors || {},
                formData: formData || {},
                crumbs: [
                    {title: "home", url:"/"}, 
                    {title: "admin", url:"/admin"},
                    {title: "brands", url: "/admin/brands"},
                    {title: brand.name, url: `/admin/brands/${brand.id}`},
                    {title: "edit", url: `/admin/brands/${brand.id}/edit`, active: true}
                ]});
        } else {
            throw(new Error("Item not found"));
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

exports.show_add_brand_category = async (req, res, next, errors, formData)=> {
    try {
        const id = req.params.id;
        const brand = await brandModel.findOneById(id);
        const categories = await categoryModel.findAll();

        const catExist = (id)=> {
            for(let i in brand.categories){
                if(brand.categories[i].id === id){
                    return true;
                }
            }
            return false;
        }
    
        if(brand && categories) {
            // show only categories that are not added
            const filteredCategories = [];
            categories.forEach(cat=>{
                if(!catExist(cat.id)){
                    filteredCategories.push(cat);
                }
            });
    
            render(req, res, next, viewAddBrandCategory, {
                brand, 
                categories: filteredCategories,
                errors: errors || {},
                formData: formData || {},
                crumbs: [
                    {title: "home", url:"/"}, 
                    {title: "admin", url:"/admin"},
                    {title: "brands", url: "/admin/brands"},
                    {title: brand.name, url: `/admin/brands/${brand.id}`},
                    {title: "add category", url: `/admin/brands/${brand.id}/add-category`, active: true}
                ]});
        } else {
            throw(new Error("Item not found"));
        }
    } catch (error) {
        renderError(req, res, next, error);
    }
}

exports.add_brand_category = async (req, res, next)=> {
    try {
        const errors = {};
        const brandId = req.params.id;
        const {category_id} = req.body;

        v.vEmpty(errors, category_id || "", "category_id");

        if(!isEmpty(errors)){
            this.show_add_brand_category(req, res, next, errors, req.body);
            return;
        }

        const brandCategory = await brandModel.insertBrandCategory(brandId, category_id);
        
        if(brandCategory){
            flash(req, "success", null, "Category added");
            res.redirect(urlShowBrandDetails(brandId));
        } else {
            flash(req, "danger", null, "Failed to add record");
            this.show_add_brand_category(req, res, next, {}, req.body);
        }
    } catch (error) {
        renderError(req, res, next, error);
    }
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

exports.api_delete_brand_category = async (req, res, next) => {
    try {
        const id = req.params.id;
        const deleted = await brandModel.deleteBrandCategory(id);
        res.json({ deleted });
    } catch (error) {
        logError(error);
        res.json({error});
    }
};