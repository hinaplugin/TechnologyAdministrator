const { Client, GatewayIntentBits, Events } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ],
});

client.login(process.env.DISCORD_TOKEN);

client.on(Events.ClientReady, async () => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    await guild.commands.set([])
            .then("コマンドの削除が完了しました．")
            .catch("コマンドの削除が失敗しました．");
});