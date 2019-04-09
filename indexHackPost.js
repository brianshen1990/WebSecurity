const express = require('express');
const session = require('express-session');
const app = express();
app.use(express.static('staticHackPost'))

app.listen(8889, () => console.log('Example app listening on port 8889!'))
