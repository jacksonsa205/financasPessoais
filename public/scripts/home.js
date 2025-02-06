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


// Adicione esta variável global
let todasTransacoes = [];

// Função para extrair anos únicos das transações
function extrairAnosDisponiveis() {
  const anos = new Set();
  
  todasTransacoes.forEach(transacao => {
    // Converter a data para objeto Date
    const date = new Date(transacao.data);
    
    // Verificar se a data é válida
    if (!isNaN(date.getTime())) {
      const ano = date.getFullYear();
      anos.add(ano);
    }
  });
  
  // Converter para array e ordenar
  return Array.from(anos)
    .map(Number)
    .filter(ano => !isNaN(ano))
    .sort((a, b) => b - a);
}

// Função para popular o seletor de anos
function popularFiltroAnos() {
  const select = document.getElementById('filtro-ano');
  const anos = extrairAnosDisponiveis();
  
  // Limpar opções existentes
  select.innerHTML = '<option value="">Todos os anos</option>';
  
  anos.forEach(ano => {
    // Verificação adicional
    if (!isNaN(ano) && ano.toString().length === 4) {
      const option = document.createElement('option');
      option.value = ano;
      option.textContent = ano;
      select.appendChild(option);
    }
  });
}

// Função para filtrar transações por ano
function filtrarPorAno(ano) {
  if (!ano) return todasTransacoes;
  return todasTransacoes.filter(transacao => {
    return new Date(transacao.data).getFullYear() === parseInt(ano);
  });
}



// Função principal modificada
async function carregarDados() {
  try {
    const response = await fetch("/transacao/buscar");
    todasTransacoes = await response.json();
    
    // Popular o filtro de anos
    popularFiltroAnos();
    
    // Carregar dados inicialmente com todos os anos
    atualizarDados();
    
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
  }
}

// Função para atualizar os dados com base no filtro
function atualizarDados() {
  const anoSelecionado = document.getElementById('filtro-ano').value;
  const transacoesFiltradas = filtrarPorAno(anoSelecionado);

  const despesas = processarDados(transacoesFiltradas, "Despesa");
  const receitas = processarDados(transacoesFiltradas, "Receita");
  const investimentos = processarDados(transacoesFiltradas, "Investimento");

  preencherQuadro(despesas, "Despesas", "border-danger", "text-danger");
  preencherQuadro(receitas, "Receitas", "border-entradas", "text-entradas");
  preencherQuadro(investimentos, "Investimentos", "border-info", "text-info");
}

function processarDados(transacoes, tipo) {
  // Filtra e ordena as categorias
  const filtradas = transacoes.filter(t => t.tipo === tipo);
  
  const categorias = {};
  filtradas.forEach(t => {
    if (!categorias[t.categoria]) {
      categorias[t.categoria] = { total: 0, count: 0 };
    }
    categorias[t.categoria].total += parseFloat(t.valor);
    categorias[t.categoria].count += 1;
  });

  // Ordena as categorias alfabeticamente
  const categoriasOrdenadas = Object.keys(categorias).sort((a, b) => a.localeCompare(b));

  const totalGeral = Object.values(categorias).reduce((sum, cat) => sum + cat.total, 0);
  
  return categoriasOrdenadas.map(categoria => {
    const total = categorias[categoria].total;
    const media = total / categorias[categoria].count;
    const share = totalGeral ? (total / totalGeral * 100) : 0;

    return {
      nome: categoria,
      media: media,
      total: total,
      share: share
    };
  });
}

function calcularCorShare(share, tipo) {
  // Escala de cores com HSL (Matiz, Saturação, Luminosidade)
  if (tipo === 'Despesas') {
    const lightness = 100 - (Math.min(share, 50) * 2); // Quanto maior o share, mais escuro (vermelho)
    return `hsl(0, 70%, ${lightness}%)`;
  } else {
    const lightness = 100 - (Math.min(share, 50) * 1.5); // Verde mais suave
    return `hsl(120, 70%, ${lightness}%)`;
  }
}

function preencherQuadro(dados, titulo, cardClass, textClass) {
  const elementoId = `tabela-${titulo.toLowerCase()}`;
  const tabela = document.getElementById(elementoId);

  // Encontrar o maior share para escala de cores
  const maxShare = dados.length > 0 ? Math.max(...dados.map(d => d.share)) : 0;

  let html = "";
  let totalGeral = 0;
  let totalMedia = 0;

  if (dados.length === 0) {
    html = `<tr><td colspan="4" class="text-center">Nenhuma transação registrada</td></tr>`;
    tabela.innerHTML = html;
    return;
  }

  dados.forEach(categoria => {
    totalGeral += categoria.total;
    totalMedia += categoria.media;
    
    // Cor do share baseada no tipo
    const corShare = calcularCorShare(categoria.share, titulo);
    
    html += `
      <tr>
        <td class="pl-4 sticky-col">${categoria.nome}</td>
        <td class="text-right pr-4">R$ ${categoria.media.toFixed(2)}</td>
        <td class="text-right pr-4 ${textClass}">R$ ${categoria.total.toFixed(2)}</td>
        <td class="text-right pr-4" style="background-color: ${corShare}">
          ${categoria.share.toFixed(2)}%
        </td>
      </tr>
    `;
  });

  // Linha de total
  html += `
    <tr class="font-weight-bold">
      <td class="border-top pl-4 sticky-col">Total</td>
      <td class="text-right border-top pr-4">R$ ${totalMedia.toFixed(2)}</td>
      <td class="text-right border-top pr-4 ${textClass}">R$ ${totalGeral.toFixed(2)}</td>
      <td class="text-right border-top pr-4">100%</td>
    </tr>
  `;

  tabela.innerHTML = html;
}

// Adicione o listener para o evento de mudança no seletor
document.getElementById('filtro-ano').addEventListener('change', atualizarDados);

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarDados();
});


