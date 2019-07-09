const Sequelize = require('sequelize');
const logger = require ('./logger');
const { db_host, db_name, db_password, db_username } = require('./config.json');


const sequelize = new Sequelize(db_name, db_username, db_password, {
    host: db_host,
    dialect: 'mysql',
    logging: false,
});

sequelize.import('models/Users');
sequelize.import('models/UserPayments');

//Force should be disabled when wanting to actually use as this recreates table.
sequelize.sync({force: true}).then(async () => {
    logger.info(`Databases have been synced`);
    sequelize.close();
});