const fs = require("fs");
const { execSync } = require("child_process");
const { Client, Collection, Intents } = require("discord.js");
const { token } = require("./config.json");
const logger = require("./logging");

logger.info("Starting...");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.revision = execSync("git rev-parse HEAD").toString().trim();

const
  commandFiles = fs.readdirSync(`${__dirname}/commands`).filter(f => f.endsWith(".js")),
  eventFiles = fs.readdirSync(`${__dirname}/events`).filter(f => f.endsWith(".js"));

client.commands = new Collection();
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token);
