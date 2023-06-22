import { AmethystClient } from 'amethystjs';
import { Partials } from 'discord.js';
import { config } from 'dotenv';

config();

const client = new AmethystClient(
    {
        intents: ['Guilds', 'GuildMessages', 'MessageContent'],
        partials: [Partials.Channel, Partials.Message]
    },
    {
        token: process.env.token,
        commandsFolder: './dist/commands',
        eventsFolder: './dist/events',
        debug: true,
        prefix: 'h!',
        strictPrefix: false
    }
);

client.start({});
