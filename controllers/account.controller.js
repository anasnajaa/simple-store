require('dotenv').config();
const userModel = require('../models/user.model');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { validateUserSignup, vEmail, vEmpty } = require('../validators');
const { isEmpty } = require('lodash');
const { render, flash } = require('../util/express');
const mailer = require('../util/mailer');
const { v4 } = require('uuid');

const viewAccount = "account.ejs";
const viewProfile = "account.profile.ejs";
const viewAddress = "account.address.ejs";
const viewOrders = "account.orders.ejs";
const viewWishlist = "account.wishlist.ejs";

exports.show_dashboard = (req, res, next)=>{
    render(req, res, next, viewAccount, {
        crumbs: [
            {title: "home", url:"/"}, 
            {title: "account", url:"/account", active: true}
        ]
    });
}

exports.show_profile = (req, res, next)=>{
    render(req, res, next, viewProfile, {
        crumbs: [
            {title: "home", url:"/"}, 
            {title: "account", url:"/account"}, 
            {title: "profile", url:"/account/profile", active: true}
        ]
    });
}

exports.show_address = (req, res, next)=>{
    render(req, res, next, viewAddress, {
        crumbs: [
            {title: "home", url:"/"}, 
            {title: "account", url:"/account"}, 
            {title: "address book", url:"/account/address", active: true}
        ]
    });
}

exports.show_orders = (req, res, next)=>{
    render(req, res, next, viewOrders, {
        crumbs: [
            {title: "home", url:"/"}, 
            {title: "account", url:"/account"}, 
            {title: "orders", url:"/account/orders", active: true}
        ]
    });
}

exports.show_wishlist = (req, res, next)=>{
    render(req, res, next, viewWishlist, {
        crumbs: [
            {title: "home", url:"/"}, 
            {title: "account", url:"/account"}, 
            {title: "wishlist", url:"/account/wishlist", active: true}
        ]
    });
}