const knex = require('knex')(require('../config/db-connect'));

exports.findAll = async ()=>{
    try {
        const rows = await knex('brands')
        .select('id', 'name', 'thumbnail_url', 'date_created', 'date_updated');

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
        .select('id', 'name', 'thumbnail_url', 'date_created', 'date_updated')
        .where({'brands.id': id});

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
        const rows = await knex('brands')
        .where({'brands.id': id})
        .del();

        if(rows && rows.length > 0){
            return rows;
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
};
