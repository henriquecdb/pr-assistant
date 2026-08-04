require("dotenv").config();
const { EmbedBuilder, ActivityType } = require("discord.js");
const { getStorage, saveStorage } = require("../utils/storage");

const API_URL = process.env.API_URL;
let lastMapName = null;

async function fetchServerInfo() {
  try {
    const response = await fetch(API_URL, {
      headers: { "User-Agent": "DiscordBot-PR-Assistant/1.0" },
    });

    if (!response.ok) {
      throw new Error(
        `Erro na API: ${response.status} - ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao consultar a API", error.message);
    return null;
  }
}

async function updateDashboard(client) {
  const storage = getStorage();

  const data = await fetchServerInfo();
  if (!data) return;

  const serverId = process.env.RB_SERVER_ID;

  const servers = Array.isArray(data)
    ? data
    : data.servers
      ? data.servers
      : [data];

  const server = servers.find((server) => server.serverId === serverId);

  if (!server) {
    console.error("Nenhum dado de servidor foi encontrado no retorno da API.");
    return;
  }

  const serverName =
    server.name ||
    server.properties?.hostname.substring(13) ||
    "Servidor Placeholder";
  const mapName =
    server.mapname || server.properties?.mapname || "Mapa Desconhecido";
  const numPlayers = server.numplayers ?? server.properties?.numplayers ?? 0;
  const maxPlayers = server.maxplayers ?? server.properties?.maxplayers ?? 0;
  const gameMode = setGameMode(server.properties?.gametype);

  const statusText = `${mapName} [${numPlayers} | ${maxPlayers}] - ${gameMode}`;

  client.user.setPresence({
    activities: [{ name: statusText, type: ActivityType.Custom }],
    status: "online",
  });

  if (lastMapName !== mapName) {
    lastMapName = mapName;

    if (storage.notifications && storage.notifications.length > 0) {
      const targets = storage.notifications.filter(
        (n) => n.mapName.toLowerCase() === mapName.toLowerCase(),
      );

      for (const target of targets) {
        try {
          const user = await client.users.fetch(target.userId);
          if (user) {
            await user.send(
              `🎮 **Aviso de Mapa!** O mapa **${mapName}** está rodando agora no servidor **${serverName}**!\nPlayers: \`${numPlayers}/${maxPlayers}\` | Modo: \`${gameMode}\``,
            );
          }
        } catch (err) {
          console.log(
            `Não foi possível enviar DM para o usuário ID ${target.userId}.`,
          );
        }
      }
    }
  }

  const embed = new EmbedBuilder()
    .setTitle(`🎮 ${serverName}`)
    .setColor("#2F3136")
    .addFields(
      { name: "🗺️ Mapa Atual", value: `\`${mapName}\``, inline: true },
      {
        name: "👥 Jogadores Online",
        value: `\`${numPlayers} / ${maxPlayers}\``,
        inline: true,
      },
      { name: "🎯 Modo de Jogo", value: `\`${gameMode}\``, inline: true },
    )
    .setFooter({
      text: `Made by Spartacus | SPTS`,
    })
    .setTimestamp();

  if (!storage.guilds) return;

  for (const [guildId, config] of Object.entries(storage.guilds)) {
    if (!config.channelId) continue;

    try {
      const channel = await client.channels
        .fetch(config.channelId)
        .catch(() => null);
      if (!channel) continue;

      let targetMessage = null;
      if (config.messageId) {
        targetMessage = await channel.messages
          .fetch(config.messageId)
          .catch(() => null);
      }

      if (targetMessage) {
        await targetMessage.edit({ embeds: [embed] });
      } else {
        const newMessage = await channel.send({ embeds: [embed] });

        saveStorage((currentData) => {
          if (currentData.guilds && currentData.guilds[guildId]) {
            currentData.guilds[guildId].messageId = newMessage.id;
          }
          return currentData;
        });
      }
    } catch (error) {
      console.error(`Erro ao atualizar no servidor ${guildId}:`, error.message);
    }
  }
}

function startUpdater(client) {
  const INTERVAL_MS = 60000;

  updateDashboard(client);

  setInterval(() => updateDashboard(client), INTERVAL_MS);
}

function setGameMode(gameMode) {
  if (!gameMode) return "Project Reality";

  switch (gameMode) {
    case "gpm_cq":
      return "AAS";
    case "gpm_insurgency":
      return "INS";
    case "gpm_skirmish":
      return "Skirmish";
    case "gpm_gungame":
      return "Gungame";
    case "gpm_cnc":
      return "CNC";
    case "gpm_vehicles":
      return "VW";
  }
}

module.exports = { startUpdater };
