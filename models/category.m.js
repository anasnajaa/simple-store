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

const buildModel = (categories)=>{ 
    const uCategories = [];

    const hasItem = (list, item)=>{
        for(let i in list){
            if(list[i].id === item.id){ return true; }
        }
        return false;
    };

    categories.forEach(b=>{
        if(!hasItem(uCategories, b)){
            uCategories.push({...b});
        }
    });

    uCategories.forEach(category=>{
        category.thumbExist = ()=> {
            return category.thumbnail !== null && category.thumbnail !== "";
        };
    
        if(category.thumbExist()){
            category.thumbnail_url = awsS3.fileUrl(category.thumbnail);
        }
    });

    return uCategories;
}

exports.findAll = async ()=>{
    try {
        const categoriesList = await knex('categories')
        .select('id', 'name', 'thumbnail', 'date_created', 'date_updated')
        .select(knex.raw(`count(*) OVER() AS count`));

        if(categoriesList && categoriesList.length > 0){
            const count = categoriesList[0].count;
            return { records: buildModel(categoriesList), count };
        } else {
            return { records: [], count: 0 };
        }
    } catch (error) {
        console.log(error);
        return { records: [], count: 0 };
    }
};