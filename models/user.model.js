const knex = require('knex')(require('../config/db-connect'));

exports.add_new_user = (email)=>{
    const recordEmail = (trx) => {
        return knex('users')
            .transacting(trx)
            .insert({
                email,
                date_created: 'now()'
            });
    };

    const logEntry = (trx) => {
        return knex('logs')
            .transacting(trx)
            .insert({
                entry: "Email registered to database: " + email,
            });
    };

    return knex.transaction((trx) => {
        recordEmail(trx)
            .then((resp) => {
                return logEntry(trx);
            })
            .then(trx.commit)
            .catch(trx.rollback);
        });
};

exports.findOneByEmail = async (email)=>{
    try {
        const rows = await knex('users').where({email}).select('*');
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

exports.findOneById = async (id)=>{
    try {
        const rows = await knex('users').where({'users.id': id}).select('*');
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

exports.createUser = async (userObject)=>{
    try {
        const rows = await knex('users').insert(userObject).returning('*');
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

exports.deleteOne = (id)=>{
    return knex('users')
    .where({'leads.id': id})
    .del();
};
