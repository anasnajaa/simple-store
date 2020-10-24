require("es6-promise").polyfill();
require("isomorphic-fetch");
require('dotenv').config();

exports.contentServer = async () => {
    try {
        const response = await fetch("https://www.google.com", {method: "get"});
        if(response.ok){
            return true;
        } 
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}