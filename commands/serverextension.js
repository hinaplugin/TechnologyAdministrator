/**
 * モジュールの読み込み
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

/**
 * モジュール作成
 */

module.exports = {
    data: new SlashCommandBuilder()
                .setName('serverextension')
                .setDescription('貸し出し申請の延長受理')
                .addStringOption(option => option.setName('message').setDescription('通知するメッセージID').setRequired(true))
                .addStringOption(option => option.setName('duration').setDescription(`延長期間`).setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const { commandName, options } = interaction;

        if (commandName !== "serverextension") {
            return;
        }

        const channel = interaction.channel;
        await channel.messages.fetch();
        const messageId = options.getString('message');
        const duration = options.getString('duration');
        const message = await channel.messages.cache.get(messageId);
        if (!message) {
            interaction.reply({ content: `申請メッセージを取得できませんでした．`, ephemeral: true });
            return;
        }
        
        const embed = new EmbedBuilder()
                            .setTitle('サーバー貸し出し申請延長')
                            .addFields(
                                { name: `申請者`, value: message.member.displayName },
                                { name: `延長期間`, value: `${duration}` }
                            )
                            .setColor(parseInt('b9d98b', 16))
                            .setTimestamp();
        await message.reply({ embeds: [embed] });
        await interaction.reply({ content: `サーバー貸し出し申請を受理しました．`, ephemeral: true });

        const adminCh = await interaction.guild.channels.cache.get(process.env.ADMIN_CH_ID);

        if (!adminCh) {
            return;
        }

        const adminEmbed = new EmbedBuilder()
                            .setTitle('サーバー貸し出し申請延長')
                            .addFields(
                                { name: `申請者`, value: message.member.displayName },
                                { name: `延長期間`, value: `${duration}` },
                                { name: `承認者`, value: interaction.member.displayName  }
                            )
                            .setColor(parseInt('b9d98b', 16))
                            .setTimestamp();

        await adminCh.send({ embeds: [adminEmbed] });
    }
};
