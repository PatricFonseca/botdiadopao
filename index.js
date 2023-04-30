import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv'
config();

const { DISCORD_TOKEN } = process.env;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const PEOPLE = [
  'Richard',
  'Patric',
  'Rolyson' ,
  'Emmanuel' ,
  'Pamela',
  'Charles',
  'Eliane'
]

const WEEK = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

let peopleList = PEOPLE;
let weekList = WEEK;
let lastPeopleRemoved = []

function getPeopleDay() {
  if (peopleList.length === 0) {
    peopleList = PEOPLE
  }

  const timePeople = peopleList.shift();
  console.log(timePeople)

  if (weekList.length === 0) {
    weekList = WEEK
  }

  const weekday = weekList.shift();
  console.log(weekday)

  lastPeopleRemoved.push(timePeople + weekday)
  // return timePeople + weekday
}

// Verifique se é meia-noite e remova um elemento da lista
function removeElement() {
  // Obtenha a hora atual
  const now = new Date();
  const hour = now.getUTCHours(); // use UTC para evitar problemas com fuso horário
  const minute = now.getUTCMinutes();

  // Verifique se é meia-noite (00:00 UTC)
  if (hour === 0 && minute === 0) {
    getPeopleDay()
    // Remova o primeiro elemento da lista
    // lista.shift();

    // Envie uma mensagem para o canal informando que um elemento foi removido
    // const channel = client.channels.cache.get(channelId);
    // channel.send(`Um elemento foi removido da lista. Nova lista: ${lista}`);
  }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Obtenha a hora atual em UTC
  const now = new Date();
  const hour = now.getUTCHours(); // use UTC para evitar problemas com fuso horário
  const minute = now.getUTCMinutes();

  // Calcule quanto tempo falta até a próxima meia-noite (00:00 UTC)
  const msUntilMidnight = (24 - hour) * 60 * 60 * 1000 - minute * 60 * 1000;

  // Espere até a próxima meia-noite (00:00 UTC) e, em seguida, execute a função de remoção de elementos uma vez por dia
  setTimeout(() => {
    removeElement();
    setInterval(removeElement, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
});





// const lista = [
//   { dia: 'segunda-feira', pessoa: 'Patric' },
//   { dia: 'terça-feira', pessoa: 'Richard' },
//   { dia: 'quarta-feira', pessoa: 'Rolyson' },
//   { dia: 'quinta-feira', pessoa: 'Emmanuel' },
//   { dia: 'sexta-feira', pessoa: 'Pamela' },
// ];

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
  } else if (interaction.commandName === 'pao') {
    await interaction.reply(`pao: ${lastPeopleRemoved[lastPeopleRemoved.length -1]}`);
  }
  
});

client.login(DISCORD_TOKEN);

