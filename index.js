const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();

const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

class User extends Model {}
User.init({
  username: DataTypes.STRING,
  passwd: DataTypes.STRING
}, { sequelize, modelName: 'user' });



const verifyUser = async (username, passwd) => {
  // user1" OR 1==1 ; "
  const res = await sequelize.query(`select count(*) from users where username="${username}" and passwd="${passwd}"`);
  // const res = await sequelize.query(`select count(*) from users`);
  return res[0][0]['count(*)'];
}

const verifyUserORM = async (username, passwd) => {
  const res = await User.count({ where: { username, passwd } });
  return res;
}

const initData = async () => {
  await sequelize.sync();
  await User.create({
    username: 'user1',
    passwd: crypto.createHash('md5').update('user1').digest("hex")
  });
  await User.create({
    username: 'user2',
    passwd: crypto.createHash('md5').update('user2').digest("hex")
  });
}

app.use(session({
  secret: 'our apps little secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.post('/api/login', async (req, res) => {
  const {name, passwd} = req.body;
  if (name && passwd) {
    const derivedKey = crypto.createHash('md5').update(passwd).digest("hex");
    // const cnt = await verifyUser(name, derivedKey);
    const cnt = await verifyUser(name, derivedKey);
    if ( cnt >= 1 ) {
      res.send({message: "success"});
    } else {
      res.status(401).send({message: 'name or password error!'})
    }
    return;
  } else {
    res.status(402).send({message: 'body broken!'})
    return;
  }
});

app.get('/api/', (req, res) => res.send('Hello World!'))

app.use(express.static('staticFile'))

initData().then( () => {
  app.listen(8888, () => console.log('Example app listening on port 8888, visit: http://localhost:8888 !'))
});
