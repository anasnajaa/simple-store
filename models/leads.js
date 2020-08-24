const knex = require('knex')(require('../config/db-connect'));

exports.add_email = (email)=>{
    const recordEmail = (trx) => {
        return knex('leads')
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
} 