const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  telefone: {
    type: Number,
    required: true
  },
  data_nascimento: {
    type: Date,
    required: true
  },
  rg: {
    type: Number,
    required: true,
    unique: true
  },
  cpf: {
    type: Number,
    required: true,
    unique: true
  },
  endereco: {
    logradouro: {
      type: String,
      required: true
    },
    numero: {
      type: Number,
      required: true
    },
    complemento: {
      type: String,
    },
    bairro: {
      type: String,
      required: true
    },
    cidade: {
      type: String,
      required: true
    },
    estado: {
      type: String,
      required: true
    },
    cep: {
      type: Number,
      required: true
    }
  }

}, { timestamps: true });


const Person = mongoose.model('persons', personSchema);

module.exports = Person;
