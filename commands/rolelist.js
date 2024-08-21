/**
 * モジュールの読み込み
 */
const { SlashCommandBuilder } = require('discord.js');
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
                .setName('rolelist')
                .setDescription('ロール所有者のリスト取得'),
    execute: async function(interaction) {
        await interaction.deferReply();

        await interaction.guild.members.fetch();

        const tomlContent = fs.readFileSync(filePath, 'utf-8');

        const config = toml.parse(tomlContent);

        if (config.panelList && Array.isArray(config.panelList)) {
            for (let index = 0; index < config.panelList.length; index++) {
                const roles = config.panelList[index];
                if (roles) {
                    const role = await interaction.guild.roles.fetch(roles);
                    if (role) {
                        let memberName = "";
                        const name = role.name;
                        for (const member of role.members) {
                            memberName += await member[1].displayName;
                            memberName += ", ";
                        }
                        console.log(name);
                        console.log(memberName);
                    }
                }
            }
        }
    }
}
