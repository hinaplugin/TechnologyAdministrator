/**
 * モジュールの読み込み
 */
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

/**
 * Set-Listの変数
 */
const list = new Array();
let now = 1;

/**
 * モジュールの作成
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("set-list")
        .setDescription("セットリストを編集")
        .addSubcommand(command =>
            command.setName('add')
                .setDescription('曲を追加する')
                .addStringOption(option =>
                    option.setName('song')
                        .setDescription('追加する曲名')
                        .setRequired(true)
                )
        )
        .addSubcommand(command =>
            command.setName('remove')
                .setDescription('曲を削除する')
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('削除する曲番号')
                        .setMinValue(1)
                        .setRequired(true)
                )
        )
        .addSubcommand(command =>
            command.setName('next')
                .setDescription('次の曲へ進む')
        )
        .addSubcommand(command =>
            command.setName('back')
                .setDescription('前の曲へ戻る')
        )
        .addSubcommand(command =>
            command.setName('end')
                .setDescription('セットリストを終了する')
        )
        .addSubcommand(command =>
            command.setName('get')
            .setDescription('セットリストを取得')
        ),
    execute: async function (interaction) {
        const command = interaction.options.getSubcommand();
        const builder = new EmbedBuilder();
        builder.setTitle("セットリスト");
        builder.setColor(0xc9ff2f);
        if (command === "add") {
            const song = interaction.options.getString('song');
            await list.push(song);
            builder.setDescription(await getSetList());
            await interaction.reply(`${song}をセットリストに追加しました`);
            await interaction.channel.send({ embeds: [builder] });
        } else if (command === "remove") {
            const index = interaction.options.getInteger('index');
            if (!Number.isInteger(index) || index < 1 || index > list.length) {
                await interaction.reply(`番号: ${index} の曲は設定されていません`);
                return;
            }
            const remove = await list.splice(index - 1, 1);
            if (now > index) {
                now--;
            }
            builder.setDescription(await getSetList());
            await interaction.reply(`番号: ${index} の曲「${remove}」を削除しました`);
            await interaction.channel.send({ embeds: [builder] });
        } else if (command === "next") {
            if (now === list.length) {
                await interaction.reply(`現在が最後の曲のため実行されませんでした`);
                return;
            }
            now++;
            await interaction.reply(`現在の曲を: ${now}に設定しました`);
            builder.setDescription(await getSetList());
            await interaction.channel.send({ embeds: [builder] });
        } else if (command === "back") {
            if (now === 1) {
                await interaction.reply(`現在が最初の曲のため実行されませんでした`);
                return;
            }
            now--;
            await interaction.reply(`現在の曲を: ${now}に設定しました`);
            builder.setDescription(await getSetList());
            await interaction.channel.send({ embeds: [builder] });
        } else if (command === "end") {
            await list.splice(0);
            await interaction.reply(`セットリストを終了しました`);
        } else if (command === "get") {
            builder.setDescription(await getSetList());
            await interaction.reply({ embeds: [builder] });
        }
    }
}

async function getSetList() {
    let i = 1;
    let description = "";
    if (list.length == 0) {
        description += "セットリストに曲がありません";
    } else {
        await list.forEach(title => {
            description += i + ". " + title;
            if (i == now) {
                description += " ← Now";
            }
            if (i != list.length) {
                description += "\n";
                i++;
            }
        });
    }
    return description;
}