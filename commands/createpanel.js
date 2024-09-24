/**
 * モジュールの読み込み
 */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const toml = require('@iarna/toml');
const path = require('path');

/**
 * config.tomlのパス
 */
const filePath = path.resolve(__dirname, "../../panel.toml");

/**
 * モジュールの作成
 */
module.exports = {
    data: new SlashCommandBuilder()
                .setName('createpanel')
                .setDescription('自動更新のロールパネルを作成')
                .addStringOption(option => option.setName('name').setDescription('パネル名').setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    execute: async function(interaction) {

        const { commandName, options } = interaction;

        await interaction.guild.members.fetch();

        const panelName = options.getString('name');

        const tomlContent = fs.readFileSync(filePath, 'utf-8');

        const config = toml.parse(tomlContent);

        let message = "";

        const panel = config.panelList.find(panel => panel.name === panelName);
        if (!panel) {
            await interaction.reply({ content: "パネルが存在しないため作成できません", ephemeral: true });
            return;
        }

        const roles = config[panelName];
        if (!roles) {
            await interaction.reply({ content: "パネルの表示ロールが設定されていません．", ephemeral: true });
            return;
        }

        if (roles && Array.isArray(roles)) {
            for (let index = 0; index < roles.length; index++) {
                const roleId = roles[index];
                if (roleId) {
                    const role = await interaction.guild.roles.fetch(roleId);
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
                await interaction.reply({ content: "パネルの文字数が2000文字を超過しているため送信できません．", ephemeral: true });
                return;
            }

            await interaction.reply({ content: "パネルを送信しました", ephemeral: true });
            const sendMessage = await interaction.channel.send({ content: message, allowedMentions: { parse: []}});

            panel.guild = interaction.guild.id;
            panel.channel = interaction.channel.id;
            panel.message = sendMessage.id;

            const tomlString = stringifyConfig(config);
            fs.writeFileSync(filePath, tomlString);
        }
    }
}

function stringifyConfig(data) {

    let panelListString = 'panelList = [\n';
    for (const panel of data.panelList) {
        panelListString += `    { name = "${panel.name}", guild = "${panel.guild}", channel = "${panel.channel}", message = "${panel.message}" },\n`;
    }
    panelListString += ']\n\n';

    let roleListString = '';
    for (const key in data) {
        if (key !== 'panelList') {
            roleListString += `${key} = [\n`;
            for (const roleId of data[key]) {
                roleListString += `    "${roleId}",\n`;
            }
            roleListString += ']\n\n';
        }
    }

    return panelListString + roleListString;
}
