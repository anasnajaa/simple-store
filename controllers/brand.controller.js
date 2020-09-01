const { render, flash, renderError, getFilterQuery, buildPaginationQuery } = require('../util/express');
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
        const brand = await brandModel.findOneById(id);

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
        let query = {};
        if(req.method === "POST" && req.body.submit === "apply"){
            query = getFilterQuery(req.body);
            res.redirect('/admin/brands' + buildPaginationQuery(query, 1));
            return;
        } else if(req.method === "POST" && req.body.submit === "reset"){
            query = getFilterQuery({});
        } else {
            query = getFilterQuery(req.query);
        }
        const brands = await brandModel.findAllByQuery(query);
        const count = brands && brands.length > 0 ? brands[0].count : 0;
        render(req, res, next, viewList, {
            brands, 
            formObject: {
                querySubmitUrl: "/admin/brands",
                pagesCount: Math.ceil(count/query.recordsperpage),
                query,
                addButton: { visible: true, enabled: true, url: "/admin/brands/add" },
                filterButton: { visible: true, enabled: true },
                filterFields: [
                    { title:"Brand Name", value: "name"}
                ],
            },
            crumbs: [
                {title: "home", url:"/"}, 
                {title: "admin", url:"/admin"},
                {title: "brands", url: "/admin/brands", active: true}
            ]});
    } catch (error) {
        renderError(req, res, next, error);
    }
};

exports.show_edit_brand = async (req, res, next)=> {
    try {
        const id = req.params.id;
        const brand = await brandModel.findOneById(id);

        if(brand) {
            render(req, res, next, viewEdit, {brand, mode: "edit", errors: {}});
        } else {
            new Error("Item not found")
        }
    } catch (error) {
        renderError(req, res, next, error);
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

exports.edit_brand = async (req, res, next)=> {
    try {
        const errors = {};
        const id = req.params.id;
        const {name, thumbnail_url} = req.body;

        v.vEmpty(errors, name, "name");
        v.vBrandExist(errors, name, "name");

        if(!isEmpty(errors)){
            render(req, res, next, viewEdit, {brand: req.body, mode: "edit", errors});
            return;
        }

        const brand = await brandModel.updateOne(id, name, thumbnail_url);
        console.log(brand);
        if(brand){
            flash(req, "success", null, "Record updated");
            render(req, res, next, viewEdit, {brand, mode: "edit", errors: {}});
        } else {
            flash(req, "danger", null, "Failed to update record");
            render(req, res, next, viewEdit, {brand, mode: "edit", errors: {}});
        }
    } catch (error) {
        renderError(req, res, next, error);
    }
};

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