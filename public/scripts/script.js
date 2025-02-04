$(document).ready(function() {
    // Quando o modal é aberto
    $('#modalCadastro').on('show.bs.modal', function (event) {
      const button = $(event.relatedTarget);
      const category = button.data('category');
      const modal = $(this);
      
      // Atualiza o título e o hidden input
      modal.find('.modal-title').text(`Adicionar ${category}`);
      modal.find('#tipoRegistro').val(category);
      
      // Atualiza as opções do select
      const options = {
        'GASTOS': ['Alimentação', 'Transporte', 'Lazer', 'Moradia', 'Outros'],
        'ENTRADAS': ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros'],
        'INVESTIMENTOS': ['BTC', 'USDT', 'Ações', 'Fundos Imobiliários', 'Tesouro Direto']
      };
      
      const select = modal.find('#categoria');
      select.empty();
      options[category].forEach(opt => {
        select.append(new Option(opt, opt));
      });
    });
  
    // Handle form submission
    $('#formCadastro').submit(function(e) {
      e.preventDefault();
      
      const formData = {
        tipo: $('#tipoRegistro').val(),
        categoria: $('#categoria').val(),
        valor: $('#valor').val(),
        data: $('#data').val()
      };
  
      // Aqui você faria a requisição AJAX para o Node.js
      console.log('Dados do formulário:', formData);
      
      // Exemplo de requisição AJAX:
      /*
      $.post('/cadastrar', formData)
        .done(() => {
          $('#modalCadastro').modal('hide');
          location.reload(); // Ou atualize apenas a seção necessária
        })
        .fail((err) => {
          console.error('Erro:', err);
        });
      */
    });
  });