import express from 'express';
import path from 'path';

const api = express.Router();

const state = {
  expectSymbol: ''
};

api.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../static/admin.html'));
});

api.get('/expect/:symbol', (req, res) => {
  const { params } = req;
  const { symbol } = params;

  if (!symbol) {
    res.sendError(new Error('`symbol` parameter is not provided!'));
    return;
  }

  console.log(`* Expect symbol: ${symbol}`)

  state.expectSymbol = symbol;
  res.sendSuccess();
});

api.get('/expect', (req, res) => {
  console.log('* Reset expected symbol!');

  state.expectSymbol = '';
  res.sendSuccess();
});

api.get('/symbol', (req, res) => {
  console.log(`* Get symbol: ${state.expectSymbol}`)

  res.sendSuccess(state.expectSymbol);
});

export default api;
