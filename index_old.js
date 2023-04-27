import {Client} from 'discord.js'
import { config } from 'dotenv'
config();


// const Discord = require('discord.js');

const client = new Client({ intents: [] });
const PREFIX = '!';

const lista = [
  { dia: 'Segunda-feira', pessoa: 'Fulano' },
  { dia: 'Terça-feira', pessoa: 'Ciclano' },
  { dia: 'Quarta-feira', pessoa: 'Beltrano' },
  { dia: 'Quinta-feira', pessoa: 'Deltrano' },
  { dia: 'Sexta-feira', pessoa: 'Estrano' },
];

function getPessoaDoDia() {
  const hoje = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const diaDaSemana = hoje.toLocaleDateString('pt-BR', options)
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

client.on('message', (message) => {
  console.log(message.channel);
  if (message.author.bot) return;

  if (message.content.startsWith(PREFIX)) {
    const [command, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);

    if (command === 'paododia') {
      const pessoaDoDia = getPessoaDoDia();
      message.channel.send(`Hoje é dia de ${pessoaDoDia} trazer o pão`);
    } else if (command === 'listapao') {
      const listaTexto = getLista();
      message.channel.send(listaTexto);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);


// const message = { content: '!paododia', channel: 'teste', author: { bot: false } };
// client.emit('message', message);