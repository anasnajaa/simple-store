const knex = require('knex')(require('../config/db-connect'));
const awsS3 = require('../util/awsS3');

const isEmpty = (val)=>{
    return val === undefined || val === null || val === "";
};

const getIds = (rows)=>{
    const a = [];
    for(let i in rows){ a.push(rows[i].id); }
    return a;
};

const buildModel = (brands)=>{
    const hasItem = (list, item)=>{
        for(let i in list){
            if(list[i].id === item.id){ return true; }
        }
        return false;
    };

    const uBrands = [];

    brands.forEach(b=>{
        if(!hasItem(uBrands, b)){
            uBrands.push({...b});
        }
    });

    for(let i in uBrands){
        // remove redundant keys
        delete uBrands[i].category_id;
        delete uBrands[i].category_name;
        delete uBrands[i].brand_category_id;
        delete uBrands[i].category_thumbnail_url;
        uBrands[i].categories = [];
        for(let k in brands){
            if(brands[k].id === uBrands[i].id && brands[k].category_id !== null){
                uBrands[i].categories.push({
                    id: brands[k].category_id,
                    brand_category_id: brands[k].brand_category_id,
                    name: brands[k].category_name,
                    thumbnail_url: brands[k].category_thumbnail_url
                });
            }
        }
    }

    uBrands.forEach(brand=>{
        brand.thumbExist = ()=> {
            return brand.thumbnail !== null && brand.thumbnail !== "";
        };

        brand.deleteThumb = async ()=> {
            if(brand.thumbExist()){
                const filesDelete = await awsS3.deleteFiles([brand.thumbnail]);
                if(filesDelete){
                    brand.thumbnail = null;
                    brand.thumbnail_url = null;
                }
            }
        };

        brand.updateThumb = async (file)=>{
            let deleteRes = {};
            if(brand.thumbExist()){ deleteRes = await brand.deleteThumb(); }

            if(deleteRes === null){ return false; }

            const awsFile = await awsS3.uploadFile(file, null);

            if(awsFile){
                brand.thumbnail_url = awsFile.Location;
                brand.thumbnail = awsFile.fileName;
                return true;
            } else {
                return false;
            }
        };

        brand.updateName = (newName)=>{
            brand.name = newName;
        };

        brand.save = async ()=>{
            return await this.updateOne(brand.id, brand.name, brand.thumbnail);
        };

        if(brand.thumbExist()){
            brand.thumbnail_url = awsS3.fileUrl(brand.thumbnail);
        } 
    });

    return uBrands;
}

exports.getCountByQuery = async (query)=>{
    try {
        const filterby = isEmpty(query.filterby) ? "name" : query.filterby;
        const filtertext = isEmpty(query.filtertext) ? "" : query.filtertext.toLowerCase();
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
        const filterby = isEmpty(query.filterby)? "name" : query.filterby;
        const filtertext = isEmpty(query.filtertext) ? "" : query.filtertext.toLowerCase();
        const brandsList = await knex('brands')
        .select('brands.id', 
        'brands.name',
        'brands.date_created', 
        'brands.date_updated')
        .select(knex.raw(`count(*) OVER() AS count`))
        .where(knex.raw(`LOWER(brands.${filterby}) LIKE ?`, `%${filtertext}%`))
        .offset((query.page-1)*query.recordsperpage)
        .limit(query.recordsperpage)
        .orderBy("brands."+query.orderby, query.ordertype);

        if(brandsList && brandsList.length > 0){
            const count = brandsList[0].count;
            const r = await knex('brands')
            .select('brands.id', 
            'brands.name', 
            'brands.thumbnail', 
            'brands_categories.id AS brand_category_id',
            'brands_categories.category_id',
            'categories.name AS category_name', 
            'categories.thumbnail_url AS category_thumbnail_url', 
            'brands.date_created', 
            'brands.date_updated')
            .leftJoin('brands_categories', 'brands_categories.brand_id', '=', 'brands.id')
            .leftJoin('categories', 'categories.id', '=', 'brands_categories.category_id')
            .whereIn('brands.id', getIds(brandsList))
            .orderBy("brands."+query.orderby, query.ordertype);

            if(r && r.length > 0){
                return { records: buildModel(r), count }
            } else {
                return { records: [], count: 0 };
            }
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
        const rows = await knex('brands')
        .select('brands.id', 
        'brands.name', 
        'brands.thumbnail', 
        'brands_categories.id AS brand_category_id',
        'brands_categories.category_id',
        'categories.name AS category_name', 
        'categories.thumbnail_url AS category_thumbnail_url', 
        'brands.date_created', 
        'brands.date_updated')
        .select(knex.raw(`${1} AS count`))
        .leftJoin('brands_categories', 'brands_categories.brand_id', '=', 'brands.id')
        .leftJoin('categories', 'categories.id', '=', 'brands_categories.category_id')
        .where({'brands.id': id});
        
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
        const rows = await knex('brands')
        .select('id', 'name', 'thumbnail', 'date_created', 'date_updated')
        .where(knex.raw(`LOWER(brands.name) = ?`, name))

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

exports.updateOne = async (id, name, thumbnail)=>{
    try {
        const rows = await knex('brands')
        .update({
            name,
            thumbnail,
            date_updated: "now()"
          })
        .where({'brands.id': id})
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

exports.insertOne = async (name, thumbnail)=>{
    try {
        const rows = await knex('brands')
        .insert({
            name,
            thumbnail,
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