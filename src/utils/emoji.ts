import emojis from '../data/emojis.json';

export const emoji = (name: keyof typeof emojis) => {
    return emojis[name];
};
