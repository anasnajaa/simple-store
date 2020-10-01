const knex = require('knex')(require('../config/db-connect'));
const awsS3 = require('../util/awsS3');
const queryHelper = require('../util/knexQueryHelper');
const {merge} = require('lodash');
const {databaseError} = require('../util/errorHandler')

exports.buildModel = (brands, mode)=>{
    const uBrands = []; 

    // extract unique brands from tabular data
    brands.forEach(b=>{
        if(!uBrands.find(x => x.id === b.id)){
            uBrands.push({...b});
        }
    });

    // transform tabular data into JSON friendly format
    for(let i in uBrands){
        // remove redundant keys
        delete uBrands[i].category_id;
        delete uBrands[i].category_name;
        delete uBrands[i].brand_category_id;
        delete uBrands[i].category_thumbnail;
        uBrands[i].categories = [];
        for(let k in brands){
            if(brands[k].id === uBrands[i].id && brands[k].category_id !== null){
                uBrands[i].categories.push({
                    id: brands[k].category_id,
                    brand_category_id: brands[k].brand_category_id,
                    name: brands[k].category_name,
                    thumbnail: brands[k].category_thumbnail
                });
            }
        }
    }

    // attach helper methods and computed data
    uBrands.forEach(brand=>{
        brand.thumbExist = ()=> {
            return brand.thumbnail !== null && brand.thumbnail !== "";
        };

        if(brand.thumbExist()){
            brand.thumbnail_url = awsS3.fileUrl(brand.thumbnail);
        } 

        brand.categories.forEach(category=>{
            category.thumbExist = ()=> {
                return category.thumbnail !== null && category.thumbnail !== "";
            };

            if(category.thumbExist()){
                category.thumbnail_url = awsS3.fileUrl(category.thumbnail);
            } 
        })
    });

    if(mode === "simple"){
        return uBrands;
    }

    // attach advanced helper methods (for crud operations)
    uBrands.forEach(brand=>{
        brand.deleteThumb = async ()=> {
            if(brand.thumbExist()){
                const filesDelete = await awsS3.deleteFiles([brand.thumbnail]);
                if(filesDelete){
                    brand.thumbnail_url = null;
                    brand.thumbnail = null;
                    return true;
                }
                return false;
            }
            return true;
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
    });

    return uBrands;
}

exports.findAllAdvanced = async (query)=>{
    try {
        const fieldsAlias = {
            name: "brands.name",
            category: "categories.name",
            dateCreated: "brands.date_created",
            dateUpdated: "brands.date_updated"
        }

        const offset = query.pagenum*query.pagesize;

        const dbMainQuery = knex('brands');

        dbMainQuery
        .leftJoin('brands_categories', 'brands_categories.brand_id', '=', 'brands.id')
        .leftJoin('categories', 'categories.id', '=', 'brands_categories.category_id');

        queryHelper.applyWhereConditionsFromQuery(query, fieldsAlias, null, dbMainQuery);
        
        dbMainQuery
        .offset(offset)
        .limit(query.pagesize);

        queryHelper.applyOrderConditionsFromQuery(query, fieldsAlias, ["category"], dbMainQuery);

        dbMainQuery.groupBy('brands.id', 'brands.name');
        
        const mainBrandsList = await dbMainQuery
        .select('brands.id', 'brands.name')
        .select(knex.raw(`count(*) OVER() AS count`));

        if(mainBrandsList === null || mainBrandsList.length === 0){
            return { count: 0, records: [] };
        }

        // second query
        const count = parseInt(mainBrandsList[0].count);
        const dbSubQuery = knex('brands');

        dbSubQuery
        .leftJoin('brands_categories', 'brands_categories.brand_id', '=', 'brands.id')
        .leftJoin('categories', 'categories.id', '=', 'brands_categories.category_id')
        .whereIn('brands.id', mainBrandsList.map(x => x.id));

        queryHelper.applyOrderConditionsFromQuery(query, fieldsAlias, [], dbSubQuery);

        const finalBrandsList = await dbSubQuery
        .select('brands.id', 
        'brands.name', 
        'brands.thumbnail', 
        'brands_categories.id AS brand_category_id',
        'brands_categories.category_id',
        'categories.name AS category_name', 
        'categories.thumbnail AS category_thumbnail', 
        'brands.date_created', 
        'brands.date_updated');

        if(finalBrandsList === null || finalBrandsList.length === 0){
            return { count: 0, records: [] };
        }
        let aggregatedRecords = this.buildModel(finalBrandsList, "simple");
        let tempCount = 0;
        aggregatedRecords = aggregatedRecords.map(x => {
            return merge({index: offset + ++tempCount}, x);
        });
        return { count, records: aggregatedRecords};
    } catch (error) {
        databaseError(error);
        return { count: 0, records: [] };
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
        'categories.thumbnail AS category_thumbnail', 
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
        databaseError(error);
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
        databaseError(error);
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
        databaseError(error);
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
        databaseError(error);
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
        databaseError(error);
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
        databaseError(error);
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
        databaseError(error);
        return 0;
    }
};