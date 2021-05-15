// Brought you by StonksDev - https://github.com/StonksDev - https://www.stonkscoin.org/
const {Discord, Guild, Client, Channel, GuildMemberManager} = require('discord.js');
const client = new Client();
const {Account, Connection, PublicKey} = require('@solana/web3.js');
const {Market} = require('@project-serum/serum');
require('dotenv').config();

// Discord bot ID
client.login(process.env.DISCORDBOTID);
let connection = new Connection('https://api.mainnet-beta.solana.com/');
let programId = new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'); // Serum program v3
// Serum Market ID
let marketAddress = new PublicKey(process.env.MARKETADDRESS);
const guildId = process.env.GUILDID;
const preferredChannelId = process.env.PREFERREDCHANNELID;
const tokenName = process.env.TOKENNAME;
const tokenSymbol = process.env.TOKENSYMBOL;

const getApp = (guildId) => {
    const app = client.api.applications(client.user.id)
    if (guildId) {
        app.guilds(guildId)
    }
    return app;
}

client.on('ready', async () => {
    console.log(`BOT LIVE: Logged in as ${client.user.tag}!`);
    await getApp(guildId).commands.post({
        data: {
            "name": tokenName.toLowerCase(),
            "description": tokenName + " (" + tokenSymbol + ") price bot ",
            "options": [
                {
                    "name": "price",
                    "description": "Get the current " + tokenName + " (" + tokenSymbol + ") price",
                    "type": 1,
                },
                {
                    "name": "moon",
                    "description": "Indicate when moonings",
                    "type": 1,
                }
            ]
        }
    });

    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        if (!interaction.data.options || preferredChannelId != interaction['channel_id']) {
            return false;
        }

        const command = interaction.data.options[0].name;
        console.log(command);
        if (command === 'price') {
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: tokenSymbol + ': $' + await getCurrentPrice()
                    }
                }
            })
        } else if (command === 'moon') {
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: "Soon https://tenor.com/view/stonks-up-stongs-meme-stocks-gif-15715298"
                    }
                }
            })
        }
    })

    setInterval(async function () {
        // Update bot name with price
        var datetime = new Date();
        client.user.setUsername(tokenSymbol + ' $' + await getCurrentPrice());
        console.log('update on: ' + datetime);
    }, 900000);
})

async function getCurrentPrice() {
    let market = await Market.load(connection, marketAddress, {}, programId);
    let bids = await market.loadBids(connection);
    return Number(bids.getL2(1)[0][0]).toFixed(2);
}

