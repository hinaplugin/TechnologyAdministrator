/**
 * モジュールの読み込み
 */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const toml = require('@iarna/toml');
const path = require('path');

/**
 * timeout.tomlのパス
 */
const filePath = path.resolve(__dirname, "../../timeout.toml");

/**
 * モジュールの作成
 */
module.exports = {
    data: new SlashCommandBuilder()
                .setName('channeltimeout')
                .setDescription('チャンネル別のタイムアウト')
                .addMentionableOption(option => option.setName('target').setDescription('タイムアウトのターゲット').setRequired(true))
                .addChannelOption(option => option.setName('channel').setDescription('タイムアウトするチャンネル').setRequired(true))
                .addBooleanOption(option => option.setName('set').setDescription('設定または解除').setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    execute: async function(interaction) {

        const { options } = interaction;

        await interaction.guild.members.fetch();

        const target = options.getMentionable('target');

        const channel = options.getChannel('channel');

        const set = options.getBoolean('set');

        const tomlContent = fs.readFileSync(filePath, 'utf-8');

        const config = toml.parse(tomlContent);

        if (!target.user) {
            await interaction.reply({ content: 'ユーザーをメンションしてください．', ephemeral: true });
            return;
        }

        if (config.timeout && Array.isArray(config.timeout)) {
            if (set) {
                const isSet = config.timeout.find(timeout => timeout.memberId === target.user.id && timeout.channelId === channel.id);
                if (isSet) {
                    await interaction.reply({ content: `${target}は既に${channel}でタイムアウトされています．`, ephemeral: true });
                    return;
                }

                fs.writeFileSync(filePath, stringifyConfigAdd(config, target, channel));
                await interaction.reply({ content: `${target}を${channel}でタイムアウトしました．`});
            }else {
                const isSet = config.timeout.find(timeout => timeout.memberId === target.user.id && timeout.channelId === channel.id);
                if (!isSet) {
                    await interaction.reply({ content: `${target}は${channel}でタイムアウトされていません．`, ephemeral: true });
                    return;
                }

                fs.writeFileSync(filePath, stringifyConfigRemove(config, target, channel));
                await interaction.reply({ content: `${target}の${channel}でのタイムアウトを解除しました．`});
            }
        }
    }
}

function stringifyConfigAdd(data, member, channel) {
    let noticeString = `notice = { guild = "${data.notice.guild}", channel = "${data.notice.channel}" }\n\n`;

    let timeoutString = `timeout = [\n`
    for (const target of data.timeout) {
        timeoutString += `    { memberName = "${target.memberName}", memberId = "${target.memberId}", channelName = "${target.channelName}", channelId = "${target.channelId}"},\n`;
    }
    timeoutString += `    { memberName = "${member.user.displayName}", memberId = "${member.user.id}", channelName = "${channel.name}", channelId = "${channel.id}" }\n`;
    timeoutString += `]`;

    return noticeString + timeoutString;
}

function stringifyConfigRemove(data, member, channel) {
    let noticeString = `notice = { guild = "${data.notice.guild}", channel = "${data.notice.channel}" }\n\n`;

    let timeoutString = `timeout = [\n`
    for (const target of data.timeout) {
        if (target.memberId === member.user.id && target.channelId === channel.id) {
            continue;
        }
        timeoutString += `    { memberName = "${target.memberName}", memberId = "${target.memberId}", channelName = "${target.channelName}", channelId = "${target.channelId}"},\n`;
    }
    timeoutString += `]`;

    return noticeString + timeoutString;
}
