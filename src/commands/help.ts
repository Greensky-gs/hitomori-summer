import { AmethystCommand, log4js } from 'amethystjs';
import { classic } from '../utils/embeds';
import { emoji } from '../utils/emoji';
import { displayBanner } from '../utils/banner';

export default new AmethystCommand({
    name: 'help',
    aliases: ['aide'],
    description: "Affiche la page d'aide"
}).setMessageRun(async ({ message, options }) => {
    const commandName = options.args.shift()?.toLowerCase();

    const commands = message.client.messageCommands;
    const cmd = commands.find((x) => x.options.name === commandName || x.options.aliases?.includes(commandName));
    const img = displayBanner();

    if (cmd) {
        const help = classic(message.author)
            .setTitle(`Commande ${cmd.options.name}`)
            .setDescription(`${cmd.options.description}`)
            .setFields(
                {
                    name: 'Messages privés',
                    value: cmd.options.preconditions?.find((x) => x.name === 'GuildOnly')
                        ? emoji('dnd')
                        : emoji('online'),
                    inline: true
                },
                {
                    name: 'Alias',
                    value:
                        cmd.options.aliases?.length > 0
                            ? cmd.options.aliases.map((x) => `\`${message.client.configs.prefix}${x}\``).join(', ')
                            : "Pas d'alias",
                    inline: true
                }
            )
            .setImage(img.embed)
            .setColor('Orange');
        message.channel.send({ files: [img.file], embeds: [help] }).catch(log4js.trace);
    } else {
        const help = classic(message.author)
            .setColor('Orange')
            .setTitle("Page d'aide")
            .setDescription(
                commands
                    .map((x) => `\`${message.client.configs.prefix}${x.options.name}\` : ${x.options.description}`)
                    .join('\n')
            )
            .setFields({
                name: 'Informations',
                value: `Pour plus d'informations sur une commande, tapez \`${message.client.configs.prefix}help <nom de la commande>\``,
                inline: false
            })
            .setThumbnail(
                message.guild.iconURL({ forceStatic: false }) ??
                    message.client.user.displayAvatarURL({ forceStatic: false })
            )
            .setImage(img.embed);

        message.channel.send({ embeds: [help], files: [img.file] }).catch(log4js.trace);
    }
});
