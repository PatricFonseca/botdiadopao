import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import cron from "node-cron";
import { api } from "./lib/api.js";
import { PEOPLE } from "./lib/constants/people-list.js";
config();

const { DISCORD_TOKEN, CHANNEL_NAME } = process.env;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const WEEK = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

// const WEEK = ["Terça", "Quarta", "Quinta", "Sexta", "Segunda"];
const HOLIDAYS = [];

let peopleList = PEOPLE.slice();
// let weekList = WEEK;
let channel = null;
let bread_leo = false;
let response = "";

function getPersonDay() {
  if (peopleList.length === 0) {
    peopleList = PEOPLE.slice();
  }

  const person = peopleList.shift();
  console.log(person);

  const dayOfWeek = new Date().getDay();
  const dayName = WEEK[dayOfWeek];
  console.log(dayOfWeek);

  let bread_quantity = PEOPLE.length;

  if (bread_leo) {
    bread_quantity += 1;
  }

  response =
    person.nome +
    " " +
    dayName +
    ":" +
    bread_quantity +
    " pães " +
    " " +
    person.gif;

  channel.send(response);

  //Removo independente se foi alterado ou nÃo
  remove_leo_bread();
  // return timePeople + weekday
}

function getNextUtilDay() {
  let dayOfWeek = new Date().getDay();

  if (dayOfWeek == 0 || dayOfWeek == 6) {
    dayOfWeek = 1;
  }

  return WEEK[dayOfWeek];
}

function getNextPersonOnQueue() {
  let person = null;

  if (peopleList.length > 0) {
    person = peopleList[0];
  } else {
    person = PEOPLE[0];
  }

  const dayName = getNextUtilDay();

  let quantity = bread_leo ? PEOPLE.length + 1 : PEOPLE.length;

  console.log(person.nome + " " + dayName + ": " + quantity + " pães");

  return (
    person.nome + " " + dayName + ": " + quantity + " pães" + " " + person.gif
  );
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
      getPersonDay();
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
  client.guilds.cache.forEach((guild) => {
    // Envia a mensagem para o canal geral de cada servidor
    channel = guild.channels.cache.find(
      (channel) => channel.name === CHANNEL_NAME
    );

    if (channel && channel.type === 0) {
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
  bread_leo = true;
}

function remove_leo_bread() {
  bread_leo = false;
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  } else if (interaction.commandName === "amanha") {
    await interaction.reply(getNextPersonOnQueue());
    // const pessoaDoDia = getPessoaDoDia();
    // await interaction.reply(`Hoje é dia de ${pessoaDoDia} trazer o pão`);
  } else if (interaction.commandName === "lista") {
    await interaction.reply(`lista: ${getLista()}`);
  } else if (interaction.commandName === "leo_quer_pao") {
    add_leo_bread();
    await interaction.reply("Leo quer um pão");
  } else if (interaction.commandName === "leo_nao_quer_pao") {
    remove_leo_bread();
    await interaction.reply("Ta tudo bem? Quer um abraço?");
  }
});

client.login(DISCORD_TOKEN);

//Roda de 30 em 30 segundos
cron.schedule("30 * * * * * *", () => {
  console.log("working");
});

//Roda todo dia 6 horas
cron.schedule("0 9 * * *", () => {
  removeElement();
});
