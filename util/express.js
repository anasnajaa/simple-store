const { merge } = require('lodash');
const util = require('./common');

exports.render = (req, res, next, url, data)=>{
    res.render(url, merge(data, {util, user: req.user, fm: req.flash("fm")}));
}

exports.flash =  (req, type, title, body)=>{
    req.flash('fm', {type, title, body});
}

exports.renderError =  (req, res, next, error)=>{
    console.log(error);
    res.redirect("/error");
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