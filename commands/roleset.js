/**
 * モジュールの読み込み
 */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const toml = require('@iarna/toml');
const path = require('path');

/**
 * tomlファイルのパス
 */
const filePath = path.resolve(__dirname, "../../config.toml");

/**
 * モジュール作成
 */
module.exports = {
    data: new SlashCommandBuilder()
                .setName('roleset')
                .setDescription('ロールの同期')
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    execute: async function(client, interaction) {
        const { commandName } = interaction;

        if (commandName === "roleset") {
            try{
                const mainGuild = await client.guilds.cache.get(process.env.MAIN_GUILD_ID);
                if (!mainGuild) {
                    await interaction.reply(`メインサーバーを取得できませんでした．`);
                    return;
                }
        
                const targetGuild = await client.guilds.cache.get(process.env.TARGET_GUILD_ID);
                if (!targetGuild) {
                    await interaction.reply(`ターゲットサーバーを取得できませんでした．`);
                    return;
                }
        
                const mainMembers = await mainGuild.members.fetch();
                const targetMembers = await targetGuild.members.fetch();
        
                await interaction.deferReply();

                const tomlContent = fs.readFileSync(filePath, 'utf-8');

                const config = toml.parse(tomlContent);

                let count = 0;
                if (config.roleList && Array.isArray(config.roleList)) {
                    for (let index = 0; index < config.roleList.length; index++) {
                        const roles = config.roleList[index];
                        if (roles) {
                            const mainRole = await mainGuild.roles.fetch(roles.main);
                            const targetRole = await targetGuild.roles.fetch(roles.target);
                            if (mainRole && targetRole) {
                                for (const member of targetMembers) {
                                    if (!member[1].user.bot && !member[1].roles.cache.has(targetRole)) {
                                        const mainMember = await mainMembers.get(member[1].id);
                                        if (mainMember) {
                                            if (mainMember.roles.cache.has(roles.main)) {
                                                await member[1].roles.add(targetRole);
                                                count++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                await interaction.editReply(`ロールの付与処理が完了しました．\n実行数: ${count}件`);
            }catch (error){
                console.log(error);
            }
        }
    },
};
