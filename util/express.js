const { request } = require("express");

exports.getFilterQuery = (query)=>{
    let { page, orderby, ordertype, recordsperpage, filtertext, filterby } = query;
    page = parseInt(page) || 1;
    orderby = orderby || "date_created";
    ordertype = ordertype || "desc";
    recordsperpage = parseInt(recordsperpage) || 5;
    filtertext = filtertext || "";
    filterby = filterby || "";
    return {
        page,
        orderby,
        ordertype,
        recordsperpage,
        filtertext,
        filterby
    };
}

exports.parseFilterQuery = (query)=>{
    let { pagenum, 
        pagesize, 
        filterscount, 
        sortdatafield, 
        sortorder, 
        filterGroups } = query;
    pagenum = parseInt(pagenum) || 0;
    pagesize = parseInt(pagesize) || 5;
    filterscount = parseInt(filterscount) || 0;

    sortdatafield = sortdatafield || "date_created";
    sortorder = sortorder || "desc";
    return {
        pagenum,
        pagesize,
        filterscount,

        sortdatafield,
        sortorder,
        filterGroups
    };
}

exports.buildPaginationQuery = (query, page)=>{
    let rQuery = "?";
    rQuery+=`page=${page}&`
    for(let key in query){
        if(key!=="page"){
            rQuery+=`${key}=${query[key]}&`
        }
    }
    return rQuery;
}

exports.clientIp = (request) => {
    return request.headers['x-forwarded-for'] || request.connection.remoteAddress;
}