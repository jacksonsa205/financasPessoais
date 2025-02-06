function loadNavbar() {
  fetch('/components/navbar.html')
      .then(response => response.text())
      .then(data => {
          document.getElementById('navbar-container').innerHTML = data;
      })
      .catch(error => console.error('Erro ao carregar a navbar:', error));
}

window.onload = loadNavbar;

let todasTransacoes = [];

function extrairAnosDisponiveis() {
  const anos = new Set();
  todasTransacoes.forEach(t => anos.add(t.ano));
  return Array.from(anos).sort((a, b) => b - a);
}

function popularFiltroAnos() {
  const select = document.getElementById('filtro-ano');
  const anos = extrairAnosDisponiveis();
  const anoCorrente = new Date().getFullYear(); // Ano atual

  select.innerHTML = '<option value="">Todos os anos</option>';
  
  anos.forEach(ano => {
    if (!isNaN(ano) && ano.toString().length === 4) {
      const option = document.createElement('option');
      option.value = ano;
      option.textContent = ano;
      
      // Seleciona o ano corrente por padrão
      if (ano === anoCorrente) {
        option.selected = true;
      }
      
      select.appendChild(option);
    }
  });

  // Força a atualização imediata após selecionar o ano corrente
  atualizarDados();
}

function filtrarPorAno(ano) {
  if (!ano) return todasTransacoes;
  return todasTransacoes.filter(transacao => transacao.ano.toString() === ano);
}

async function carregarDados() {
  try {
    const response = await fetch("/transacao/buscar");
    const rawData = await response.json();
    
    todasTransacoes = rawData.map(t => {
      // Extrai o ano diretamente do campo data2
      const data = new Date(t.data2);
      return {
        ...t,
        ano: data.getFullYear() // Extrai o ano da data2
      };
    }).filter(t => {
      const anoValido = !isNaN(t.ano) && t.ano >= 2000;
      if (!anoValido) console.warn('Ano inválido ou data2 incorreta:', t);
      return anoValido;
    });

    console.log('Dados processados com data2:', todasTransacoes);
    popularFiltroAnos();
    atualizarDados();
    
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
  }
}

// Função para debug: mostra os anos e datas2 no console
function debugDatas() {
  console.log('Debug datas2:',
    todasTransacoes.map(t => ({
      id: t.id,
      data2: t.data2,
      ano: t.ano
    }))
  );
}

// Modifique a função de atualização para incluir o debug
function atualizarDados() {
  debugDatas(); // Mostra dados no console para verificação
  
  const anoSelecionado = document.getElementById('filtro-ano').value;
  const transacoesFiltradas = filtrarPorAno(anoSelecionado);

  console.log(`Filtrando por ano: ${anoSelecionado}`, transacoesFiltradas);
  
  // Restante da função mantido igual...
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
  // Definição das cores base para cada tipo
  const coresBase = {
    'Despesas': { h: 0, s: 71, l: 90 },  // Tom claro de #dc3545 (Vermelho)
    'Receitas': { h: 188, s: 67, l: 85 }, // Tom claro de #17a2b8 (Azul esverdeado)
    'Investimentos': { h: 45, s: 100, l: 88 } // Tom claro de #ffc107 (Amarelo)
  };

  const cor = coresBase[tipo] || coresBase['Receitas']; // Se não reconhecer, usa Receitas como padrão

  // Ajuste da luminosidade: quanto maior o share, mais escuro (diminuindo a luminosidade)
  const lightness = Math.max(cor.l - (Math.min(share, 50) * 0.7), 40);

  return `hsl(${cor.h}, ${cor.s}%, ${lightness}%)`;
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
    
    // Ajuste para a cor do texto em investimentos
    const textColorClass = titulo === "Investimentos" ? "text-warning" : textClass; 

    html += `
      <tr>
        <td class="pl-4 sticky-col">${categoria.nome}</td>
        <td class="text-right pr-4">R$ ${categoria.media.toFixed(2)}</td>
        <td class="text-right pr-4 ${textColorClass}">R$ ${categoria.total.toFixed(2)}</td>
        <td class="text-right pr-4" style="background-color: ${corShare}">
          ${categoria.share.toFixed(2)}%
        </td>
      </tr>
    `;
  });

  // Linha de total
  const totalTextColorClass = titulo === "Investimentos" ? "text-warning" : textClass;

  html += `
    <tr class="font-weight-bold">
      <td class="border-top pl-4 sticky-col">Total</td>
      <td class="text-right border-top pr-4">R$ ${totalMedia.toFixed(2)}</td>
      <td class="text-right border-top pr-4 ${totalTextColorClass}">R$ ${totalGeral.toFixed(2)}</td>
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


