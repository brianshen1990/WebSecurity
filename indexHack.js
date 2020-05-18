const express = require('express');

const app = express();
app.use(express.static('staticHack'))

app.listen(8889, () => console.log('Example app listening on port 8889, visit: http://localhost:8889 !'))

