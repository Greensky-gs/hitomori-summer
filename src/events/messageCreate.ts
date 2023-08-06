import { AmethystEvent } from 'amethystjs';
import { database } from '../utils/db';
import { GuildTextBasedChannel } from 'discord.js';

export default new AmethystEvent('messageCreate', async (message) => {
    if (
        message.guild &&
        !message.author.bot &&
        ['715281992199176274', '1035488039549546506'].includes(
            (message.channel as GuildTextBasedChannel)?.parent?.id
        ) &&
        !['1007217195585122365', '810196285427941386', '996694895119061053'].includes(message.channel.id)
    )
        database.addUser(message.author.id);
});
