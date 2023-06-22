import { AmethystEvent } from 'amethystjs';
import { ActivityType } from 'discord.js';

export default new AmethystEvent('ready', async (client) => {
    client.user.setPresence({
        status: 'online',
        activities: [
            {
                name: "l'évent d'été",
                type: ActivityType.Playing
            }
        ]
    });
});
