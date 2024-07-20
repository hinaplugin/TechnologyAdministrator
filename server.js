/**
 * モジュールの読み込み
 */
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { token } = require('./config.json');

/**
 * クライアント作成
 */
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

/**
 * クライアントログイン
 */
client.login(token);

/**
 * コマンド読み込み
 */
const serversetCommand = require('./commands/serverset');
const gikaicreateCommand = require('./commands/gikaicreate');

/**
 * Readyイベント
 */
client.on(Events.ClientReady, async () => {
    client.user.setActivity({ name: `技術管理部`, type: 5 });
    console.log(`${client.user?.username ?? `Unknown`}が起動しました．`);
});

/**
 * コマンドイベント
 */
client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isChatInputCommand()) {
        return;
    }

    const role = interaction.guild.roles.cache.find(r => r.name === '技術管理者');

    if (!role) {
        interaction.reply({ content: '技術管理者ロールを取得できなかったため実行できません．', ephemeral: true });
        return;
    }

    const member = interaction.member;

    if (!member.roles.cache.has(role.id)) {
        interaction.reply({ content: 'あなたは技術管理者ではないため実行できません．', ephemeral: true });
        return;
    }

    const { commandName } = interaction;
    
    if (commandName === serversetCommand.data.name) {
        try{
            await serversetCommand.execute(client, interaction);
            await gikaicreateCommand.execute(interaction);
        }catch(error){
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーが発生しました．', ephemeral: true });
            }else{
                await interaction.followUp({ content: 'コマンド実行時にエラーが発生しました．', ephemeral: true });
            }
        }
    }
});