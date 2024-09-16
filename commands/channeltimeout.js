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
                .addBooleanOption(option => option.setName('set').setDescription('設定または解除').setRequired(true)),
    execute: async function(interaction) {

        const { options } = interaction;

        await interaction.guild.members.fetch();

        const target = options.getMentionable('target');

        await interaction.reply(`メンション: ${target}`);
    }
}