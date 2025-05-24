/**
 * モジュールの読み込み
 */
const { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

/**
 * hyousyoujou.pngのパス
 */
const filePath = path.resolve(__dirname, "../../hyousyoujou.png");

/**
 * モジュールの作成
 */
module.exports = {
    data: new SlashCommandBuilder()
                .setName('award')
                .setDescription('表彰状を作成')
                .addStringOption(option => option.setName('target').setDescription('表彰プレイヤーの名前').setRequired(true))
                .addStringOption(option => option.setName('event').setDescription('イベント名').setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
    execute: async function(interaction) {

        await interaction.deferReply()

        const { options } = interaction;

        const target = options.getString('target');

        const event = options.getString('event');

        const date = new Date();

        const year = date.getFullYear();

        const month = date.getMonth() + 1;

        const day = date.getDate();

        const image = await loadImage(filePath);

        const canvas = createCanvas(image.width, image.height);

        const ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0);

        ctx.font = '70px "Noto Serif JP"';

        ctx.fillStyle = 'black';

        ctx.textAlign = 'right';

        ctx.fillText(target, 1200, 700);

        ctx.textAlign = "left";

        ctx.fillText(event, 430, 965);

        ctx.font = '60px "Noto Serif JP"';

        ctx.textAlign = "right";

        ctx.fillText(year, 500, 1790);

        ctx.fillText(month, 660, 1790);

        ctx.fillText(day, 820, 1790);

        const buffer = canvas.toBuffer('image/png');

        const attachment = new AttachmentBuilder(buffer, { name: 'hyousyou.png' });

        await interaction.followUp({ content: '表彰状を発行しました．', files: [attachment] });
    }
}
