import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import { database } from '../utils/db';
import { classic } from '../utils/embeds';
import { emojisData } from '../data/emojis';
import { statuses } from '../data/statuses';
import { displayBanner } from '../utils/banner';
import { GuildMember } from 'discord.js';

export default new AmethystCommand({
    name: 'stats',
    description: 'Affiche vos stats',
    preconditions: [preconditions.GuildOnly]
}).setMessageRun(async ({ message }) => {
    const userId =
        message.mentions.users?.first()?.id ??
        (/\d{16,}/.test(message.content)
            ? ((await message.guild.members.fetch(message.content)?.catch(log4js.trace)) as GuildMember)?.id
            : null) ??
        message.guild.members.cache.get(message?.content)?.id ??
        message.guild.members.cache.find(
            (x) =>
                x.user.username.toLowerCase() === message.content?.toLowerCase() ||
                (x.nickname && x.nickname?.toLowerCase() === message.content?.toLowerCase())
        )?.id ??
        message.author.id;
    const stats = database.getUser(userId);

    const banner = displayBanner();
    const embed = classic(message.author)
        .setTitle('Statistiques')
        .setDescription(
            `${
                userId === message.author.id ? 'Vos statistiques' : `Les statistiques de <@${userId}>`
            } pour l'évènement d'été :`
        )
        .setColor(message.member.displayHexColor)
        .setFields(
            {
                name: 'Messages envoyés',
                value: `${database
                    .calculateMessage(message.author.id)
                    .toLocaleString(message.guild.preferredLocale)} messages`,
                inline: true
            },
            {
                name: 'Médailles',
                value:
                    stats.items.length === 0
                        ? 'Aucune médaille'
                        : `${stats.items
                              .map((x) => `${emojisData[x.id].emoji} (**x${x.count.toLocaleString('fr')}**)`)
                              .join('\n')}`,
                inline: true
            },
            {
                name: 'Status',
                value:
                    stats.statuses.length === 0
                        ? 'Aucun statut'
                        : `${stats.statuses.map((x) => statuses[x].name).join(', ')}`,
                inline: false
            }
        )
        .setImage(banner.embed);

    message.channel.send({ embeds: [embed], files: [banner.file] }).catch(log4js.trace);
});
