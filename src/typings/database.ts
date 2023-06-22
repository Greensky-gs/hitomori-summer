import { statuses } from '../data/statuses';
import { emojisData } from '../data/emojis';

export type statuses = keyof typeof statuses;
export type emojiId = keyof typeof emojisData;

export type databaseType = {
    messages: number;
    statuses: statuses[];
    items: { id: emojiId; count: number }[];
};
export type cacheType = {
    userId: string;
} & databaseType;
export type database = Record<string, databaseType>;
