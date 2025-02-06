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

const categorias = {
    "Despesa": [
        "ACADEMIA", "AÇOUGUE", "AGUA", "ASSINATURAS", "COMIDA",
        "COMPRAS", "CABELO", "DIVIDAS",
        "EDUCAÇÃO", "EMPRESTIMOS", "MOTO","CARRO", "GAS", "GASOLINA",
        "INTERNET", "LAZER", "LUZ", "MERCADO", "PADARIA",
        "CACHORROS", "VESTUARIO"
    ],
    "Receita": [
        "13º SAL", "PPR", "PROVENTOS",
        "RENDA EX", "FERIAS", "SALARIO",
        "V.A", "V.R"
    ],
    "Investimento": [
        "BITCOIN","USDT"
    ]
};

// Função para atualizar as categorias
function atualizarCategorias() {
    const tipoSelect = document.getElementById('tipo');
    const categoriaSelect = document.getElementById('categoria');
    const tipoSelecionado = tipoSelect.value;

    // Limpar opções atuais
    categoriaSelect.innerHTML = '';

    // Adicionar novas opções
    categorias[tipoSelecionado].forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria.charAt(0) + categoria.slice(1).toLowerCase();
        categoriaSelect.appendChild(option);
    });
}

// Inicializar as categorias ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona o event listener para o select
    document.getElementById('tipo').addEventListener('change', atualizarCategorias);
    
    // Força a atualização inicial baseada no valor padrão do HTML
    atualizarCategorias();
});


document.addEventListener("DOMContentLoaded", () => {
    carregarTransacoes();

    document.getElementById("formTransacao").addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = document.getElementById("data").value;
        const categoria = document.getElementById("categoria").value;
        const tipo = document.getElementById("tipo").value;
        const obs = document.getElementById("obs").value;
        const valor = document.getElementById("valor").value;
        const status = document.getElementById("status").value;

        const transacao = { data, categoria, tipo, obs, valor, status };

        const response = await fetch("/transacao/cadastrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transacao)
        });

        if (response.ok) {
            carregarTransacoes();
            document.getElementById("formTransacao").reset();
            // Fechar o modal usando jQuery
            $('#modalTransacao').modal('hide');
        } else {
            alert("Erro ao cadastrar transação!");
        }
    });
});

let transacoes = [];
let paginaAtual = 1;
const itensPorPagina = 15;

async function carregarTransacoes() {
    const response = await fetch("/transacao/buscar");
    transacoes = await response.json();
    paginaAtual = 1; // Reinicia para a primeira página
    exibirPagina(paginaAtual);
    atualizarBotoesPaginacao();
}

function exibirPagina(pagina) {
    const tabela = document.getElementById("tabela-transacoes");
    tabela.innerHTML = "";

    const inicio = (pagina - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const transacoesPagina = transacoes.slice(inicio, fim);

    transacoesPagina.forEach((transacao) => {
        const linha = document.createElement("tr");

        let classeTipo = '';
        switch(transacao.tipo.toLowerCase()) {
            case 'despesa': classeTipo = 'tipo-despesa'; break;
            case 'receita': classeTipo = 'tipo-receita'; break;
            case 'investimento': classeTipo = 'tipo-investimento'; break;
        }

        let classeStatus = '';
        switch(transacao.status.toUpperCase()) {
            case 'PENDENTE': classeStatus = 'status-pendente'; break;
            case 'PAGO': classeStatus = 'status-pago'; break;
            default: classeStatus = '';
        }

        linha.innerHTML = `
            <td>${transacao.data}</td>
            <td>${transacao.categoria}</td>
            <td><span class="${classeTipo}">${transacao.tipo}</span></td>
            <td>${transacao.obs}</td>
            <td><strong>R$ ${parseFloat(transacao.valor).toFixed(2)}</strong></td>
            <td><span class="${classeStatus}">${transacao.status}</span></td>
        `;

        tabela.appendChild(linha);
    });
}

function atualizarBotoesPaginacao() {
    const totalPaginas = Math.ceil(transacoes.length / itensPorPagina);
    const paginacaoContainer = document.getElementById("paginacao");
    paginacaoContainer.innerHTML = "";

    // Cria a estrutura base do Bootstrap
    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center'; // Centraliza a paginação
    nav.appendChild(ul);

    // Botão Anterior
    const liAnterior = document.createElement('li');
    liAnterior.className = `page-item ${paginaAtual === 1 ? 'disabled' : ''}`;
    liAnterior.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    liAnterior.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        if(paginaAtual > 1) {
            paginaAtual--;
            exibirPagina(paginaAtual);
            atualizarBotoesPaginacao();
        }
    });
    ul.appendChild(liAnterior);

    // Números das páginas
    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === paginaAtual ? 'active' : ''}`;
        const link = document.createElement('a');
        link.className = 'page-link';
        link.href = '#';
        link.textContent = i;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            paginaAtual = i;
            exibirPagina(paginaAtual);
            atualizarBotoesPaginacao();
        });

        li.appendChild(link);
        ul.appendChild(li);
    }

    // Botão Próximo
    const liProximo = document.createElement('li');
    liProximo.className = `page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}`;
    liProximo.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    liProximo.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        if(paginaAtual < totalPaginas) {
            paginaAtual++;
            exibirPagina(paginaAtual);
            atualizarBotoesPaginacao();
        }
    });
    ul.appendChild(liProximo);

    paginacaoContainer.appendChild(nav);
}


// Carregar as transações ao iniciar a página
document.addEventListener("DOMContentLoaded", carregarTransacoes);