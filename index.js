const { Client, PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } = require('discord.js');

require('dotenv').config();

const client = new Client({ intents: ['Guilds', 'GuildIntegrations', 'GuildMembers'] });

const emojis = {
    'maru': '⭕',
    'batu': '❌',
}

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
        name: 'giveadmin',
        description: '指定したユーザーにチャンネル管理権限を付与します。 (よく考えてから選択してください)',
        options: [
            {
                name: 'target',
                description: '指定するユーザー',
                type: ApplicationCommandOptionType.User,
                required: true,
            }
        ]
    },
    {
        name: 'deprivationadmin',
        description: '指定したユーザーからチャンネル管理権限を剥奪します。',
        options: [
            {
                name: 'target',
                description: '指定するユーザー',
                type: ApplicationCommandOptionType.User,
                required: true,
            }
        ]
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
        
        try {
            await interaction.channel.permissionOverwrites.edit(target.id, {
                'ViewChannel': false,
            });
        } catch (e) {
            await interaction.reply({
                content: `\`\`\`js\n${e}\n\`\`\``,
            });

            console.error(e);
        }

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
        
        try {
            await interaction.channel.permissionOverwrites.edit(target.id, {
                'ViewChannel': true,
            });
        } catch (e) {
            await interaction.reply({
                content: `\`\`\`js\n${e}\n\`\`\``,
            });

            console.error(e);
        }

        await interaction.reply({
            content: '正常に処理を完了しました。',
        });
    } else if (interaction.commandName === 'giveadmin') {
        if (!interaction.channel.permissionsFor(interaction.member).has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                content: 'あなたはチャンネル管理権限を所持してしません。管理権限を所持しているユーザーから権限を受け取って下さい。',
            });
        }

        const target = interaction.options.getMember('target');
        const approvalButtonCustomId = Math.random().toString(36).substring(7);
        const denialButtonCustomId = Math.random().toString(36).substring(7);

        const message = await interaction.reply({
            content: `本当に ${target} に ${interaction.channel} のチャンネル管理権限を付与してもいいですか？`,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(approvalButtonCustomId)
                            .setStyle(ButtonStyle.Success)
                            .setLabel(emojis.maru),

                        new ButtonBuilder()
                            .setCustomId(denialButtonCustomId)
                            .setStyle(ButtonStyle.Danger)
                            .setLabel(emojis.batu),
                    )
            ],
        });

        const confirmation = await message.awaitMessageComponent({ 
            componentType: ComponentType.Button,
            filter: (i) => interaction.user.id === i.user.id, 
        });

        switch (confirmation.customId) {
            case approvalButtonCustomId:
                try {
                    await interaction.channel.permissionOverwrites.edit(target.id, {
                        'ManageChannels': true,
                    });
                } catch (e) {
                    await interaction.reply({
                        content: `\`\`\`js\n${e}\n\`\`\``,
                    });
        
                    console.error(e);
                }

                await confirmation.update({
                    content: '正常に処理を完了しました。',
                    components: [],
                })
                break;
            
            case denialButtonCustomId:
                await confirmation.update({
                    content: '処理を中断しました。',
                    components: [],
                });
                break;
        }
    } else if (interaction.commandName === 'deprivationadmin') {
        if (!interaction.channel.permissionsFor(interaction.member).has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                content: 'あなたはチャンネル管理権限を所持してしません。管理権限を所持しているユーザーから権限を受け取って下さい。',
            });
        }

        const target = interaction.options.getMember('target');

        try {
            await interaction.channel.permissionOverwrites.edit(target.id, {
                'ManageChannels': false,
            });
        } catch (e) {
            await interaction.reply({
                content: `\`\`\`js\n${e}\n\`\`\``,
            });

            console.error(e);
        }

        await interaction.reply({
            content: '正常に処理を完了しました。',
        });
    } else if (interaction.commandName === 'check') {
        if (interaction.user.id !== '871527050685612042') {
            return interaction.reply({
                content: 'Only bot moderators can use this command.',
                ephemeral: true,
            });
        }

        const botPers = interaction.guild.members.me.permissions

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .addFields(
                        { name: 'MargeChannels', value: `\`${botPers.has(PermissionFlagsBits.ManageChannels)}\``},
                        { name: 'ReadMessageHistory', value: `\`${botPers.has(PermissionFlagsBits.ReadMessageHistory)}\``},
                        { name: 'SentMessages', value: `\`${botPers.has(PermissionFlagsBits.SendMessages)}\`` }
                    )
            ],
        });
    }
})

client.login(process.env['DISCORD_TOKEN']);
