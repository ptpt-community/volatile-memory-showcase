const express = require('express');
const ejs = require('ejs');
const fs = require('fs').promises;
const index = express();
const bodyParser = require('body-parser');
require('dotenv').config();
index.use(bodyParser.json());
const mysql = require('mysql2');
const ejscms = require('ejscms');
const path = require("path");

const {Sequelize, DataTypes} = require('sequelize');

index.use(bodyParser.urlencoded({ extended: true }));

let dbprops = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_USER_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

const sequelize = new Sequelize(dbprops.database, dbprops.user, dbprops.password, {
  host: dbprops.host,
  dialect: 'mysql'
});


const Text = sequelize.define('Text', {
 content: {
    type: DataTypes.STRING,
    allowNull: false
  }

});

sequelize.sync().then(()=>console.log("sync!"));

console.log(dbprops);

ejscms.configure({
  staticHome: path.resolve("./static-home")
})

// Use body-parser middleware to parse request bodies

const dataArray = require('./data-emulator')

async function getAll(model) {
  const allData = await model.findAll();
  const parsedAllData = JSON.parse(JSON.stringify(allData));
  return parsedAllData;
}

index.post('/text/create', async (req, res) => {
  const data = req.body;
  //const text = await Text.create(data);
  const texts = dataArray;
  
  ejscms.commit("./template/frontend.ejs", {examples: texts},'home');
  res.send(200);
});


index.get('/text/read', async (req, res) => {
  const texts = await Text.findAll();
  const data = JSON.parse(JSON.stringify(texts));
  res.status(200).json(texts);
});

index.get('/text', async (req, res) => {
  let template = await fs.readFile("./template/frontend.ejs", "utf-8");
  const examples = dataArray;
  console.log(examples);
  let html = ejs.render(template, {examples});
  res.send(html).status(200);
});



// Start the server
const port = 3000;
index.listen(port, () => {
  console.log(`Server running  port ${port}`);
});
