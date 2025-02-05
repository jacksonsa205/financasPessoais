const Model = require('../../models/transacao/transacao');

// Centralização de erros
const handleDatabaseError = (res, error) => {
  console.error('Erro no banco de dados:', error);
  return res.status(500).json({ error: 'Erro na operação com o banco de dados' });
};

// Operação de criação
const post = async (req, res) => {
  try {
    const resultado = await Model.criarTransacao(req.body);
    res.status(201).json({
      id: resultado.insertId,
      message: 'Transação cadastrada com sucesso!'
    });
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

// Operação de listagem
const get = async (req, res) => {
  try {
    const transacoes = await Model.listarTransacoes();
    res.json(transacoes);
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

module.exports = {
  post,
  get
};