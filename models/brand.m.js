const knex = require('knex')(require('../config/db-connect'));
const awsS3 = require('../util/awsS3');
const queryHelper = require('../util/knexQueryHelper');

const isEmpty = (val)=>{
    return val === undefined || val === null || val === "";
};

const buildModel = (brands, mode)=>{
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
        delete uBrands[i].category_thumbnail;
        uBrands[i].categories = [];
        for(let k in brands){
            if(brands[k].id === uBrands[i].id && brands[k].category_id !== null){
                const category = {
                    id: brands[k].category_id,
                    brand_category_id: brands[k].brand_category_id,
                    name: brands[k].category_name,
                    thumbnail: brands[k].category_thumbnail
                };

                category.thumbExist = ()=> {
                    return category.thumbnail !== null && category.thumbnail !== "";
                };

                if(category.thumbExist()){
                    category.thumbnail_url = awsS3.fileUrl(category.thumbnail);
                } 

                uBrands[i].categories.push(category);
            }
        }
    }

    uBrands.forEach(brand=>{
        brand.thumbExist = ()=> {
            return brand.thumbnail !== null && brand.thumbnail !== "";
        };

        if(brand.thumbExist()){
            brand.thumbnail_url = awsS3.fileUrl(brand.thumbnail);
        } 
    });

    if(mode === "simple"){
        return uBrands;
    }

    // attach advanced helper methods
    uBrands.forEach(brand=>{
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

// exports.findAllByQuery = async (query)=>{
//     try {
//         const filterby = isEmpty(query.filterby)? "name" : query.filterby;
//         const filtertext = isEmpty(query.filtertext) ? "" : query.filtertext.toLowerCase();
//         const brandsList = await knex('brands')
//         .select('brands.id', 
//         'brands.name',
//         'brands.date_created', 
//         'brands.date_updated')
//         .select(knex.raw(`count(*) OVER() AS count`))
//         .where(knex.raw(`LOWER(brands.${filterby}) LIKE ?`, `%${filtertext}%`))
//         .offset((query.page-1)*query.recordsperpage)
//         .limit(query.recordsperpage)
//         .orderBy("brands."+query.orderby, query.ordertype);

//         if(brandsList && brandsList.length > 0){
//             const count = brandsList[0].count;
//             const r = await knex('brands')
//             .select('brands.id', 
//             'brands.name', 
//             'brands.thumbnail', 
//             'brands_categories.id AS brand_category_id',
//             'brands_categories.category_id',
//             'categories.name AS category_name', 
//             'categories.thumbnail AS category_thumbnail', 
//             'brands.date_created', 
//             'brands.date_updated')
//             .leftJoin('brands_categories', 'brands_categories.brand_id', '=', 'brands.id')
//             .leftJoin('categories', 'categories.id', '=', 'brands_categories.category_id')
//             .whereIn('brands.id', getIds(brandsList))
//             .orderBy("brands."+query.orderby, query.ordertype);

//             if(r && r.length > 0){
//                 return { records: buildModel(r), count };
//             } else {
//                 return { records: [], count: 0 };
//             }
//         } else {
//             return { records: [], count: 0 };
//         }
//     } catch (error) {
//         console.log(error);
//         return { records: [], count: 0 };
//     }
// };

exports.findAllAdvanced = async (query)=>{
    try {
        const fieldsAlias = {
            name: "brands.name",
            categories: "categories.name",
            dateCreated: "brands.date_created",
            dateUpdated: "brands.date_updated"
        }

        const dbMainQuery = knex('brands');

        dbMainQuery
        .leftJoin('brands_categories', 'brands_categories.brand_id', '=', 'brands.id')
        .leftJoin('categories', 'categories.id', '=', 'brands_categories.category_id');

        queryHelper.applyWhereConditionsFromQuery(query, fieldsAlias, null, dbMainQuery);
        
        dbMainQuery
        .offset((query.pagenum)*query.pagesize)
        .limit(query.pagesize);

        queryHelper.applyOrderConditionsFromQuery(query, fieldsAlias, null, dbMainQuery);

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

        queryHelper.applyOrderConditionsFromQuery(query, fieldsAlias, null, dbSubQuery);

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

        return { count, records: buildModel(finalBrandsList, "simple") };
    } catch (error) {
        console.log(error);
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