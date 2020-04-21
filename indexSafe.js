const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const UserInfoFile = './data/userInfo.json';
const UserInfo = require(UserInfoFile);
const helmet = require('helmet')

const saveUser = function() {
  return new Promise( (resolve, reject) => {
    fs.writeFile(UserInfoFile, JSON.stringify(UserInfo), (err) => {
      err ? reject(err) : resolve()
    });
  });
}

app.use(session({
  secret: 'our apps little secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/api/addUser', async (req, res) => {
  const {name, passwd} = req.body;
  if (name && passwd) {
    if (UserInfo[name]) {
      res.status(402).send({message: 'name exists!'})
      return;
    } else {
      const derivedKey = crypto.createHash('md5').update(req.body.passwd).digest("hex");
      UserInfo[req.body.name] = {
        passwd: derivedKey,
        points: 200,
      };
      await saveUser();
      res.status(200).send({message: 'success!'});
    }
  } else {
    res.status(402).send({message: 'body broken!'})
    return;
  }
});

app.post('/api/login', (req, res) => {
  const {name, passwd} = req.body;
  if (name && passwd) {
    if (!UserInfo[name]) {
      res.status(401).send({message: 'name or password error!'})
      return;
    } else {
      const derivedKey = crypto.createHash('md5').update(passwd).digest("hex");
      if ( UserInfo[name].passwd === derivedKey ) {
        req.session.login = true;
        req.session.name = name;
        res.status(200).send({ message: 'success!', name: req.session.name })
        return;
      } else {
        req.session.login = false;
        res.status(401).send({message: 'name or password error!'})
        return;
      };
    }
  } else {
    res.status(402).send({message: 'body broken!'})
    return;
  }
});

app.get('/api/logout', (req, res) => {
  req.session.login = false;
  res.send({message: 'success'})
});

const auth = function(req, res, next) {
  if (req.session.login) {
    if (!UserInfo[req.session.name]) {
      res.status(401).send({message: 'user not exists!'})
      return;
    } else {
      next();
    }
  } else {
    res.status(402).send({message: 'auth broken!'})
    return;
  }
}

const REFERES = [
  'http://localhost:8888',
];
const refererCheck = function(req, res, next) {
  const refer = req.header('referer');
  console.log(refer);
  if (!refer) {
    res.status(404).send({messgae: 'referer check failure!'})
    return;
  } else {
    let found = false;
    REFERES.forEach( (item) => {
      if (refer.startsWith(item)) {
        found = true;
        return false;
      }
    });
    if (found) {
      next();
    } else {
      res.status(404).send({messgae: 'referer check failure!'})
      return;
    }
  }
}

app.get('/api/checkLogin', refererCheck, auth, (req, res) => {
  res.status(200).send({name: req.session.name})
  return;
});

app.get('/api/getPoints', refererCheck, auth, (req, res) => {
  res.status(200).send({points: UserInfo[req.session.name].points})
  return;
});

app.get('/api/transferPoints', refererCheck, auth, (req, res) => {
  if (UserInfo[req.query.dstUser]) {
    UserInfo[req.session.name].points = UserInfo[req.session.name].points - 5;
    UserInfo[req.query.dstUser].points = UserInfo[req.query.dstUser].points + 5;
    saveUser().then( () => {
      res.status(200).send({message: 'success!' });
    }).catch( (err) => {
      res.status(500).send({message: 'Internal Server error!' });
    });
  return;
  } else {
    res.status(401).send({message: 'user not exists!'})
    return;
  }
});

app.get('/api/', (req, res) => res.send('Hello World!'))

app.use(express.static('staticFile'))

app.listen(8888, () => console.log('Example app listening on port 8888, visit: http://localhost:8888 !'))

