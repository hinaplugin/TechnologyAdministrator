/**
 * モジュールの読み込み
 */
const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const serversetCommand = require('./commands/serverset');
const rolesetCommand = require('./commands/roleset');
const createpanelCommand = require('./commands/createpanel');
const serverextensionCommand = require('./commands/serverextension');
const channeltimeoutCommand = require('./commands/channeltimeout');

/**
 * 環境変数の読み込み
 */
dotenv.config();

/**
 * 登録するコマンド
 */
const commands = [
    serversetCommand.data.toJSON(),
    rolesetCommand.data.toJSON(),
    createpanelCommand.data.toJSON(),
    serverextensionCommand.data.toJSON(),
    channeltimeoutCommand.data.toJSON(),
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
            Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID),
            { body: commands },
        );
        console.log('コマンドの登録が完了しました(・ω・)');
    }catch(error){
        console.error('コマンドの登録に失敗しました．', error);
    }
})();
