/**
 * モジュールの読み込み
 */
const { SlashCommandBuilder } = require('discord.js');

/**
 * モジュール作成
 */
module.exports = {
    data: new SlashCommandBuilder()
                .setName('roleset')
                .setDescription('ロールの同期'),
    execute: async function(client, interaction) {
        const { commandName } = interaction;

        if (commandName === "roleset") {
            try{
                const mainGuild = await client.guilds.cache.get(process.env.MAIN_GUILD_ID);
                if (!mainGuild) {
                    await interaction.reply(`メインサーバーを取得できませんでした．`);
                    return;
                }
        
                const mainRole = await mainGuild.roles.fetch(process.env.MAIN_ROLE_ID);
                if (!mainRole) {
                    await interaction.reply(`メインロールを取得できませんでした．`);
                    return;
                }
        
                const targetGuild = await client.guilds.cache.get(process.env.TARGET_GUILD_ID);
                if (!targetGuild) {
                    await interaction.reply(`ターゲットサーバーを取得できませんでした．`);
                    return;
                }
        
                const targetRole = await targetGuild.roles.fetch(process.env.TARGET_ROLE_ID);
                if (!targetRole) {
                    await interaction.reply(`ターゲットロールを取得できませんでした．`);
                }
        
                const mainMembers = await mainGuild.members.fetch();
                const targetMembers = await targetGuild.members.fetch();
        
                await interaction.deferReply();
        
                await targetMembers.forEach(async (member) => {
                    if (!member.user.bot && !member.roles.cache.has(targetRole)) {
                        const mainMember = await mainMembers.get(member.id);
                        if (mainMember) {
                            if (mainMember.roles.cache.has(process.env.MAIN_ROLE_ID)) {
                                await member.roles.add(targetRole);
                            }
                        }
                    }
                });

                await interaction.editReply(`ロールの付与処理が完了しました．`);
            }catch (error){
                console.log(error);
            }
        }
    },
};
