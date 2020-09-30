const knex = require('knex')(require('../config/db-connect'));
const {databaseError} = require('../util/errorHandler');

exports.addNewCustomer = (userObject, mobile)=>{
    return new Promise((resolve, reject)=>{
        let dbUser = {}, 
        dbUserContact = {},
        dbUserRoles = [];

        const createUser = (trx) => {
            return knex('users')
            .transacting(trx)
            .insert(userObject)
            .returning('*');
        };
    
        const addCustomerRole = (trx, user) => {
            return knex('users_roles')
            .transacting(trx)
            .insert({'user_id': user.id, 'role_id': 2})
            .returning('*');
        };

        const addCustomerContact = (trx, user) => {
            return knex('users_contacts')
            .transacting(trx)
            .insert({
                'user_id': user.id, 
                'contact_type_id': 2,
                'contact': mobile,
                'verified': false,
                'verification_id': Math.floor(Math.random()*90000) + 10000
            })
            .returning('*');
        };
    
        const logEntry = (trx, user) => {
            return knex('logs')
                .transacting(trx)
                .insert({
                    entry: "New customer created: " + user.id,
                });
        };

        knex.transaction((trx) => {
            createUser(trx)
                .then((rows) => {
                    dbUser = rows[0];
                    return addCustomerRole(trx, dbUser);
                })
                .then((rows)=> {
                    dbUserRoles = rows;
                    return addCustomerContact(trx, dbUser);
                })
                .then((rows)=> {
                    dbUserContact = rows[0];
                    return logEntry(trx, dbUser);
                })
                .then(trx.commit)
                .catch(trx.rollback);
            })
            .then((inserts) => {
                resolve({
                    user: dbUser, 
                    contacts: dbUserContact,
                    roles: dbUserRoles
                });
            })
            .catch((error) => {
                databaseError(error);
                reject(error);
            });
    });
};

exports.findUserRoles = async (userId) => {
    try {
        const roles = await knex
        .select('roles.id', 'roles.name')
        .from('users_roles')
        .innerJoin('roles', 'roles.id', '=', 'users_roles.role_id')
        .where({'users_roles.user_id': userId});

        if(roles && roles.length > 0){
            return roles;
        } else {
            return [];
        }

    } catch (error) {
        databaseError(error);
        return [];
    }
};

exports.getUserDetailsForToken = async (condition)=>{
    try {
        const rows = await knex('users').where(condition).select('*');
        if(rows && rows.length > 0){
            const user = rows[0];
            user.roles = await this.findUserRoles(user.id);
            return user;
        } else {
            return null;
        }
    } catch (error) {
        databaseError(error);
        return null;
    }
};

exports.findOneByEmail = async (email)=>{
    try {
        const rows = await knex('users').where({email}).select('*');
        if(rows && rows.length > 0){
            const user = rows[0];
            user.roles = await this.findUserRoles(user.id);
            return user;
        } else {
            return null;
        }
    } catch (error) {
        databaseError(error);
        return null;
    }
};

exports.userContacts = async (userId) => {
    try {
        const rows = await knex('users_contacts')
        .innerJoin('contact_types', 'contact_types.id', '=', 'users_contacts.contact_type_id')
        .where({'users_contacts.user_id': userId, is_deleted: false})
        .select('users_contacts.id AS  contact_id', 
        'contact_types.name AS contact_type',
        'users_contacts.contact',
        'users_contacts.verified');
        if(rows && rows.length > 0){
            return rows;
        } else {
            return [];
        }
    } catch (error) {
        databaseError(error);
        return [];
    }
}

exports.activateUser = async (key)=>{
    try {
        const rows = await 
        knex('users')
        .where({activation_id: key})
        .update({
            activation_id: null, 
            date_updated: new Date(),
            is_active: true
        })
        .returning('*');
        if(rows && rows.length > 0){
            const user = rows[0];
            return user;
        } else {
            return null;
        }
    } catch (error) {
        databaseError(error);
        return null;
    }
};

exports.getUserContactActivationDetails = async (userId, usersContactId) => {
    try {
        const rows = await knex('users_contacts')
        .where({
            id: usersContactId,
            user_id: userId,
            is_deleted: false
        })
        .select('*');

        if(rows && rows.length > 0){
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        databaseError(error);
        return null;
    }
};

exports.updateVerificationCount = async (usersContactId, count) => {
    try {
        const rows = await knex('users_contacts')
        .where({
            id: usersContactId
        })
        .update({verifications_count: count})
        .returning('*');

        if(rows && rows.length > 0){
            return rows;
        } else {
            return null;
        }
    } catch (error) {
        databaseError(error);
        return null;
    }
};

exports.verifyUserContact = async (userId, usersContactId, verificationId) => {
    try {
        const rows = await knex('users_contacts')
        .where({
            id: usersContactId,
            user_id: userId,
            verified: false,
            verification_id: verificationId,
            is_deleted: false
        })
        .update({verified: true, verification_id: null, verified_on: new Date()})
        .returning('*');

        if(rows && rows.length > 0){
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        databaseError(error);
        return null;
    }
};

exports.findOneById = async (id)=>{
    try {
        const rows = await knex('users').where({'users.id': id}).select('*');
        if(rows && rows.length > 0){
            const user = rows[0];
            user.roles = await this.findUserRoles(id);
            return user;
        } else {
            return null;
        }
    } catch (error) {
        databaseError(error);
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
        databaseError(error);
        return null;
    }
};

exports.addAdminRoleToUser = async (userId)=>{
    try {
        const rows = await knex('users_roles').insert({'user_id': userId, 'role_id': 1}).returning('*');
        if(rows && rows.length > 0){
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        databaseError(error);
        return null;
    }
};

exports.addCustomerRoleToUser = async (userId)=>{
    try {
        const rows = await knex('users_roles').insert({'user_id': userId, 'role_id': 2}).returning('*');
        if(rows && rows.length > 0){
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        databaseError(error);
        return null;
    }
};

exports.deleteOne = (id)=>{
    return knex('users')
    .where({'users.id': id})
    .del();
};
