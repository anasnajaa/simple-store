const knex = require('knex')(require('../config/db-connect'));

exports.getCountByQuery = async (query)=>{
    try {
        const filterby = query.filterby === undefined || 
        query.filterby === null || 
        query.filterby === "" ? "name" : query.filterby;
        const filtertext = query.filtertext === undefined || 
        query.filtertext === null || 
        query.filtertext === "" ? "" : query.filtertext.toLowerCase();
        const rows = await knex('brands')
        .where(
            knex.raw(`LOWER(${filterby}) LIKE ?`, `%${filtertext}%`)
        )
        .count('id');

        if(rows && rows.length > 0){
            return rows[0].count;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        return 0;
    }
};

exports.findAllByQuery = async (query)=>{
    try {
        
        const filterby = query.filterby === undefined || 
        query.filterby === null || 
        query.filterby === "" ? "name" : query.filterby;
        const filtertext = query.filtertext === undefined || 
        query.filtertext === null || 
        query.filtertext === "" ? "" : query.filtertext.toLowerCase();
        const rows = await knex('brands')
        .select(
            knex.raw(`id, name, thumbnail_url, date_created, date_updated, count(*) OVER() AS count`)
        )
        //.select('id', 'name', 'thumbnail_url', 'date_created', 'date_updated')
        .where(
            knex.raw(`LOWER(${filterby}) LIKE ?`, `%${filtertext}%`)
        )
        .offset((query.page-1)*query.recordsperpage)
        .limit(query.recordsperpage)
        .orderBy(query.orderby, query.ordertype);

        if(rows && rows.length > 0){
            return rows;
        } else {
            return [];
        }
    } catch (error) {
        console.log(error);
        return [];
    }
};

exports.findOneById = async (id)=>{
    try {
        const rows = await knex('brands')
        .select('brands.id', 
        'brands.name', 
        'brands.thumbnail_url', 
        'brands_categories.id AS brand_category_id',
        'brands_categories.category_id',
        'categories.name AS category_name', 
        'categories.thumbnail_url AS category_thumbnail_url', 
        'brands.date_created', 
        'brands.date_updated')
        .leftJoin('brands_categories', 'brands_categories.brand_id', '=', 'brands.id')
        .leftJoin('categories', 'categories.id', '=', 'brands_categories.category_id')
        .where({'brands.id': id});
        
        if(rows && rows.length > 0){
            const brand = {...rows[0]};
            delete brand.category_id;
            delete brand.category_name;
            delete brand.brand_category_id;
            delete brand.category_thumbnail_url;
            brand.categories = [];
            if(rows[0].category_id !== null){
                rows.forEach(row=>{
                    brand.categories.push({
                        id: row.category_id,
                        brand_category_id: row.brand_category_id,
                        name: row.category_name,
                        thumbnail_url: row.category_thumbnail_url
                    });
                });
            }
            return brand;
        } else {
            return null;
        }
    } catch (error) {
        console.log( error);
        return null;
    }
};

exports.findOneByName = async (name)=>{
    try {
        const rows = await knex('brands')
        .select('id', 'name', 'thumbnail_url', 'date_created', 'date_updated')
        .where({'brands.name': name});

        if(rows && rows.length > 0){
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.updateOne = async (id, name, thumbnail_url)=>{
    try {
        const rows = await knex('brands')
        .update({
            name,
            thumbnail_url,
            date_updated: "now()"
          })
        .where({'brands.id': id})
        .returning('*');

        if(rows && rows.length > 0){
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.insertBrandCategory = async (brandId, categoryId)=>{
    try {
        const rows = await knex('brands_categories')
        .insert({
            category_id: categoryId,
            brand_id: brandId
          })
        .returning('*');

        if(rows && rows.length > 0){
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.insertOne = async (name, thumbnail_url)=>{
    try {
        const rows = await knex('brands')
        .insert({
            name,
            thumbnail_url,
            date_created: new Date()
          })
        .returning('*');

        if(rows && rows.length > 0){
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.deleteOne = async (id)=>{
    try {
        const affectedRows = await knex('brands')
        .where({'brands.id': id})
        .del();

        if(affectedRows && rows.length > 0){
            return affectedRows;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        return 0;
    }
};

exports.deleteBrandCategory = async (id)=>{
    try {
        const affectedRows = await knex('brands_categories')
        .where({'brands_categories.id': id})
        .del();

        if(affectedRows){
            return affectedRows;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        return 0;
    }
};