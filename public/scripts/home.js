function loadNavbar() {
  fetch('/components/navbar.html')
      .then(response => response.text())
      .then(data => {
          document.getElementById('navbar-container').innerHTML = data;
      })
      .catch(error => console.error('Erro ao carregar a navbar:', error));
}

// Chama a função ao carregar a página
window.onload = loadNavbar;



async function carregarDados() {
  try {
    const response = await fetch("/transacao/buscar");
    const transacoes = await response.json();

    // Processar os dados para cada tipo
    const despesas = processarDados(transacoes, "Despesa");
    const receitas = processarDados(transacoes, "Receita");
    const investimentos = processarDados(transacoes, "Investimento");

    preencherQuadro(despesas, "Despesas", "border-danger", "text-danger");
    preencherQuadro(receitas, "Receitas", "border-entradas", "text-entradas");
    preencherQuadro(investimentos, "Investimentos", "border-info", "text-info");
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
  }
}

function processarDados(transacoes, tipo) {
  // Filtra as transações pelo tipo exato
  const filtradas = transacoes.filter(t => t.tipo === tipo);

  // Agrupar por categoria
  const categorias = {};
  filtradas.forEach(t => {
    if (!categorias[t.categoria]) {
      categorias[t.categoria] = { total: 0, count: 0 };
    }
    categorias[t.categoria].total += parseFloat(t.valor);
    categorias[t.categoria].count += 1;
  });

  // Calcular totais e shares
  const totalGeral = Object.values(categorias).reduce((sum, cat) => sum + cat.total, 0);
  return Object.keys(categorias).map(categoria => {
    const total = categorias[categoria].total;
    const media = total / categorias[categoria].count;
    const share = totalGeral ? (total / totalGeral * 100).toFixed(2) : 0;

    return {
      nome: categoria,
      media: media,
      total: total,
      share: share + "%"
    };
  });
}

function preencherQuadro(dados, titulo, cardClass, textClass) {
  const elementoId = `tabela-${titulo.toLowerCase()}`;
  const tabela = document.getElementById(elementoId);
  
  if (!tabela) {
    console.error(`Elemento não encontrado: ${elementoId}`);
    return;
  }

  let totalGeral = 0;
  let totalMedia = 0;
  let html = "";

  if (dados.length === 0) {
    html = `<tr><td colspan="4" class="text-center">Nenhuma transação registrada</td></tr>`;
    tabela.innerHTML = html;
    return;
  }

  // Calcula o total geral real para shares corretos
  const totalGeralReal = dados.reduce((acc, cur) => acc + cur.total, 0);

  dados.forEach(categoria => {
    totalGeral += categoria.total;
    totalMedia += categoria.media;
    
    const share = totalGeralReal ? (categoria.total / totalGeralReal * 100) : 0;

    html += `
      <tr>
        <td class="pl-4">${categoria.nome}</td>
        <td class="text-right pr-4">R$ ${categoria.media.toFixed(2)}</td>
        <td class="text-right pr-4 ${textClass}">R$ ${categoria.total.toFixed(2)}</td>
        <td class="text-right pr-4">${share.toFixed(2)}%</td>
      </tr>
    `;
  });

  // Linha de total
  html += `
    <tr class="font-weight-bold">
      <td class="border-top pl-4">Total</td>
      <td class="text-right border-top pr-4">R$ ${(totalMedia / dados.length).toFixed(2)}</td>
      <td class="text-right border-top pr-4 ${textClass}">R$ ${totalGeral.toFixed(2)}</td>
      <td class="text-right border-top pr-4">100%</td>
    </tr>
  `;

  tabela.innerHTML = html;
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarDados();
});



