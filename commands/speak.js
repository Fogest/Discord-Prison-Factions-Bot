module.exports = {
    name: 'speak',
    description: 'Speak in the gang chat channel. Just like announce but no notification to everyone',
    args: true,
    guildOnly: true,
    admin: true,
    gang: false,
    usage: '<message to announce to the gang>',
    execute(message, args) {
        const channel = message.client.channels.get('286000301444431872'); // #gangchat channel id
        channel.send(message.content.substr(message.content.indexOf(" ") + 1));
        message.delete();
    },
};