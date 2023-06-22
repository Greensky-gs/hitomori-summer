export const displayBanner = () => {
    const random = [1, 2, 3][Math.floor(Math.random() * 3)];

    return {
        file: `./images/banner${random}.jpg`,
        embed: `attachment://banner${random}.jpg`
    };
};
