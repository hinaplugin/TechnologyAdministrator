/**
 * モジュールの読み込み
 */
const { Client, GatewayIntentBits, Events } = require('discord.js');
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
const serverextensionCommand = require('./commands/serverextension');
const createpanelCommand = require('./commands/createpanel');

/**
 * tomlファイルのパス
 */
const filePath = path.resolve(__dirname, "../config.toml");
const panelPath = path.resolve(__dirname, "../panel.toml");

/**
 * Readyイベント
 */
client.on(Events.ClientReady, async () => {
    client.user.setActivity({ name: `技術管理部`, type: 5 });
    console.log(`${client.user?.username ?? `Unknown`}が起動しました．`);
    client.guilds.cache.get(process.env.GUILD_ID).members.fetch();
    const guild = await client.guilds.cache.get(process.env.ADMIN_GUILD_ID);
    if (guild) {
        const channel = await guild.channels.fetch(process.env.ADMIN_ANNOUNCE_CHANNEL_ID);
        if (channel) {
            cron.schedule("0 0 22 * * 2,5", async () => {
                await channel.send("<@&1280504312513957918> もうすぐ執行部合同会だよ(*'▽')");
            })
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
                                                message += "## <@&" + roleId + ">    合計: " + role.members.size + "人\n";
                                                let i = 0;
                                                for (const member of role.members) {
                                                    message += "<@" + await member[1].id + ">";
                                                    if (i < role.members.size - 1) {
                                                        message += ", ";
                                                        i++;
                                                    }
                                                }
                                                message += "\n\n";
                                            }
                                        }
                                    }
                                    
                                    if (message.length > 2000) {
                                        await panel.edit("パネルの文字数が2000文字を超過したため使用できません．");
                                        return;
                                    }
                                    
                                    await panel.edit(message);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
