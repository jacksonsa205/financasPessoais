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
        "ACADEMIA", "AÇOUGUE", "AGUA", "ASSINATURAS", "COMIDA/IFOOD",
        "COMPRAS DESNECESSARIAS", "CORTE DE CABELO", "DIVIDAS ATRASADAS",
        "EDUCAÇÃO", "EMPRESTIMOS", "FINANCIAMENTO", "GAS", "GASOLINA",
        "INTERNET", "LAZER", "LUZ", "MERCADO", "PADARIA",
        "RAÇÃO DOS CACHORROS", "VESTUARIO"
    ],
    "Receita": [
        "13º SALARIO", "ADICIONAIS EMPRESAS", "PROVENTOS",
        "RENDA EXTRA", "RESERVA EMERGENCIA", "SALARIO",
        "VALE ALIMENTAÇÃO", "VALE REFEIÇÃO"
    ],
    "Investimento": [
        "AÇOES", "BITCOIN", "COMPRAR CAMERA", "COMPRAR CARRO",
        "FAZER VIAGEM", "FUNDOS IMOBILIARIOS", "USDT"
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

async function carregarTransacoes() {
    const response = await fetch("/transacao/buscar");
    const transacoes = await response.json();

    const tabela = document.getElementById("tabela-transacoes");
    tabela.innerHTML = "";

    transacoes.forEach((transacao) => {
        const linha = document.createElement("tr");
        
        // Determinar a classe com base no tipo
        let classeTipo = '';
        switch(transacao.tipo.toLowerCase()) {
            case 'despesa':
                classeTipo = 'tipo-despesa';
                break;
            case 'receita':
                classeTipo = 'tipo-receita';
                break;
            case 'investimento':
                classeTipo = 'tipo-investimento';
                break;
        }

        let classeStatus = '';
        switch(transacao.status.toUpperCase()) { // Alterado para toUpperCase()
            case 'PENDENTE':
                classeStatus = 'status-pendente';
                break;
            case 'PAGO':
                classeStatus = 'status-pago';
                break;
            default:
                classeStatus = ''; // Para valores inesperados
        }

        linha.innerHTML = `
            <td>${transacao.id}</td>
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
