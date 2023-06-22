import { existsSync, writeFileSync } from 'fs';
import { cacheType, database, emojiId, statuses as statusType } from '../typings/database';
import { emojisData } from '../data/emojis';
import { statuses } from '../data/statuses';

export class Database {
    private cache: Record<string, cacheType> = {};
    private path = './dist/data/database.json';

    constructor() {
        this.start();
    }

    public hasStatus(userId: string, status: statusType) {
        const data = this.getUser(userId);

        return data.statuses.includes(status);
    }
    public addStatus(userId: string, status: statusType) {
        const data = this.getUser(userId);
        if (this.hasStatus(userId, status)) return 'alreay possessed';

        data.statuses.push(status);

        this.cache[userId] = data;
        this.save();
    }
    public addUser(userId: string) {
        const data = this.getUser(userId);
        data.messages++;

        if (data.messages % 10 === 0) {
            this.addItem({ userId, id: 'cactus', count: data.messages / 10, save: false });

            this.cache[userId].messages = 0;

            this.save();
            this.check();
        } else {
            this.cache[data.userId] = data;
            this.save();
        }
    }
    public addItem({ userId, id, count, save = true }: { userId: string; id: emojiId; count: number; save?: boolean }) {
        const data = this.getUser(userId);
        if (data.items.find((x) => x.id === id)) {
            data.items[data.items.indexOf(data.items.find((x) => x.id === id))].count += count;
        } else {
            data.items.push({ id, count });
        }

        this.cache[userId] = data;
        if (save) this.save();

        if (id == 'island' && !this.hasStatus(userId, 'summerMaster')) {
            this.addStatus(userId, 'summerMaster');
        }

        return data;
    }
    public removeItem({
        userId,
        id,
        count,
        save = true,
        strictRemove = true
    }: {
        userId: string;
        id: emojiId;
        count: number;
        save?: boolean;
        strictRemove?: boolean;
    }) {
        const data = this.getUser(userId);
        if (!data.items.find((x) => x.id === id)) return false;

        if (data.items.find((x) => x.id === id).count < count) {
            if (strictRemove) return false;
            data.items[data.items.indexOf(data.items.find((x) => x.id === id))].count = 0;
        } else {
            data.items[data.items.indexOf(data.items.find((x) => x.id === id))].count -= count;
        }

        if (data.items.find((x) => x.id === id).count == 0) data.items = data.items.filter((x) => x.id !== id);

        this.cache[userId] = data;
        if (save) this.save();

        return data;
    }
    public trade({
        userId,
        add,
        remove
    }: {
        userId: string;
        remove: { id: emojiId; amount: number };
        add: { id: emojiId; amount: number };
    }) {
        const removal = this.removeItem({ userId, id: remove.id, save: false, count: remove.amount });

        if (!removal) return 'invalid count';
        this.addItem({ userId, id: add.id, count: add.amount, save: true });

        return 'ok';
    }
    public calculateMessage(userId: string) {
        const data = this.getUser(userId);

        return (
            data.items.map((x) => emojisData[x.id].value * x.count).reduce((a, b) => a + b, 0) +
            data.statuses.map((s) => statuses[s].value).reduce((a, b) => a + b, 0) +
            data.messages
        );
    }
    public getUser(userId: string) {
        return this.cache[userId] ?? { userId, messages: 0, statuses: [], items: [] };
    }
    private check() {
        if (!existsSync(this.path)) writeFileSync(this.path, '{}');
    }
    private save() {
        writeFileSync(this.path, JSON.stringify(this.cache));
    }
    private start() {
        this.check();
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const file = require('../data/database.json') as database;

        Object.keys(file).forEach((key) => {
            this.cache[key] = { ...file[key], userId: key };
        });
    }
}
