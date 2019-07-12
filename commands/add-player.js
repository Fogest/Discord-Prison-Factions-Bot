const logger = require ('../logger');
const { Users, UserPayments } = require('../dbObjects');

function addUser(id, displayName) {
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

module.exports = {
    name: 'add-player',
    description: 'Adds a player to the database, renames their nickname, and assigns them the "gang" member role.',
    args: true,
    guildOnly: false,
    admin: true,
    gang: false,
    usage: '@<discord_name> <in_game_name>',
    execute(message, args) {
        if (args.length !== 2)
            return message.channel.send("You must have two arguments to use this command. See !help add-player");

        logger.info('Beginning process of adding a new player!');

        const role = message.guild.roles.find(role => role.id === '285996954058489857');
        const member = message.mentions.members.first();
        member.addRole(role);
        logger.info(`Added gang member role to ${member.displayName}`);

        member.setNickname(args[1]);
        logger.info(`Changed ${member.id}'s name to ${args[1]}`);

        addUser(member.user.id, member.displayName);
        logger.info(`Added ${args[1]} to the database`);

        message.channel.send(`Completed adding member ${member.user.tag} to the gang!`);
        logger.info('Completed adding user to the gang!');
    },
};