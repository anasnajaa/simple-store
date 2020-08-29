const { render, flash, renderError } = require('../util/express');
const { logError } = require('../util/errorHandler');
const brandModel = require('../models/brand.model');
const v = require('../validators');
const { isEmpty } = require('lodash');
const e = require('express');

const viewList = 'admin.brand.list.ejs';
const viewEdit = 'admin.brand.edit.ejs';
const viewOne = 'admin.brand.details.ejs';
const urlShowEditItem = (id)=> `/admin/brands/${id}/edit`;
const urlShowItemsList = ()=> `/admin/brands/`;

exports.show_brand = async (req, res, next)=>{
    try {
        const id = req.params.id;
        const brand = await brandModel.findOne(id);

        if(brand) {
            const data = {brand, errors: {}};
            render(req, res, next, viewOne, data);
        } else {
            new Error("Item not found")
        }
    } catch (error) {
        renderError(req, res, next, error);
    }
};

exports.show_brands = async (req, res, next)=>{
    try {
        const brands = await brandModel.findAll();
        render(req, res, next, viewList, {brands});
    } catch (error) {
        renderError(req, res, next, error);
    }
};

exports.show_edit_brand = async (req, res, next)=> {
    try {
        const id = req.params.id;
        const brand = await brandModel.findOne(id);

        if(brand) {
            const data = {brand, errors: {}};
            render(req, res, next, viewEdit, data);
        } else {
            new Error("Item not found")
        }
    } catch (error) {
        renderError(req, res, next, error);
    }
};

exports.submit_brand = async (req, res, next)=>{
    try {
        const errors = {};
        const {name, thumnail_url} = req.body;

        v.vEmpty(errors, name, "name");
        v.vBrandExist(errors, name, "name");
    
        if(!isEmpty(errors)){
            res.render(req, res, next, viewEdit, {brand: req.body, errors});
            return;
        }

        const brand = await brandModel.insertOne(name, thumnail_url);

        if(brand){
            flash(req, "success", null, "Record added");
            req.redirect(urlShowItemsList());
        } else {
            flash(req, "danger", null, "Failed to insert record");
            res.render(req, res, next, viewEdit, {brand: req.body, errors: {}});
        }
    } catch (error) {
        renderError(req, res, next, error);
    }
};

exports.edit_brand = async (req, res, next)=> {
    try {
        const errors = {};
        const id = req.params.id;
        const {brand_name, thumnail_url} = req.body;

        v.vEmpty(errors, brand_name, "brand_name");
        v.vBrandExist(errors, brand_name, "brand_name");

        if(!isEmpty(errors)){
            res.render(req, res, next, viewEdit, {brand: req.body, errors});
            return;
        }

        const brand = brandModel.updateOne(id, brand_name, thumnail_url);

        if(brand){
            flash(req, "success", null, "Record updated");
            res.render(req, res, next, viewEdit, {brand, errors: {}});
        } else {
            flash(req, "danger", null, "Failed to update record");
            res.render(req, res, next, viewEdit, {brand, errors: {}});
        }
    } catch (error) {
        renderError(req, res, next, error);
    }
};

exports.delete_brand = async (req, res, next) => {
    try {
        const id = req.params.id;
        const recordsDeleted = brandModel.deleteOne(id);
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
        const deleted = brandModel.deleteOne(id);
        res.json({ deleted });
    } catch (error) {
        logError(error);
        res.json({error});
    }
};