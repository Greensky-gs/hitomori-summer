import { AmethystEvent } from 'amethystjs';
import { database } from '../utils/db';

export default new AmethystEvent('messageCreate', async (message) => {
    if (message.guild && !message.author.bot) database.addUser(message.author.id);
});
