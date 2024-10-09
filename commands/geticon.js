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
const filePath = path.resolve(__dirname, "../../admin.toml");

/**
 * モジュール作成
 */
module.exports = {
    data: new SlashCommandBuilder()
                .setName('geticon')
                .setDescription('ユーザーのアイコンを取得')
                .addMentionableOption(option => option.setName('target').setDescription('取得したいユーザー').setRequired(true)),
    execute: async function(interaction) {

        await interaction.deferReply();

        const { options } = interaction;

        const targetMember = options.getMentionable('target');

        const target = await interaction.guild.members.fetch(targetMember.user.id);

        if (!target) {
            await interaction.editReply({ content: `${target}を取得できませんでした．`, ephemeral: true });
            return;
        }

        await interaction.editReply({ content: `〇 ${target.displayName}\n${target.displayAvatarURL()}`, ephemeral: true });
    }
}
