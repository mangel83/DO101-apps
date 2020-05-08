const express = require('express');
const router = express.Router();
const { pgconn } = require('../db/config')
const VERSION_APP = process.env.VERSION || 'version no encontrada';
console.log(VERSION_APP)

/* Show home page. */
router.get('/', function(req, res) {
  console.log(req.hostname);
  console.log(req.ip);
  // we first check if the 'contacts' table exists
  pgconn.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts')", function(err,results) {
    if (err) {
      console.log(err);
      res.render('index', { error: 'Database connection failure! '+err.stack, contacts: null, title: 'Contact List', version: VERSION_AP, hostname: req.hostname });
    }

    // 'contacts' table does not exist. Show an empty table.
    else if(results.rows[0].exists == false) {
      res.render('index', { error: null, contacts: null, title: 'Lista de contactos', version: VERSION_AP, hostname: req.hostname});
    }

    // 'contacts' table exists. Show the records.
    else {
      pgconn.query('SELECT * FROM contacts', function(err,results) {
        if (err) {
          console.log(err);
          res.render('index', { error: 'Database connection failure! '+err.stack, contacts: null, title: 'Contact List', version: VERSION_AP, hostname: req.hostname  });
        }
        else {
          let contacts = results.rows;
          console.log(contacts);
          res.render('index', { error: null, contacts: contacts, title: 'Lista de contactos' , version: VERSION_AP, hostname: req.hostname});
        }
      })  
    }
  });
});

/* Seed test data */
router.post('/seed', function(req,res) {
  console.log(req.hostname);
  console.log(req.ip);
  // drop 'contacts' table if already exists, and seed some test data
  pgconn.query("drop table if exists contacts; create table contacts(id serial primary key,firstname varchar(30) not null,lastname varchar(30) not null, email varchar(30) not null); insert into contacts(firstname, lastname, email) values ('Bilbo','Baggins','bilbo@theshire.com'),('Frodo','Baggins','frodo@theshire.com'),('Samwise','Gamgee','sam@theshire.com'),('Peregrin','Took','pippin@theshire.com'),('Meriadoc','Brandybuck','merry@theshire.com')",function(err,results) {
    if (err) {
      console.log(err);
      res.render('index', { error: 'Seeding database failure! '+err.stack, contacts: null, title: 'Contact List', version: VERSION_AP, hostname: req.hostname });
    }

    // redirect to the index page
    else {
      res.redirect('/');
    }
  });
});

module.exports = router;
