/* eslint-env jquery, browser */
$(document).ready(() => {
  $("#telefone")
    .mask("(99) 9999-9999?9")
    .focusout(function (event) {
      var target, phone, element;
      target = (event.currentTarget) ? event.currentTarget : event.srcElement;
      phone = target.value.replace(/\D/g, '');
      element = $(target);
      element.unmask();
      if(phone.length > 10) {
          element.mask("(99) 99999-999?9");
      } else {
          element.mask("(99) 9999-9999?9");
      }
  });
  $("#rg").mask("99.999.999-9", {reverse: true});
  $("#cpf").mask("999.999.999-99", {reverse: true});
  $("#cep")
    .mask("99999-999", {reverse: true})
    .focusout(function (event){
      var cep = $(this).val().replace(/[^0-9]/, '');
  		$.ajax({
  			url: 'https://viacep.com.br/ws/'+cep+'/json/unicode/',
  			dataType: 'jsonp',
        crossDomain: true,
        contentType: "application/json",
  			success: function(res){
  				$("#logradouro").val(res.logradouro);
  				$("#complemento").val(res.complemento);
  				$("#bairro").val(res.bairro);
  				$("#cidade").val(res.localidade);
  				$("#estado").val(res.uf);
  				$("#numero").focus();
  			}
  		});
  });
  var estado = $("#estado_encontrado").val();
  $('#estado option').each(function() {
  if($(this).val() == estado) {
      $(this).attr('selected', true);
    }
  });
});
