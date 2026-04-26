const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const TOKEN = 'TOKEN = os.environ.get("TOKEN")';
const CLIENT_ID = '1496655502388498472';
const CANAL_ID = '1496658282373316658';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
    { name: 'sancionar', description: 'Registra una sanción', options: [
        { name: 'usuario', type: 6, description: 'Usuario', required: true },
        { name: 'tipo', type: 3, description: 'Tipo', required: true, choices: [{name:'Warn',value:'Warn'},{name:'Kick',value:'Kick'},{name:'Ban',value:'Ban'}] },
        { name: 'razon', type: 3, description: 'Razón', required: true }
    ]},
    { name: 'historial', description: 'Ver récord', options: [{ name: 'usuario', type: 6, description: 'Usuario', required: true }] },
    { name: 'eliminar', description: 'Borrar historial', options: [{ name: 'usuario', type: 6, description: 'Usuario', required: true }] }
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    console.log(`✅ BOT CONECTADO COMO: ${client.user.tag}`);
    try {
        console.log('Actualizando comandos...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('--- ✅ TODO LISTO PARA CHILE RP ---');
    } catch (error) {
        console.log('⚠️ Los comandos ya están cargados o hubo un retraso de Discord.');
    }
});

client.on('interactionCreate', async i => {
    if (!i.isChatInputCommand()) return;

    if (i.commandName === 'sancionar') {
        const u = i.options.getUser('usuario');
        const t = i.options.getString('tipo');
        const r = i.options.getString('razon');
        await db.push(`sanciones_${u.id}`, { t, r, f: new Date().toLocaleDateString() });
        const c = client.channels.cache.get(CANAL_ID);
        if (c) c.send({ embeds: [new EmbedBuilder().setTitle('⚖️ Registro').addFields({name:'👤 Usuario',value:u.username},{name:'🛠️ Tipo',value:t},{name:'📝 Razón',value:r}).setColor('#FF0000')] });
        await i.reply({ content: '✅ Guardado.', ephemeral: true });
    }

    if (i.commandName === 'historial') {
        const u = i.options.getUser('usuario');
        const l = await db.get(`sanciones_${u.id}`) || [];
        if (l.length === 0) return i.reply('✅ Limpio.');
        let txt = l.map((s, idx) => `**${idx+1}.** [${s.t}] - ${s.r}`).join('\n');
        await i.reply(`📂 Expediente de ${u.username}:\n${txt}`);
    }

    if (i.commandName === 'eliminar') {
        const u = i.options.getUser('usuario');
        await db.delete(`sanciones_${u.id}`);
        await i.reply(`🧹 Historial de **${u.tag}** borrado.`);
    }
});

client.login(TOKEN);