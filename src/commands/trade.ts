import { AmethystCommand, log4js, waitForInteraction } from 'amethystjs';
import { database } from '../utils/db';
import { cancel, classic } from '../utils/embeds';
import { row } from '../utils/components';
import { ComponentType, Message, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { emojisData } from '../data/emojis';
import { emojiId } from '../typings/database';
import { displayBanner } from '../utils/banner';

export default new AmethystCommand({
    name: 'échanger',
    description: 'Échange des médailles',
    aliases: ['echanger', 'échange', 'echange']
}).setMessageRun(async ({ message }) => {
    const data = database.getUser(message.author.id);

    if (data.items.length < 1)
        return message.reply(`:x: | Vous n'avez pas assez de médailles pour faire ça`).catch(log4js.trace);
    const choose = (await message.channel
        .send({
            embeds: [
                classic(message.author)
                    .setTitle('Sélection')
                    .setDescription(`Quelles médailles voulez-vous échanger ?`)
                    .setColor('Grey')
            ],
            components: [
                row(
                    new StringSelectMenuBuilder()
                        .setCustomId('trade-first')
                        .setMaxValues(1)
                        .setOptions(
                            data.items.map((x) => {
                                const emoji = emojisData[x.id];

                                return {
                                    label: `${x.count} ${emoji.name.toLowerCase()}`,
                                    emoji: emoji.emoji,
                                    value: x.id
                                };
                            })
                        )
                )
            ]
        })
        .catch(log4js.trace)) as Message<true>;
    if (!choose) return;

    const first = await waitForInteraction({
        componentType: ComponentType.StringSelect,
        message: choose,
        replies: {
            everyone: {
                content: ':x: | Vous ne pouvez pas interagir avec ce message',
                ephemeral: true
            }
        },
        user: message.author
    }).catch(log4js.trace);

    if (!first) return choose.edit({ embeds: [cancel()], components: [] }).catch(log4js.trace);
    const selected = emojisData[first.values[0]] as (typeof emojisData)['lotus'];
    const selectItem = data.items.find((x) => x.id === selected.id);

    const otherItems = (
        Object.keys(emojisData).map((x) => emojisData[x]) as {
            name: string;
            id: emojiId;
            value: number;
            emoji: string;
        }[]
    ).filter((x) => x.id != selected.id);
    first.deferUpdate().catch(log4js.trace);

    const getItems = (itemId: emojiId) => {
        const item = emojisData[itemId];
        const ratio = (selected.value * selectItem.count) / item.value;

        return Math.floor(ratio);
    };

    await choose
        .edit({
            embeds: [
                classic(message.author)
                    .setTitle('Échange')
                    .setDescription(
                        `Choisissez ce contre quoi vous voulez échanger **${selectItem.count} ${selected.name}**`
                    )
                    .setColor('Grey')
            ],
            components: [
                row(
                    new StringSelectMenuBuilder()
                        .setCustomId('trade-second')
                        .setMaxValues(1)
                        .setOptions(
                            otherItems
                                .map((x) => {
                                    const ratio = (selected.value * selectItem.count) / x.value;
                                    if (ratio < 1) return false;

                                    return {
                                        label: `${getItems(x.id)} ${x.name}`,
                                        emoji: x.emoji,
                                        value: x.id
                                    };
                                })
                                .filter((x) => x != false) as unknown as StringSelectMenuOptionBuilder[]
                        )
                )
            ]
        })
        .catch(log4js.trace);

    const second = await waitForInteraction({
        componentType: ComponentType.StringSelect,
        message: choose,
        replies: {
            everyone: {
                content: ':x: | Vous ne pouvez pas interagir avec ce message',
                ephemeral: true
            }
        },
        user: message.author
    }).catch(log4js.trace);

    if (!second)
        return choose
            .edit({
                embeds: [cancel()],
                components: []
            })
            .catch(log4js.trace);

    second.deferUpdate().catch(log4js.trace);

    const trade = emojisData[second.values[0] as emojiId];
    const count = getItems(trade.id as emojiId);
    const originalAmount = (count * trade.value) / selected.value;

    database.trade({
        userId: message.author.id,
        add: {
            amount: count,
            id: second.values[0] as emojiId
        },
        remove: {
            amount: originalAmount,
            id: selectItem.id
        }
    });

    const img = displayBanner();
    choose
        .edit({
            embeds: [
                classic(message.author)
                    .setTitle('Échange')
                    .setDescription(
                        `Vous avez échangé ${originalAmount} ${selected.name} contre ${count} ${trade.name}`
                    )
                    .setColor('Orange')
                    .setImage(img.embed)
            ],
            components: [],
            files: [img.file]
        })
        .catch(log4js.trace);
});
