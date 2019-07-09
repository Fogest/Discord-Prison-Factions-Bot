const Sequelize = require('sequelize');

const { db_host, db_name, db_password, db_username } = require('./config.json');


const sequelize = new Sequelize(db_name, db_username, db_password, {
    host: db_host,
    dialect: 'mysql',
    logging: false,
});

const Users = sequelize.import('models/Users');
const UserPayments = sequelize.import('models/UserPayments');

Users.hasMany(UserPayments, {foreignKey: 'discord_id', as: 'id'});
UserPayments.belongsTo(Users, {foreignKey: 'discord_id', as: 'id'});


module.exports = { Users, UserPayments };