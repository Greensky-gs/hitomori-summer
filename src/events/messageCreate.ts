import { AmethystEvent } from 'amethystjs';
import { database } from '../utils/db';
import { GuildTextBasedChannel } from 'discord.js';

export default new AmethystEvent('messageCreate', async (message) => {
    if (
        message.guild &&
        !message.author.bot &&
        ['715281992199176274', '1035488039549546506'].includes((message.channel as GuildTextBasedChannel)?.parent?.id)
    )
        database.addUser(message.author.id);
});
