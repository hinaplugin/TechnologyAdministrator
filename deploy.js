/**
 * モジュールの読み込み
 */
const { REST, Routes } = require('discord.js');
const { token, applicationId, guildId } = require('./config.json');
const serversetCommand = require('./commands/serverset');
const rolesetCommand = require('./commands/roleset');
const gikaicreateCommand = require('./commands/gikaicreate');

/**
 * 登録するコマンド
 */
const commands = [
    serversetCommand.data.toJSON(),
    rolesetCommand.data.toJSON(),
];

/**
 * Restの設定
 */
const rest = new REST({ version: '10'}).setToken(token);

/**
 * コマンド登録
 */
(async () => {
    try{
        await rest.put(
            Routes.applicationGuildCommands(applicationId, guildId),
            { body: commands },
        );
        console.log('コマンドの登録が完了しました(・ω・)');
    }catch(error){
        console.error('コマンドの登録に失敗しました．', error);
    }
})();
