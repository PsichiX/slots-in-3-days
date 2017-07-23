import process from 'process';
import express from 'express';
import bodyParser from 'body-parser';
import responses from './responses';
import api from './api';

const args = process.argv;
let argMode = null;
let arg = null;
let port = 80;

for (let i = 1, c = args.length; i < c; ++i) {
  arg = args[i];
  if (argMode === null) {
    if (arg === '-p' || arg === '--port') {
      argMode = 'port';
    }
  } else if(argMode === 'port') {
    port = parseInt(arg);
    argMode = null;
  }
}

const app = new express();

app.use(function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, token');
  next();
});
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(responses);

app.use('/api', api);

app.listen(port, () => {
  console.log('Slots backend is listening on port: ' + port);
});
