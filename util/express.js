const { merge } = require('lodash');
const util = require('./common');
require('dotenv').config();
const environment = process.env.NODE_ENV;

exports.render = (req, res, next, url, data)=>{
    res.render(url, merge(data, {util, user: req.user, fm: req.flash("fm")}));
}

exports.flash =  (req, type, title, body)=>{
    req.flash('fm', {type, title, body});
}

exports.renderError =  (req, res, next, error)=>{
    console.log(error);
    res.locals.message = err.message;
    res.locals.error = environment === 'development' ? err : {};
  
    res.status(err.status || 500);
    res.render('error');
}

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