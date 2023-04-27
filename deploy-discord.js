import { REST, Routes } from 'discord.js';
import { config } from 'dotenv'

config()

const {DISCORD_TOKEN, CLIENT_ID} = process.env

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'amanha',
    description: 'Dia do pão amanhã!',
  },
  {
    name: 'lista',
    description: 'lista de pessoas!',
  },
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}