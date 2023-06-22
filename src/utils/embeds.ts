import { EmbedBuilder, User } from 'discord.js';

const basic = (user: User) =>
    new EmbedBuilder({
        timestamp: Date.now(),
        footer: { text: user.username, icon_url: user.displayAvatarURL({ forceStatic: false }) }
    });

export const classic = basic;
export const cancel = () =>
    new EmbedBuilder().setTitle('Annulé').setDescription(`La commande a été annulée`).setColor('Yellow');
