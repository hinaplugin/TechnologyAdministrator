/**
 * モジュールの読み込み
 */
const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const createpanelCommand = require('./commands/createpanel');

/**
 * 環境変数の読み込み
 */
dotenv.config();

/**
 * 登録するコマンド
 */
const commands = [
    createpanelCommand.data.toJSON(),
];

/**
 * Restの設定
 */
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

/**
 * コマンド登録
 */
(async () => {
    try{
        await rest.put(
            Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.ADMIN_GUILD_ID),
            { body: commands },
        );
        console.log('コマンドの登録が完了しました(・ω・)');
    }catch(error){
        console.error('コマンドの登録に失敗しました．', error);
    }
})();