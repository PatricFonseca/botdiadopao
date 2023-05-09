import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import cron from "node-cron";
import { api } from "./api.js";
config();

const { DISCORD_TOKEN, CHANNEL_NAME } = process.env;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const PEOPLE = [
  {nome: "Pamela", gif: 'https://media.discordapp.net/attachments/1103657441389981740/1105200543103717507/Video_sem_titulo_Feito_com_o_Clipchamp_1.gif'}  ,
  {nome: "Emmanuel", gif: 'https://media.discordapp.net/attachments/1103657441389981740/1105202380104024204/Video_sem_titulo_Feito_com_o_Clipchamp_4.gif'},
  {nome: "Rolyson", gif: 'https://media.discordapp.net/attachments/1103657441389981740/1105215285851586630/Video_sem_titulo_Feito_com_o_Clipchamp.gif'},
  {nome: "Eliane", gif: 'https://media.tenor.com/AkILqGsdIFoAAAAC/pokemon-ash.gif'},
  {nome: "Charles", gif: 'https://media.discordapp.net/attachments/1103657441389981740/1105215228033126510/Video_sem_titulo_Feito_com_o_Clipchamp_5.gif'},
  {nome: "Richard", gif: 'https://media.discordapp.net/attachments/1103657441389981740/1105202380976439376/Video_sem_titulo_Feito_com_o_Clipchamp_2.gif'},
  { nome: "Patric", gif: 'https://media.discordapp.net/attachments/1103657441389981740/1105202380611530893/Video_sem_titulo_Feito_com_o_Clipchamp_3.gif' }
];

const WEEK = ["Terça", "Quarta", "Quinta", "Sexta", "Segunda"];
const HOLIDAYS = [];

let peopleList = PEOPLE.slice();
let weekList = WEEK;
let lastPeopleRemoved = [];
let channel = null;
let bread_leo = false
let response = ""

function getPeopleDay() {
  if (peopleList.length === 0) {
    peopleList = PEOPLE.slice();
  }

  const person = peopleList.shift();
  console.log(person);

  if (weekList.length === 0) {
    weekList = WEEK.slice();
  }

  const day = weekList.shift();
  console.log(day);

  let bread_quantity = PEOPLE.length

  if (bread_leo) {
    bread_quantity += 1 
  }

  response = person.nome + " " + day + ":" + bread_quantity + " pães " + " " + person.gif 

  // lastPeopleRemoved.push(person.nome + " " + day + ":" + bread_quantity + " pães " );

  // channel.send(lastPeopleRemoved[lastPeopleRemoved.length - 1]);
  channel.send(response)

  //Removo independente se foi alterado ou nÃo
  remove_leo_bread();
  // return timePeople + weekday
}

function getNextPersonOnQueue() {
  let person = null
  let day = null

  if (peopleList.length > 0) { 
    person = peopleList[0]
  } else {
    person = PEOPLE[0]
  }

  if (weekList.length > 0) { 
    day = weekList[0]
  }
  else {
    day = WEEK[0]
  }

  let quantity = bread_leo ? PEOPLE.length + 1 : PEOPLE.length  

  console.log(person.nome + " " + day + ": " + quantity + " pães")

  return person.nome + " " + day + ": " + quantity + " pães" + " " + person.gif

}

function removeElement() {
  // Obtenha a hora atual
  const now = new Date();

  // Formatando a data atual para o formato yyyy-mm-dd
  const formatedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

  // está entre segunda e sexta
  if (now.getDay() >= 1 && now.getDay() <= 5) {
    // se não é um feriado
    if (!HOLIDAYS.includes(formatedDate)) {
      getPeopleDay();
    }
  }
  // }
}

async function loadHolidays() {
  const res = await api.get("2023/BR");
  res.data.map((data) => {
    HOLIDAYS.push(data.date);
  });
}

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  await loadHolidays();

  // Itera sobre todos os servidores em que o bot está presente
  client.guilds.cache.forEach(guild => {
    // Envia a mensagem para o canal geral de cada servidor
    channel = guild.channels.cache.find(channel => channel.name === CHANNEL_NAME);
    
    if (channel && channel.type === 0){
      // channel.send('Teste!');
    }
  });
  

  // channel = client.channels.cache.find((ch) => ch.name === CHANNEL_NAME);
  // channel.send("hello world!");
});

function getLista() {
  let listaTexto = "Lista de pessoas para o pão da semana:\n\n";

  for (let i = 0; i < lista.length; i++) {
    const item = lista[i];
    listaTexto += `${item.dia}: ${item.pessoa}\n`;
  }

  return listaTexto;
}

function add_leo_bread() {
  bread_leo = true
}

function remove_leo_bread() { 
  bread_leo = false
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  } else if (interaction.commandName === "amanha") {
    await interaction.reply(getNextPersonOnQueue())
    // const pessoaDoDia = getPessoaDoDia();
    // await interaction.reply(`Hoje é dia de ${pessoaDoDia} trazer o pão`);
  } else if (interaction.commandName === "lista") {
    await interaction.reply(`lista: ${getLista()}`);
  } else if (interaction.commandName === "leo_quer_pao") {
    add_leo_bread()
    await interaction.reply("Leo quer um pão");
  } else if (interaction.commandName === "leo_nao_quer_pao") {
    remove_leo_bread()
    await interaction.reply("Ta tudo bem? Quer um abraço?");
  }
});

client.login(DISCORD_TOKEN);

cron.schedule("0 9 * * *", () => {
  removeElement();
});
