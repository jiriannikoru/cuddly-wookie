const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const sql = require("sqlite");
sql.open("./score.sqlite");


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} servers.`);
  client.user.setActivity(`with ${client.users.size} cuboids!` ); 
});

client.on('message', msg => { 
  if (msg.author.bot) return; //bot check
  if (msg.channel.type === "dm") return; //no dms
  if(msg.content.indexOf(config.prefix) !== 0) return; //prefix check
  
  const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    msg.channel.send('Pong!');

    sql.get(`SELECT * FROM scores WHERE userId ="${msg.author.id}"`).then(row => {
      if (!row) {
        sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [msg.author.id, 1, 0]);
      } else {
        let curLevel = Math.floor(0.1 * Math.sqrt(row.points + 1));
        if (curLevel > row.level) {
          row.level = curLevel;
          sql.run(`UPDATE scores SET points = ${row.points + 1}, level = ${row.level} WHERE userId = ${msg.author.id}`);
          msg.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
        }
        sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${msg.author.id}`);
      }
    }).catch(() => {
      console.error;
      sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => {
        sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [msg.author.id, 1, 0]);
      });
    });
    
    if (!msg.content.startsWith(config.prefix)) return;
    
    if (msg.content.startsWith(config.prefix + "level")) {
      sql.get(`SELECT * FROM scores WHERE userId ="${msg.author.id}"`).then(row => {
        if (!row) return msg.reply("Your current level is 0");
        msg.reply(`Your current level is ${row.level}`);
      });
    } else
    
    if (msg.content.startsWith(prefix + "points")) {
      sql.get(`SELECT * FROM scores WHERE userId ="${msg.author.id}"`).then(row => {
        if (!row) return msg.reply("sadly you do not have any points yet!");
        msg.reply(`you currently have ${row.points} points, good going!`);
      });
    } 
  }
});

client.login(config.token);