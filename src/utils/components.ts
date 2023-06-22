import { ActionRowBuilder, AnyComponentBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const row = <T extends AnyComponentBuilder = ButtonBuilder>(...components: T[]): ActionRowBuilder<T> =>
    new ActionRowBuilder().setComponents(components) as ActionRowBuilder<T>;

export const button = ({
    label,
    emoji,
    id,
    url,
    style,
    disabled = false
}: {
    label: string;
    emoji?: string;
    id?: string;
    url?: string;
    style: keyof typeof ButtonStyle;
    disabled?: boolean;
}) => {
    const btn = new ButtonBuilder();

    btn.setLabel(label);
    btn.setStyle(ButtonStyle[style]);
    btn.setDisabled(disabled);

    if (emoji) btn.setEmoji(emoji);
    if (id) btn.setCustomId(id);
    if (url) btn.setURL(url);

    return btn;
};
