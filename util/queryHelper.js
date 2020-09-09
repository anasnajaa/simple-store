

exports.parseWhereQueries = (query, transformFields, ignoredFields, knexBuilder)=>{
    if(query.filterGroups && query.filterGroups.length > 0){
        const fgs = query.filterGroups;
        for(let i in fgs){
            const filterGroup = fgs[i];
            let fieldName = filterGroup.field;
            const filters = filterGroup.filters;

            if(ignoredFields.indexOf(fieldName) > -1){
                break;
            }
            
            fieldName = transformFields[fieldName] || fieldName;

            for(let k in filters){
                const {condition, type, value, operator} = filters[k];
                if(type === "stringfilter"){
                    if (condition === "CONTAINS"){
                        if(operator === "or"){
                            knexBuilder.andWhereRaw(`LOWER(${fieldName}) LIKE ?`, `%${value}%`);
                        } else if(operator === "and"){
                            knexBuilder.andWhereRaw(`LOWER(${fieldName}) LIKE ?`, `%${value}%`);
                        }
                    }
                } else if (type === "datefilter"){
                    console.log(value);
                    if(condition === "GREATER_THAN_OR_EQUAL"){
                        if(operator === "or"){
                            knexBuilder.andWhereRaw(`${fieldName} >= ?`, new Date(value).toUTCString());
                        } else if(operator === "and"){
                            knexBuilder.andWhereRaw(`${fieldName} >= ?`, new Date(value).toUTCString());
                        }
                    } else if (condition === "LESS_THAN_OR_EQUAL"){
                        if(operator === "or"){
                            knexBuilder.andWhereRaw(`${fieldName} <= ?`, new Date(value).toUTCString());
                        } else if(operator === "and"){
                            knexBuilder.andWhereRaw(`${fieldName} <= ?`, new Date(value).toUTCString());
                        }
                    }
                }
            }
        }
    }
}