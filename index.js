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
  "Rolyson",
  "Emmanuel",
  "Pamela",
  "Charles",
  "Eliane",
];

const WEEK = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const HOLIDAYS = [];

let peopleList = PEOPLE;
let weekList = WEEK;
let lastPeopleRemoved = [];
let channel = null;

function getPeopleDay() {
  if (peopleList.length === 0) {
    peopleList = PEOPLE;
  }

  const timePeople = peopleList.shift();
  console.log(timePeople);

  if (weekList.length === 0) {
    weekList = WEEK;
  }

  const weekday = weekList.shift();
  console.log(weekday);

  lastPeopleRemoved.push(timePeople + " " + weekday);

  channel.send(lastPeopleRemoved[lastPeopleRemoved.length - 1]);
  // return timePeople + weekday
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

function getPessoaDoDia() {
  const hoje = new Date();
  const options = { weekday: "long" }; //, year: 'numeric', month: 'long', day: 'numeric'
  const diaDaSemana = hoje.toLocaleDateString("pt-BR", options);

  console.log(diaDaSemana);

  for (let i = 0; i < lista.length; i++) {
    const item = lista[i];
    if (item.dia === diaDaSemana) {
      return item.pessoa;
    }
  }

  return "Não há pão hoje";
}

function getLista() {
  let listaTexto = "Lista de pessoas para o pão da semana:\n\n";

  for (let i = 0; i < lista.length; i++) {
    const item = lista[i];
    listaTexto += `${item.dia}: ${item.pessoa}\n`;
  }

  return listaTexto;
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  } else if (interaction.commandName === "amanha") {
    const pessoaDoDia = getPessoaDoDia();
    await interaction.reply(`Hoje é dia de ${pessoaDoDia} trazer o pão`);
  } else if (interaction.commandName === "lista") {
    await interaction.reply(`lista: ${getLista()}`);
  } else if (interaction.commandName === "pao") {
    await interaction.reply(
      `pao: ${lastPeopleRemoved[lastPeopleRemoved.length - 1]}`
    );
  }
});

client.login(DISCORD_TOKEN);

cron.schedule("0 0 * * *", () => {
  removeElement();
});
