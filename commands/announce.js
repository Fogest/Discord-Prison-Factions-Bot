module.exports = {
    name: 'announce',
    description: 'Announce a message to the gang via the bot.',
    args: true,
    guildOnly: true,
    admin: true,
    gang: false,
    usage: '<message to announce to the gang>',
    execute(message, args) {
        const channel = message.client.channels.get('286000301444431872'); // #gangchat channel id
        channel.send(`📢 @everyone ` + message.content.substr(message.content.indexOf(" ") + 1));
    },
};