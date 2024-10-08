/**
 * モジュールの読み込み
 */
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const toml = require('@iarna/toml');
const path = require('path');
const cron = require('node-cron');

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
        GatewayIntentBits.GuildVoiceStates,
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
const serverextensionCommand = require('./commands/serverextension');
const createpanelCommand = require('./commands/createpanel');
const channeltimeoutCommand = require('./commands/channeltimeout');
const geticonCommand = require('./commands/geticon');

/**
 * tomlファイルのパス
 */
const filePath = path.resolve(__dirname, "../config.toml");
const panelPath = path.resolve(__dirname, "../panel.toml");
const timeoutPath = path.resolve(__dirname, "../timeout.toml");
const adminPath = path.resolve(__dirname, "../admin.toml");

/**
 * Readyイベント
 */
client.on(Events.ClientReady, async () => {
    client.user.setActivity({ name: `技術管理部`, type: 5 });
    console.log(`${client.user?.username ?? `Unknown`}が起動しました．`);
    //client.guilds.cache.get(process.env.GUILD_ID).members.fetch();
    const guild = await client.guilds.cache.get(process.env.ADMIN_GUILD_ID);
    if (guild) {
        const channel = await guild.channels.fetch(process.env.ADMIN_ANNOUNCE_CHANNEL_ID);
        if (channel) {
            cron.schedule("0 0 22 * * 2,5", async () => {
                await channel.send("<@&1280504312513957918> 30分後から執行部合同会だよ(*'▽')");
            });
            cron.schedule("0 30 22 * * 2,5", async () => {
                await channel.send("<@1054695785045958726> 今から執行部合同会だよ(*'▽')");
            });
        }
    }
});

/**
 * コマンドイベント
 */
client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isChatInputCommand()) {
        return;
    }

    const { commandName } = interaction;

    const tomlContent = fs.readFileSync(adminPath, "utf-8");

    const config = toml.parse(tomlContent);

    const role = interaction.guild.roles.cache.find(r => r.name === '技術管理者');

    if (!role) {
        interaction.reply({ content: '技術管理者ロールを取得できなかったため実行できません．', ephemeral: true });
        return;
    }

    const member = interaction.member;

    if (config.admin && Array.isArray(config.admin)) {
        if (commandName === geticonCommand.data.name) {
            if (config.admin.includes(member.id) || member.roles.cache.has(role.id)) {
                try{
                    await geticonCommand.execute(interaction);
                }catch(error){
                    console.error(error);
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'コマンド実行時にエラーが発生しました．', ephemeral: true });
                    }else{
                        await interaction.followUp({ content: 'コマンド実行時にエラーが発生しました．', ephemeral: true });
                    }
                }
            }else {
                interaction.reply({ content: 'このコマンドは技術管理者または技術管理者に認証されたユーザーのみが使用できます．', ephemeral: true });
            }
            return;
        }
    }

    if (!member.roles.cache.has(role.id)) {
        interaction.reply({ content: 'あなたは技術管理者ではないため実行できません．', ephemeral: true });
        return;
    }
    
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
    }else if (commandName === serverextensionCommand.data.name) {
        try{
            await serverextensionCommand.execute(interaction);
        }catch(error){
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーが発生しました．', ephemeral: true });
            }else{
                await interaction.followUp({ content: 'コマンド実行時にエラーが発生しました．', ephemeral: true });
            }
        }
    }else if (commandName === createpanelCommand.data.name) {
        try{
            await createpanelCommand.execute(interaction);
        }catch(error){
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーが発生しました．', ephemeral: true });
            }else{
                await interaction.followUp({ content: 'コマンド実行時にエラーが発生しました．', ephemeral: true });
            }
        }
    }else if (commandName === channeltimeoutCommand.data.name) {
        try{
            await channeltimeoutCommand.execute(interaction);
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
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {

    const oldRoles = oldMember.roles.cache;

    const newRoles = newMember.roles.cache;

    const addRoles = newRoles.filter(role =>!oldRoles.has(role.id));

    const removeRoles = oldRoles.filter(role =>!newRoles.has(role.id));

    if (addRoles.size > 0) {
        await panelUpdate(addRoles.first().id);
    }else if (removeRoles.size > 0) {
        await panelUpdate(removeRoles.first().id);
    }
});

/**
 * メッセージ送信イベント
 */
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) {
        return;
    }

    const member = message.member;

    const tomlContent = fs.readFileSync(timeoutPath, "utf-8");

    const config = toml.parse(tomlContent);

    if (config.timeout && Array.isArray(config.timeout)) {

        const memberId = await config.timeout.find(timeout => timeout.memberId === member.id);

        const channelId = await config.timeout.find(timeout => timeout.channelId === message.channelId);

        if (memberId && channelId) {

            const guild = await client.guilds.fetch(await config.notice.guild);

            if (guild) {
                const channel = await guild.channels.fetch(await config.notice.channel);

                if (channel) {
                    const embed = new EmbedBuilder()
                                        .setTitle(`Timeout Message: ${message.author.displayName}`)
                                        .addFields({ name: `channel: ${message.channel.name}`, value: `${message.content}`})
                                        .setTimestamp();
                    
                    await channel.send({ embeds: [embed] });
                }
            }

            try {
                await message.delete();
            }catch (error) {
                console.error(error);
            }
        }
    }
});

/**
 * ボイスチャンネル接続イベント
 */
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const tomlContent = fs.readFileSync(timeoutPath, "utf-8");

    const config = toml.parse(tomlContent);

    if (config.timeout && Array.isArray(config.timeout)) {
        
        const memberId = await config.timeout.find(timeout => timeout.memberId === newState.member.id);

        const channelId = await config.timeout.find(timeout => timeout.channelId === newState.channelId);

        if (memberId && channelId) {
            await newState.member.voice.disconnect();
        }
    }
});

/**
 * パネルアップデート
 */
async function panelUpdate(roleId){
    const tomlContent = fs.readFileSync(panelPath, 'utf-8');

    const config = toml.parse(tomlContent);

    for (const key in config) {
        if (key !== 'panelList') {
            const roles = config[key];
            if (roles && Array.isArray(roles)) {
                if (roles.includes(roleId)) {
                    const panelData = config.panelList.find(panel => panel.name === key);
                    const guild = await client.guilds.fetch(panelData.guild);
                    if (guild) {
                        await guild.channels.fetch();
                        await guild.members.fetch();
                        await guild.roles.fetch();
                        const channel = await guild.channels.fetch(panelData.channel);
                        if (channel) {
                            const panel = await channel.messages.fetch(panelData.message);
                            if (panel) {
                                if (panel.editable) {
                                    let message = "";
                                    for (let index = 0; index < roles.length; index++) {
                                        const roleId = roles[index];
                                        if (roleId) {
                                            const role = await guild.roles.fetch(roleId);
                                            if (role) {
                                                message += "## <@&" + roleId + ">\n";
                                                let i = 0;
                                                for (const member of role.members) {
                                                    message += "<@" + await member[1].id + ">";
                                                    if (i < role.members.size - 1) {
                                                        message += ", ";
                                                        i++;
                                                    }
                                                }
                                                message += "\n計: " + role.members.size + "人";
                                                message += "\n\n";
                                            }
                                        }
                                    }

                                    if (message.length > 2000) {
                                        await panel.edit("パネルの文字数が2000文字を超過したため使用できません．");
                                        return;
                                    }

                                    await panel.edit({ content: message, allowedMentions: { parse: []}});
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
