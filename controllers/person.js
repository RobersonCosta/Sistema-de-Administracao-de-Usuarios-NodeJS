const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const _ = require('lodash');
const validator = require('validator');
const dateFormat = require('dateformat');
const mailChecker = require('mailchecker');
const Person = require('../models/Person');

exports.getAdd = (req, res) => {
  res.render('person/add', {
    title: 'Nova Pessoa'
  });
};

exports.postAdd = (req, res, next) => {

  const validationErrors = [];

  // Validação Nome
  var nome = req.body.nome.split(' ').join('');
  if (typeof req.body.nome == undefined) validationErrors.push({ msg: 'Nome inválido.' });
  if (!validator.isAlpha(nome)) validationErrors.push({ msg: 'Nome não pode conter números.' });
  if (validator.isEmpty(nome)) validationErrors.push({ msg: 'Nome não pode estar vazio.' });

  // Validação Telefone
  var telefone = req.body.telefone.split(/[^0-9]/).join('');
  if (typeof req.body.telefone == undefined) validationErrors.push({ msg: 'Telefone inválido.' });
  if (!validator.isNumeric(telefone)) validationErrors.push({ msg: 'Telefone não pode conter letras.' });
  if (validator.isEmpty(telefone)) validationErrors.push({ msg: 'Telefone não pode estar vazio.' });

  // Validação Data_nascimento
  if (validator.isEmpty(req.body.data_nascimento)) validationErrors.push({ msg: 'Data de nascimento não pode estar vazia.' });

  // Validação RG
  var rg = req.body.rg.split(/[^0-9]/).join('');
  if (typeof req.body.rg == undefined) validationErrors.push({ msg: 'RG inválido.' });
  if (rg.length!=9) validationErrors.push({ msg: 'RG inválido.' });
  if (!validator.isNumeric(rg)) validationErrors.push({ msg: 'RG não pode conter letras.' });
  if (validator.isEmpty(rg)) validationErrors.push({ msg: 'RG não pode estar vazio.' });

  // Validação CPF
  var cpf = req.body.cpf.split(/[^0-9]/).join('');
  if (typeof req.body.cpf == undefined) validationErrors.push({ msg: 'CPF inválido.' });
  if (cpf.length!=11) validationErrors.push({ msg: 'CPF inválido.' });
  if (!validator.isNumeric(cpf)) validationErrors.push({ msg: 'CPF não pode conter letras.' });
  if (validator.isEmpty(cpf)) validationErrors.push({ msg: 'CPF não pode estar vazio.' });

  // Validação CEP
  var cep = req.body.cep.split(/[^0-9]/).join('');
  if (typeof req.body.cep == undefined) validationErrors.push({ msg: 'CEP inválido.' });
  if (cep.length!=8) validationErrors.push({ msg: 'CEP inválido.' });
  if (!validator.isNumeric(cep)) validationErrors.push({ msg: 'CEP não pode conter letras.' });
  if (validator.isEmpty(cep)) validationErrors.push({ msg: 'CEP não pode estar vazio.' });

  // Validação Logradouro
  if (typeof req.body.logradouro == undefined) validationErrors.push({ msg: 'Logradouro inválido.' });
  if (validator.isEmpty(req.body.logradouro)) validationErrors.push({ msg: 'Logradouro não pode estar vazio.' });

  // Validação Número
  if (typeof req.body.numero == undefined) validationErrors.push({ msg: 'Número inválido.' });
  if (validator.isEmpty(req.body.numero)) validationErrors.push({ msg: 'Número não pode estar vazio.' });

  // Validação Cidade
  var cidade = req.body.cidade.split(' ').join('');
  if (typeof req.body.cidade == undefined) validationErrors.push({ msg: 'Cidade inválido.' });
  if (validator.isEmpty(cidade)) validationErrors.push({ msg: 'Cidade não pode estar vazio.' });

  // Validação Bairro
  if (typeof req.body.bairro == undefined) validationErrors.push({ msg: 'Bairro inválido.' });
  if (validator.isEmpty(req.body.bairro)) validationErrors.push({ msg: 'Bairro não pode estar vazio.' });

  // Validação Estado
  var estado = req.body.estado.split(' ').join('');
  if (typeof req.body.estado == undefined) validationErrors.push({ msg: 'Estado inválido.' });
  if (validator.isEmpty(estado)) validationErrors.push({ msg: 'Estado não pode estar vazio.' });

  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    return res.redirect('/person/add');
  }

  const person = new Person({
    nome: req.body.nome,
    telefone: telefone,
    data_nascimento: req.body.data_nascimento,
    rg: rg,
    cpf: cpf,
    endereco: {
      cep: cep,
      logradouro: req.body.logradouro,
      numero: req.body.numero,
      complemento: req.body.complemento || '',
      bairro: req.body.bairro,
      cidade: req.body.cidade,
      estado: req.body.estado
    }
  });

  Person.findOne({ rg: rg }, (err, existingPerson) => {
    if (err) { return next(err); }
    if (existingPerson) {
      req.flash('errors', { msg: 'RG já cadastrada.' });
      return res.redirect('/person/add');
    }
    Person.findOne({ cpf: cpf }, (err, existingPerson) => {
      if (err) { return next(err); }
      if (existingPerson) {
        req.flash('errors', { msg: 'CPF já cadastrado.' });
        return res.redirect('/person/add');
      }
      person.save((err) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'Pessoa adicionada com sucesso!' });
        return res.redirect('/');
      });
    });
  });

};

