import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv'
config();

const { DISCORD_TOKEN } = process.env;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


const lista = [
  { dia: 'segunda-feira', pessoa: 'Patric' },
  { dia: 'terça-feira', pessoa: 'Richard' },
  { dia: 'quarta-feira', pessoa: 'Rolyson' },
  { dia: 'quinta-feira', pessoa: 'Emmanuel' },
  { dia: 'sexta-feira', pessoa: 'Pamela' },
];

function getPessoaDoDia() {
  const hoje = new Date();
  const options = { weekday: 'long'}; //, year: 'numeric', month: 'long', day: 'numeric' 
  const diaDaSemana = hoje.toLocaleDateString('pt-BR', options)

  console.log(diaDaSemana)
  // const diaDaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'segunda-feira' });

  for (let i = 0; i < lista.length; i++) {
    const item = lista[i];
    if (item.dia === diaDaSemana) {
      return item.pessoa;
    }
  }

  return 'Não há pão hoje';
}

function getLista() {
  let listaTexto = 'Lista de pessoas para o pão da semana:\n\n';

  for (let i = 0; i < lista.length; i++) {
    const item = lista[i];
    listaTexto += `${item.dia}: ${item.pessoa}\n`;
  }

  return listaTexto;
}


client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  } else if (interaction.commandName === 'amanha'){
    const pessoaDoDia = getPessoaDoDia();
    await interaction.reply(`Hoje é dia de ${pessoaDoDia} trazer o pão`);
  } else if (interaction.commandName === 'lista') {
    await interaction.reply(`lista: ${getLista()}`);
  }
  
});

client.login(DISCORD_TOKEN);