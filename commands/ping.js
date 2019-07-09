module.exports = {
    name: 'ping',
    description: 'Ping!',
    cooldown: 5,
    aliases: ['pinger', 'pi'],
    execute(message, args) {
        message.channel.send('Pong.');
    },
};