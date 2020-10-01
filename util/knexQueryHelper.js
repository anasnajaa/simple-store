exports.parseFilterQuery = (query)=>{
    let { pagenum, 
        pagesize, 
        orderFields,
        filterFields } = query;
    pagenum = parseInt(pagenum) || 0;
    pagesize = parseInt(pagesize) || 5;
    return {
        pagenum,
        pagesize,
        orderFields,
        filterFields
    };
}

const parseFilterField = (filterField, knexBuilder)=>{
    const {field, filters} = filterField;
    
    for(let k in filters){
        const {condition, type, value, operator} = filters[k];
        if(type === "string"){
            if (condition === "contains"){
                if(operator === "or"){
                    knexBuilder.orWhereRaw(`LOWER(${field}) LIKE ?`, `%${value}%`);
                } else if(operator === "and"){
                    knexBuilder.andWhereRaw(`LOWER(${field}) LIKE ?`, `%${value}%`);
                }
            }
        } 
        else if (type === "date"){
            if(condition === "greater_or_equal"){
                if(operator === "or"){
                    knexBuilder.orWhereRaw(`${field} >= ?`, new Date(value).toUTCString());
                } else if(operator === "and"){
                    knexBuilder.andWhereRaw(`${field} >= ?`, new Date(value).toUTCString());
                }
            } else if (condition === "less_or_equal"){
                if(operator === "or"){
                    knexBuilder.orWhereRaw(`${field} <= ?`, new Date(value).toUTCString());
                } else if(operator === "and"){
                    knexBuilder.andWhereRaw(`${field} <= ?`, new Date(value).toUTCString());
                }
            }
        }
    }
};

const parseOrderField = (orderField, knexObject)=>{
    const {field, order} = orderField;
    knexObject.orderBy(field, order);
};

exports.applyWhereConditionsFromQuery = (query, transformFields, ignoreFields, knexObject) => {
    if(query.filterFields && query.filterFields.length > 0){
        const ffs = query.filterFields;
        for(let i in ffs){
            const ff = ffs[i];
            if(ignoreFields && 
                ignoreFields.length > 0 &&
                ignoreFields.indexOf(ffs[i].field) > -1){break;}

            knexObject.where((builder) => {
                ff.field = transformFields[ff.field] || ff.field;
                parseFilterField(ff, builder);
            });
        }
    }
};

exports.applyOrderConditionsFromQuery = (query, transformFields, ignoreFields, knexObject) => {
    if(query.orderFields && query.orderFields.length > 0){
        const ofs = query.orderFields;
        for(let i in ofs){
            const of = ofs[i];

            if(ignoreFields && 
                ignoreFields.length > 0 &&
                ignoreFields.indexOf(of.field) > -1){break;}
                
            of.field = transformFields[of.field] || of.field;
            parseOrderField(of, knexObject);
        }
    }
}