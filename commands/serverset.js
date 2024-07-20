/**
 * モジュールの読み込み
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { adminId } = require('../config.json');

/**
 * モジュール作成
 */
module.exports = {
    data: new SlashCommandBuilder()
                .setName('serverset')
                .setDescription('サーバーの割り当て通知')
                .addStringOption(option => option.setName('message').setDescription('通知するメッセージID').setRequired(true))
                .addStringOption(option => option.setName('server').setDescription('割り当てたサーバー名').setRequired(true))
                .addStringOption(option => option.setName('version').setDescription('割り当てたサーバーのバージョン').setRequired(true))
                .addStringOption(option => option.setName('op').setDescription('サーバーのOPプレイヤー').setRequired(false))
                .addStringOption(option => option.setName('whitelist').setDescription('サーバーのホワイトリストプレイヤー').setRequired(false))
                .addStringOption(option => option.setName('panel').setDescription('サーバーのパネルプレイヤー').setRequired(false)),
    execute: async function(client, interaction) {
        const { commandName, options } = interaction;

        if (commandName !== "serverset") {
            return;
        }

        const channel = interaction.channel;
        await channel.messages.fetch();
        const messageId = options.getString('message');
        const message = await channel.messages.cache.get(messageId);
        if (!message) {
            interaction.reply({ content: `申請メッセージを取得できませんでした．`, ephemeral: true });
            return;
        }
        const server = options.getString('server');
        const version = options.getString('version');
        const op = options.getString('op');
        const whitelist = options.getString('whitelist');
        const panel = options.getString('panel');
        const embed = new EmbedBuilder()
                                .setTitle('サーバー割り当て通知')
                                .addFields(
                                    { name: `サーバー`, value: server },
                                    { name: `バージョン`, value: version },
                                    { name: `OPプレイヤー`, value: `${op != null ? op.replace(/, /g, '\n') : `未設定`}` },
                                    { name: `ホワイトリスト`, value: `${whitelist != null ? whitelist.replace(/, /g, '\n') : `未設定`}` },
                                    { name: `パネル`, value: `${panel != null ? panel.replace(/, /g, '\n') : `未設定`}`}
                                )
                                .setColor(parseInt('b9d98b', 16))
                                .setTimestamp();
        await message.reply({ embeds: [embed] });
        await interaction.reply({ content: `サーバー割り当て通知を送信しました．`, ephemeral: true });

        const adminCh = await interaction.guild.channels.cache.get(adminId);

        if (!adminCh) {
            return;
        }

        const adminEmbed = new EmbedBuilder()
                                .setTitle('サーバー割り当て通知')
                                .addFields(
                                    { name: `サーバー`, value: server },
                                    { name: `バージョン`, value: version },
                                    { name: `OPプレイヤー`, value: `${op != null ? op.replace(/, /g, '\n') : `未設定`}` },
                                    { name: `ホワイトリスト`, value: `${whitelist != null ? whitelist.replace(/, /g, '\n') : `未設定`}` },
                                    { name: `パネル`, value: `${panel != null ? panel.replace(/, /g, '\n') : `未設定`}`},
                                    { name: `申請者`, value: message.member.displayName },
                                    { name: `承認者`, value: interaction.member.displayName }
                                )
                                .setColor(parseInt('b9d98b', 16))
                                .setTimestamp();

        await adminCh.send({ embeds: [adminEmbed] });
    },
};