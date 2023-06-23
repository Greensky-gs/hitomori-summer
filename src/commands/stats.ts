import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import { database } from '../utils/db';
import { classic } from '../utils/embeds';
import { emojisData } from '../data/emojis';
import { statuses } from '../data/statuses';
import { displayBanner } from '../utils/banner';

export default new AmethystCommand({
    name: 'stats',
    description: 'Affiche vos stats',
    preconditions: [preconditions.GuildOnly]
}).setMessageRun(async ({ message }) => {
    const stats = database.getUser(message.author.id);

    const banner = displayBanner();
    const embed = classic(message.author)
        .setTitle('Statistiques')
        .setDescription(`Vos statistiques pour l'évènement d'été :`)
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
