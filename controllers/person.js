const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const _ = require('lodash');
const validator = require('validator');
const mailChecker = require('mailchecker');
const Person = require('../models/Person');

/**
 * GET /person/add
 * Página de adicionar Pessoa.
 */
exports.getAdd = (req, res) => {
  res.render('person/add', {
    title: 'Nova Pessoa'
  });
};
