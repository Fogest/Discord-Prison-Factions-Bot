const logger = require ('../logger');
const { Users, UserPayments } = require('../dbObjects');

function addUser(id, message) {
    const user = Users.create({
        discord_id: id,
    })
    .then(logger.info(`Adding ${id} to the Users table`))
    .catch(function(err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return logger.info(`Did not add ${id} as they already were present in the table`);
        }
        return logger.error('Something went wrong generating the gang members');
    });
}

module.exports = {
    name: 'generate',
    description: 'Generate various bits of data',
    args: true,
    guildOnly: false,
    admin: true,
    gang: false,
    usage: '<players>',
    execute(message, args) {
        if (args[0] === 'players') {
            message.channel.send('We will now begin generating the player database information for all gang members');

            logger.info('Now beginning generation of gang members into the database');

            // Get all the members with the gang role.
            message.guild.roles.get('285996954058489857').members.map(m => addUser(m.user.id, m));
        }
    },
};