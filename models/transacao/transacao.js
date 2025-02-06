const pool = require('../../database/connection');

const criarTransacao = async (dados) => {
    const query = `
        INSERT INTO controle_financeiro 
        (data, categoria, tipo, obs, valor, status)
        VALUES (?, ?, ?, ?, ?, ?)`;
    
    const params = [
        dados.data,
        dados.categoria,
        dados.tipo,
        dados.obs || '',
        dados.valor,
        dados.status || 'PENDENTE'
    ];

    const [result] = await pool.execute(query, params);
    return result;
};

const listarTransacoes = async () => {
  const query = `
    SELECT id, data as data2, DATE_FORMAT(data, '%d/%m/%Y') AS data, DATE_FORMAT(data, '%Y') AS ano, categoria, tipo, obs, valor, status 
    FROM controle_financeiro
    ORDER BY data2 DESC;`;
    
    const [rows] = await pool.execute(query);
    return rows;
};

module.exports = {
    criarTransacao,
    listarTransacoes
};
