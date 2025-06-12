const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Banco de dados em memória (para testes)
let receitas = [];

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Listar todas as receitas
app.get('/api/receitas', (req, res) => {
  res.json(receitas);
});

// Adicionar nova receita
app.post('/api/receitas', (req, res) => {
  const receita = req.body;
  receita.id = Date.now();
  receitas.unshift(receita);
  res.status(201).json(receita);
});

// Remover receita por id
app.delete('/api/receitas/:id', (req, res) => {
  const id = req.params.id;
  receitas = receitas.filter(r => String(r.id) !== String(id));
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});