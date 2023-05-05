import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import cron from "node-cron";
import { api } from "./api.js";
config();

const { DISCORD_TOKEN, CHANNEL_NAME } = process.env;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const PEOPLE = [
  "Richard",
  "Patric",
  "Pamela",  
  "Emmanuel",
  "Rolyson",
  "Eliane",
  "Charles",
];

const WEEK = ["Sexta", "Segunda", "Terça", "Quarta", "Quinta"];
const HOLIDAYS = [];

let peopleList = PEOPLE;
let weekList = WEEK;
let lastPeopleRemoved = [];
let channel = null;
let bread_leo = false

function getPeopleDay() {
  if (peopleList.length === 0) {
    peopleList = PEOPLE;
  }

  const person = peopleList.shift();
  console.log(person);

  if (weekList.length === 0) {
    weekList = WEEK;
  }

  const day = weekList.shift();
  console.log(day);

  let bread_quantity = PEOPLE.length

  if (bread_leo) {
    bread_quantity += 1 
  }

  lastPeopleRemoved.push(person + " " + day + ":" + bread_quantity + " pães " );

  channel.send(lastPeopleRemoved[lastPeopleRemoved.length - 1]);
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

  channel.send(person + " " + day + ": " + quantity + " pães" )

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

  channel = client.channels.cache.find((ch) => ch.name === CHANNEL_NAME);
  channel.send("hello world!");
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
    getNextPersonOnQueue()
    // const pessoaDoDia = getPessoaDoDia();
    // await interaction.reply(`Hoje é dia de ${pessoaDoDia} trazer o pão`);
  } else if (interaction.commandName === "lista") {
    await interaction.reply(`lista: ${getLista()}`);
  } else if (interaction.commandName === "leo_quer_pao") {
    add_leo_bread()
  } else if (interaction.commandName === "leo_nao_quer_pao") {
    remove_leo_bread()
  }
});

client.login(DISCORD_TOKEN);

cron.schedule("0 9 * * *", () => {
  removeElement();
});
