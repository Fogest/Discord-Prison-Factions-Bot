const moment = require('moment');
const logger = require ('../logger');
const { Users, UserPayments } = require('../dbObjects');

function addUser(id, displayName, message) {
    const user = Users.create({
        discord_id: id,
        player_ign: displayName,
    })
    .then(logger.info(`Adding ${id} to the Users table`))
    .catch(function(err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return logger.info(`Did not add ${id} as they already were present in the table`);
        }
        return logger.error('Something went wrong generating the gang members');
    });
}

async function generatePayments(money, tokens) {
    const userList = await Users.findAll({
        attributes: ['discord_id']
    });

    userList.forEach((user) => {
        const payment = UserPayments.create({
            discord_id: user.get({plain: true}).discord_id,
            due_date: moment().add(7, 'days').format("YYYY-MM-DD HH:mm:ss"),
            tokens_owed: tokens,
            amount_owed: money,
        });
    });
}

module.exports = {
    name: 'generate',
    description: 'Generate various bits of data',
    args: true,
    guildOnly: false,
    admin: true,
    gang: false,
    usage: 'players || payments <money> <tokens>',
    execute(message, args) {
        if (args[0] === 'players') {
            message.channel.send('We will now begin generating the player database information for all gang members');

            logger.info('Now beginning generation of gang members into the database');

            // Get all the members with the gang role.
            message.guild.roles.get('285996954058489857').members.map(m => addUser(m.user.id, m.displayName, m.displayName, m));

            message.channel.send('Completed generation.');
            logger.info('Completed generation of players into database');
        } else if (args[0] === 'payments') {
            if(args.length !== 3)
                return message.channel.send('You goofed the command, please use !generate payments <money> <tokens>');
            generatePayments(args[1], args[2]);
        }
    },
};