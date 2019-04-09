const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const UserInfoFile = './data/userInfo.json';
const UserInfo = require(UserInfoFile);

const saveUser = function() {
  return new Promise( (resolve, reject) => {
    fs.writeFile(UserInfoFile, JSON.stringify(UserInfo), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

app.use(session({
  secret: 'our apps little secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


app.post('/api/addUser', (req, res) => {
  if (req.body.name && req.body.passwd) {
    if (UserInfo[req.body.name]) {
      res.status(402).send({messgae: 'name exists!'})
      return;
    } else {
      const derivedKey = crypto.createHash('md5').update(req.body.passwd).digest("hex");
      UserInfo[req.body.name] = {
        passwd: derivedKey,
        points: 200,
      };
      saveUser().then( () => {
        res.status(200).send({messgae: 'success!'})
        return;
      }).catch( (err) => {
        res.status(500).send({messgae: 'Internal server error!'})
        return;
      });
    }
  } else {
    res.status(402).send({messgae: 'body broken!'})
    return;
  }
});


const setCSRF  = function(req, res) {
  const tempCsrf = `${Math.random()}`;
  req.session.csrf = tempCsrf;
  res.setHeader("csrf", tempCsrf);
}

const clearCSRF  = function(req, res) {
  req.session.csrf = '';
}

const checkCSRF = function(req, res, next) {
  console.log(req.headers.csrf);
  console.log(req.session.csrf);
  if ( req.headers.csrf && req.session.csrf && req.session.csrf === req.headers.csrf ){
    setCSRF(req, res);
    next();
  } else {
    clearCSRF(req, res);
    res.status(403).send({messgae: 'CSRF Failure!'})
  }
}

app.post('/api/login', (req, res) => {
  if (req.body.name && req.body.passwd) {
    if (!UserInfo[req.body.name]) {
      res.status(401).send({messgae: 'name or password error!'})
      return;
    } else {
      const derivedKey = crypto.createHash('md5').update(req.body.passwd).digest("hex");
      if ( UserInfo[req.body.name].passwd === derivedKey ) {
        req.session.login = true;
        req.session.name = req.body.name;
        setCSRF(req, res);
        res.status(200).send({
          messgae: 'success!'
        });
        return;
      } else {
        req.session.login = false;
        res.status(401).send({messgae: 'name or password error!'})
        return;
      };
    }
  } else {
    res.status(402).send({messgae: 'body broken!'})
    return;
  }
});

const auth = function(req, res, next) {
  if (req.session.login) {
    if (!UserInfo[req.session.name]) {
      res.status(401).send({messgae: 'user not exists!'})
      return;
    } else {
      next();
    }
  } else {
    res.status(402).send({messgae: 'auth broken!'})
    return;
  }
}

app.get('/api/getPoints', auth, (req, res) => {
  res.status(200).send({points: UserInfo[req.session.name].points})
  return;
});

app.post('/api/transferPoints', auth, checkCSRF, (req, res) => {
  if (UserInfo[req.body.dstUser]) {
    UserInfo[req.session.name].points = UserInfo[req.session.name].points - 5;
    UserInfo[req.body.dstUser].points = UserInfo[req.body.dstUser].points + 5;
    saveUser().then( () => {
      res.status(200).send({message: 'success!' });
    }).catch( (err) => {
      res.status(500).send({message: 'Internal Server error!' });
    });
  return;
  } else {
    res.status(401).send({messgae: 'user not exists!'})
    return;
  }
});

app.get('/api/', (req, res) => res.send('Hello World!'))

app.use(express.static('staticFileSafeCSRF'))

app.listen(8888, () => console.log('Example app listening on port 8888!'))

