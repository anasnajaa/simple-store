const knex = require('knex')(require('../config/db-connect'));

const isEmpty = (val)=>{
    return val === undefined || val === null || val === "";
};

const buildModel = (areas)=>{
    areas.forEach(area=>{
        area.updateName = (newName)=>{
            area.name = newName;
        };

        area.save = async ()=>{
            return await this.updateOne(area.id, area.name);
        };
    });

    return areas;
}

exports.getCountByQuery = async (query)=>{
    try {
        const filterby = isEmpty(query.filterby) ? "name" : query.filterby;
        const filtertext = isEmpty(query.filtertext) ? "" : query.filtertext.toLowerCase();
        const rows = await knex('areas')
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
        const filterby = isEmpty(query.filterby)? "name" : query.filterby;
        const filtertext = isEmpty(query.filtertext) ? "" : query.filtertext.toLowerCase();
        const areasList = await knex('areas')
        .select('areas.id', 
        'areas.name_en',
        'areas.name_ar',
        'areas.date_created', 
        'areas.date_updated')
        .select(knex.raw(`count(*) OVER() AS count`))
        .where(knex.raw(`LOWER(areas.${filterby}) LIKE ?`, `%${filtertext}%`))
        .offset((query.page-1)*query.recordsperpage)
        .limit(query.recordsperpage)
        .orderBy("areas."+query.orderby, query.ordertype);

        if(areasList && areasList.length > 0){
            const count = areasList[0].count;
            return { records: buildModel(areasList), count }
        } else {
            return { records: [], count: 0 };
        }
    } catch (error) {
        console.log(error);
        return { records: [], count: 0 };
    }
};

exports.findOneById = async (id)=>{
    try {
        const rows = await knex('areas')
        .select('areas.id', 
        'areas.name_en', 
        'areas.name_ar', 
        'areas.date_created', 
        'areas.date_updated')
        .where({'areas.id': id});
        
        if(rows && rows.length > 0){
            return buildModel(rows)[0];
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
        const rows = await knex('areas')
        .select('id', 'name_en', 'name_ar', 'date_created', 'date_updated')
        .where(knex.raw(`LOWER(areas.name_en) = ?`, name))
        .orWhere(knex.raw(`LOWER(areas.name_ar) = ?`, name));

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

exports.updateOne = async (id, name_en, name_ar)=>{
    try {
        const rows = await knex('areas')
        .update({
            name_en,
            name_ar,
            date_updated: "now()"
          })
        .where({'areas.id': id})
        .returning('*');

        if(rows && rows.length > 0){
            return this.findOneById(id);
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.insertOne = async (name_en, name_ar)=>{
    try {
        const rows = await knex('areas')
        .insert({
            name_en,
            name_ar,
            date_created: new Date()
          })
        .returning('*');

        if(rows && rows.length > 0){
            return this.findOneById(id);
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
        const affectedRows = await knex('areas')
        .where({'areas.id': id})
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