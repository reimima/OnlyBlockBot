const { Client, PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

require('dotenv').config();

const client = new Client({ intents: ['Guilds', 'GuildIntegrations', 'GuildMembers'] });

const commands = [
    {
        name: 'block',
        description: '指定したユーザーをブロックします。',
        options: [
            {
                name: 'target',
                description: '指定するユーザー',
                type: ApplicationCommandOptionType.User,
                required: true,
            },
        ],
    },
    {
        name: 'unblock',
        description: '指定したユーザーのブロックを解除します。',
        options: [
            {
                name: 'target',
                description: '指定するユーザー',
                type: ApplicationCommandOptionType.User,
                required: true,
            },
        ],
    },
    {
        name: 'check',
        description: 'Check bot permissions in namek.',
    }
]

client.once('ready', () => {
    console.info('Bot has been ready!');

    ['1075366696220626965', '705003456984907786'].map(id => client.guilds.cache.get(id).commands.set(commands));
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'block') {
        if (!interaction.channel.permissionsFor(interaction.member).has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                content: 'あなたはチャンネル管理権限を所持してしません。管理権限を所持しているユーザーから権限を受け取って下さい。',
            });
        }

        const target = interaction.options.getMember('target');
        
        await interaction.channel.permissionOverwrites.set([
            {
                id: target.user.id,
                deny: [PermissionFlagsBits.ViewChannel],
                type: 'member',
            },
        ]);

        await interaction.reply({
            content: '正常に処理を完了しました。',
        });
    } else if (interaction.commandName === 'unblock') {
        if (!interaction.channel.permissionsFor(interaction.member).has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                content: 'あなたはチャンネル管理権限を所持してしません。管理権限を所持しているユーザーから権限を受け取って下さい。',
            });
        }

        const target = interaction.options.getMember('target');
        
        await interaction.channel.permissionOverwrites.set([
            {
                id: target.user.id,
                allow: [PermissionFlagsBits.ViewChannel],
                type: 'member',
            },
        ]);

        await interaction.reply({
            content: '正常に処理を完了しました。',
        });
    } else if (interaction.commandName === 'check') {
        if (interaction.user.id !== '871527050685612042') return;

        const botPers = interaction.guild.members.me.permissions

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .addFields(
                        { name: 'MargeChannels', value: `\`${botPers.has(PermissionFlagsBits.ManageChannels)}\``},
                        { name: 'ReadMessageHistory', value: `\`${botPers.has(PermissionFlagsBits.ReadMessageHistory)}\``},
                        { name: 'ModMembers', value: `\`${botPers.has(PermissionFlagsBits.ModerateMembers)}\``},
                        { name: 'SentMessages', value: `\`${botPers.has(PermissionFlagsBits.SendMessages)}\`` }
                    )
            ],
            ephemeral: true,
        })
    }
})

client.login(process.env['DISCORD_TOKEN']);
