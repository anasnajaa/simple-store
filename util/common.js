function formatDate(date) { 
    if(typeof(date) === "string"){
        date = new Date(date);
    }
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`
}

module.exports = {
    formatDate
}