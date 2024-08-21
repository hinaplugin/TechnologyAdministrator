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

        let message = "";

        if (config.panelList && Array.isArray(config.panelList)) {
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

            interaction.editReply("送信完了");
            interaction.channel.send(message);
        }
    }
}
