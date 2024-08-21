/**
 * モジュールの読み込み
 */
const { Client, GatewayIntentBits, Events } = require('discord.js');
const dotenv = require('dotenv');

/**
 * 環境変数読み込み
 */
dotenv.config();

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
client.login(process.env.DISCORD_TOKEN);

/**
 * コマンド読み込み
 */
const serversetCommand = require('./commands/serverset');
const rolesetCommand = require('./commands/roleset');
const rolelistCommand = require('./commands/rolelist');

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
            await serversetCommand.execute(interaction);
        }catch(error){
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーが発生しました．', ephemeral: true });
            }else{
                await interaction.followUp({ content: 'コマンド実行時にエラーが発生しました．', ephemeral: true });
            }
        }
    }else if (commandName === rolesetCommand.data.name){
        try{
            await rolesetCommand.execute(client, interaction);
        }catch(error){
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーが発生しました．', ephemeral: true });
            }else{
                await interaction.followUp({ content: 'コマンド実行時にエラーが発生しました．', ephemeral: true });
            }
        }
    }else if (commandName === rolelistCommand.data.name) {
        try{
            await rolelistCommand.execute(interaction);
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

/**
 * ロールアップデートイベント
 */
client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
    const tomlContent = fs.readFileSync(filePath, 'utf-8');

    const config = toml.parse(tomlContent);

    if (config.panelList && Array.isArray(config.panelList)) {
        if (config.panelList.includes(newRole.id)) {
            const channel = await newRole.guild.channels.fetch(config.panelChannelId);
            if (channel) {
                const panel = await channel.messages.fetch(config.panelId);
                if (panel) {
                    if (panel.editable) {
                        let message = "";
                        for (let index = 0; index < config.panelList.length; index++) {
                            const roles = config.panelList[index];
                            if (roles) {
                                const role = await interaction.guild.roles.fetch(roles);
                                if (role) {
                                    const id = role.id;
                                    message += "## <@&" + id + ">\n";
                                    let i = 0;
                                    for (const member of role.members) {
                                        message += "<@";
                                        message += await member[1].id;
                                        message += ">";
                                        if (i < role.members.size - 1) {
                                            message += ", ";
                                            i++;
                                        }
                                    }
                                    message += "\n\n";
                                }
                            }
                        }

                        await panel.edit(message);
                    }
                }
            }
        }
    }
});
