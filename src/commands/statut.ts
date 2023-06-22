import { AmethystCommand, log4js, preconditions, waitForInteraction } from 'amethystjs';
import { cancel, classic } from '../utils/embeds';
import { emoji } from '../utils/emoji';
import { statuses } from '../data/statuses';
import { emojisData } from '../data/emojis';
import { button, row } from '../utils/components';
import { database } from '../utils/db';
import { ComponentType, Message } from 'discord.js';
import { displayBanner } from '../utils/banner';

export default new AmethystCommand({
    name: 'statut',
    description: 'Obtenez un statut avec vos médailles',
    preconditions: [preconditions.GuildOnly]
}).setMessageRun(async ({ message }) => {
    const buyable = Object.keys(statuses)
        .map((s: keyof typeof statuses) => statuses[s])
        .filter((x) => !x.auto);

    const shop = classic(message.author)
        .setTitle('Statut')
        .setDescription(
            `${emoji('character')}__Lily Lagoon :__ Voici les statut que tu peux avoir\n\n${buyable
                .map((x) => `- ${x.name} : ${x.value} ${emojisData[x.emoji].emoji}`)
                .join('\n')}`
        )
        .setColor(message.guild.members.me.displayHexColor);

    const stats = database.getUser(message.author.id);
    const buttons = buyable.map((x) =>
        button({
            emoji: emojisData[x.emoji].emoji,
            label: x.name,
            style: 'Secondary',
            id: x.id,
            disabled: database.hasStatus(message.author.id, x.id as keyof typeof statuses)
                ? true
                : (stats.items.find((y) => y.id === x.emoji)?.count ?? 0) <= x.value
        })
    );

    const msg = (await message.channel
        .send({
            embeds: [shop],
            components: [row(...buttons)]
        })
        .catch(log4js.trace)) as Message<true>;

    if (!msg) return;

    const rep = await waitForInteraction({
        message: msg,
        user: message.author,
        componentType: ComponentType.Button,
        replies: { everyone: { content: ':x: | Vous ne pouvez pas interagir avec ce message', ephemeral: true } }
    }).catch(log4js.trace);

    if (!rep) return msg.edit({ embeds: [cancel()], components: [] }).catch(log4js.trace);
    const status = statuses[rep.customId as keyof typeof statuses];

    database.addStatus(message.author.id, status.id as keyof typeof statuses);
    database.removeItem({
        userId: message.author.id,
        id: status.emoji as keyof typeof emojisData,
        count: status.value
    });

    const img = displayBanner();
    msg.edit({
        embeds: [
            classic(message.author)
                .setTitle('Statut')
                .setDescription(`${emoji('character')} __Lily Lagoon :__ Tu as obtenu le statut **${status.name}**`)
                .setImage(img.embed)
                .setColor(message.guild.members.me.displayHexColor)
        ],
        components: [],
        files: [img.file]
    }).catch(log4js.trace);
});
