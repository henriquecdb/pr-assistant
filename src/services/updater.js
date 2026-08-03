require("dotenv").config();
const { EmbedBuilder, ActivityType } = require("discord.js");
const { getStorage, saveStorage } = require("../utils/storage");

const API_URL = process.env.API_URL;

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
  const { channelId, messageId } = getStorage();

  if (!channelId) return;

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

  try {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    let targetMessage = null;
    if (messageId) {
      targetMessage = await channel.messages.fetch(messageId).catch(() => null);
    }

    if (targetMessage) {
      await targetMessage.edit({ embeds: [embed] });
    } else {
      const newMessage = await channel.send({ embeds: [embed] });
      saveStorage({ messageId: newMessage.id });
    }
  } catch (error) {
    console.error("Erro ao atualizar a mensagem no canal:", error.message);
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