exports.getPersons = (req, res) => {
  Person.find().sort({data: "desc"}).then((foundPersons) => {
    var persons = [];
    for (var i = 0; i < foundPersons.length; i++) {

      var data_nascimento = dateFormat(foundPersons[i].data_nascimento, "UTC:dd/mm/yyyy");

      var cpf = ''+foundPersons[i].cpf;
      var cpf = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');

      var rg = ''+foundPersons[i].rg;
      var rg = rg.replace(/^(\d{2})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');

      var telefone = ''+foundPersons[i].telefone;
      if (telefone.length == 11) {
        var telefone = telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else {
        var telefone = telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1)$2-$3');
      }

      var cep = ''+foundPersons[i].endereco.cep;
      var cep = cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');



      var person = {
        _id: foundPersons[i]._id,
        nome: foundPersons[i].nome,
        telefone: telefone,
        data_nascimento: data_nascimento,
        rg: rg,
        cpf: cpf,
        endereco: {
          cep: cep,
          logradouro: foundPersons[i].endereco.logradouro,
          numero: foundPersons[i].endereco.numero,
          complemento: foundPersons[i].endereco.complemento,
          bairro: foundPersons[i].endereco.bairro,
          cidade: foundPersons[i].endereco.cidade,
          estado: foundPersons[i].endereco.estado
        }
      }
      persons.push(person);
    }
    res.render('person/list', {persons: persons, title: "Lista Pessoas"});
  }).catch((err) => {
    req.flash("errors", {msg: 'Houve um erro ao listar as pessoas'});
    res.redirect("/");
  });
};

exports.getEdit = (req, res) => {
  Person.findOne({_id: req.params.id}).then((person) => {
    var data_nascimento = dateFormat(person.data_nascimento, "UTC:yyyy-mm-dd");
    res.render('person/edit', {person: person, title: "Editar Pessoa", data_nascimento: data_nascimento});
  }).catch((err) => {
    req.flash("errors", {msg: 'Houve um erro interno.'});
    res.redirect("/");
  });
};

exports.postEdit = (req, res, next) => {
  const validationErrors = [];
  // Validação Nome
  var nome = req.body.nome.split(' ').join('');
  if (typeof req.body.nome == undefined) validationErrors.push({ msg: 'Nome inválido.' });
  if (!validator.isAlpha(nome)) validationErrors.push({ msg: 'Nome não pode conter números.' });
  if (validator.isEmpty(nome)) validationErrors.push({ msg: 'Nome não pode estar vazio.' });

  // Validação Telefone
  var telefone = req.body.telefone.split(/[^0-9]/).join('');
  if (typeof req.body.telefone == undefined) validationErrors.push({ msg: 'Telefone inválido.' });
  if (!validator.isNumeric(telefone)) validationErrors.push({ msg: 'Telefone não pode conter letras.' });
  if (validator.isEmpty(telefone)) validationErrors.push({ msg: 'Telefone não pode estar vazio.' });

  // Validação Data_nascimento
  if (validator.isEmpty(req.body.data_nascimento)) validationErrors.push({ msg: 'Data de nascimento não pode estar vazia.' });

  // Validação RG
  var rg = req.body.rg.split(/[^0-9]/).join('');
  if (typeof req.body.rg == undefined) validationErrors.push({ msg: 'RG inválido.' });
  if (rg.length!=9) validationErrors.push({ msg: 'RG inválido.' });
  if (!validator.isNumeric(rg)) validationErrors.push({ msg: 'RG não pode conter letras.' });
  if (validator.isEmpty(rg)) validationErrors.push({ msg: 'RG não pode estar vazio.' });

  // Validação CPF
  var cpf = req.body.cpf.split(/[^0-9]/).join('');
  if (typeof req.body.cpf == undefined) validationErrors.push({ msg: 'CPF inválido.' });
  if (cpf.length!=11) validationErrors.push({ msg: 'CPF inválido.' });
  if (!validator.isNumeric(cpf)) validationErrors.push({ msg: 'CPF não pode conter letras.' });
  if (validator.isEmpty(cpf)) validationErrors.push({ msg: 'CPF não pode estar vazio.' });

  // Validação CEP
  var cep = req.body.cep.split(/[^0-9]/).join('');
  if (typeof req.body.cep == undefined) validationErrors.push({ msg: 'CEP inválido.' });
  if (cep.length!=8) validationErrors.push({ msg: 'CEP inválido.' });
  if (!validator.isNumeric(cep)) validationErrors.push({ msg: 'CEP não pode conter letras.' });
  if (validator.isEmpty(cep)) validationErrors.push({ msg: 'CEP não pode estar vazio.' });

  // Validação Logradouro
  if (typeof req.body.logradouro == undefined) validationErrors.push({ msg: 'Logradouro inválido.' });
  if (validator.isEmpty(req.body.logradouro)) validationErrors.push({ msg: 'Logradouro não pode estar vazio.' });

  // Validação Número
  if (typeof req.body.numero == undefined) validationErrors.push({ msg: 'Número inválido.' });
  if (validator.isEmpty(req.body.numero)) validationErrors.push({ msg: 'Número não pode estar vazio.' });

  // Validação Cidade
  var cidade = req.body.cidade.split(' ').join('');
  if (typeof req.body.cidade == undefined) validationErrors.push({ msg: 'Cidade inválido.' });
  if (validator.isEmpty(cidade)) validationErrors.push({ msg: 'Cidade não pode estar vazio.' });

  // Validação Bairro
  if (typeof req.body.bairro == undefined) validationErrors.push({ msg: 'Bairro inválido.' });
  if (validator.isEmpty(req.body.bairro)) validationErrors.push({ msg: 'Bairro não pode estar vazio.' });

  // Validação Estado
  var estado = req.body.estado.split(' ').join('');
  if (typeof req.body.estado == undefined) validationErrors.push({ msg: 'Estado inválido.' });
  if (validator.isEmpty(estado)) validationErrors.push({ msg: 'Estado não pode estar vazio.' });

  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    return res.redirect('/person/edit/'+req.params.id);
  }



  Person.findOne({ _id: req.params.id }, (err, foundPerson) => {
    if (err) { return next(err); }
    if (!foundPerson) {
      req.flash('errors', { msg: 'Houve um erro ao editar a pessoa.' });
      res.redirect('/person/edit/'+req.params.id);
    }
    foundPerson.nome = req.body.nome;
    foundPerson.telefone = telefone;
    foundPerson.data_nascimento = req.body.data_nascimento;
    foundPerson.rg = rg;
    foundPerson.cpf = cpf;
    foundPerson.endereco.cep = cep;
    foundPerson.endereco.logradouro = req.body.logradouro;
    foundPerson.endereco.numero = req.body.numero;
    foundPerson.endereco.complemento = req.body.complemento || '';
    foundPerson.endereco.bairro = req.body.bairro;
    foundPerson.endereco.cidade = req.body.cidade;
    foundPerson.endereco.estado = req.body.estado;

    foundPerson.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Pessoa editada com sucesso!' });
      return res.redirect('/person/list');
    });
  });
};

exports.postDeletePerson = (req, res, next) => {
  Person.deleteOne({ _id: req.params.id }, (err) => {
    if (err) { return next(err); }
    req.flash('info', { msg: 'Pessoa deletada com sucesso.' });
    res.redirect('/');
  });
};
