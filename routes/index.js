const express = require('express');
const path = require('path');
const router = express.Router();

// Serve the index.html file for the root route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.post('/cadastrar', (req, res) => {
  const { tipo, categoria, valor, data } = req.body;
  // Aqui você adicionaria a lógica para salvar no banco de dados
  console.log('Novo registro:', { tipo, categoria, valor, data });
  res.sendStatus(200);
});

module.exports = router;
