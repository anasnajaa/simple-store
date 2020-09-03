const knex = require('knex')(require('../config/db-connect'));

exports.findAll = async ()=>{
    try {
        const rows = await knex('categories')
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