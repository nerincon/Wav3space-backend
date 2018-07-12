const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
var pgp = require('pg-promise')()
const db = pgp({database: 'wav3space', user: 'postgres'})
const session = require('express-session')
const passhelper = require('pbkdf2-helpers')

app.use(bodyParser.json())
app.use(cors())

app.use(express.static('build'))

app.use(session({
  secret: process.env.SECRET_KEY || 'dev',
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 6000000, domain: 'localhost', secure: false, sameSite: false, httpOnly: false}
}))

// var open_pages = ['/', '/login', '/signup', '/logout', '/api/allbandsmain', '/api/bandartists/:bandname']

// app.use(function (req, res, next) {
//   if (req.session.userid || open_pages.indexOf(req.path) > -1) {
//     next()
//   } else {
//     console.log('no band or venue logged-in')
//     res.redirect('/login')
//   }
// })

app.get('/api/bandartists/:bandname', (req, res, next) => {
  let bandname = req.params.bandname
  let bandnameconfg = bandname.toString()
  // if bandname have a dash ("-"), then need to turn it into string first to work. So the commented one below, will not work.
  // db.any('SELECT * FROM artists WHERE bandname = $1 ', [bandname])
  db.any('SELECT * FROM artists WHERE bandname = $1 ', [bandnameconfg])
    .then(result => res.json(result))
    .catch(next)
})

app.get('/api/allbandsmain', (req, res, next) => {
  db.any(`SELECT * FROM bandpics`)
    .then(result => res.json(result))
    .catch(next)
})

app.get('/bandinfo', (req, res, next) => {
  let id = req.query.id
  db.one('SELECT * FROM bands WHERE id = $1', [id])
    .then(result => res.json(result))
    .catch(next)
})

app.post('/bands/signup', (req, res, next) => {
  let bandname = req.body.bandname
  let bandemail = req.body.bandemail
  let password = req.body.password
  if (bandname && bandemail && password) {
    req.session.user = bandname
    var hash = passhelper.create_hash(password)
    var passwordStorage = passhelper.generate_storage(hash)
    db.one(`INSERT INTO bands VALUES (default, $1, $2, $3) returning *`, [bandname, bandemail, passwordStorage])
      .then(result => res.json(result))
      .catch(next)
  } else {
    res.send('Need to put all information')
  }
})

app.post('/login', function (req, res, next) {
  var email = req.body.email
  var password = req.body.password
  if (email && password) {
    db.one('SELECT * FROM bands WHERE bandemail = $1', [email])
      .then(function (result) {
        if (passhelper.matches(password, result.password)) {
          req.session.email = email
          req.session.userid = result.id
          res.json({id: result.id, email: email})
        } else {
          res.render('/login')
        }
      })
      .catch(next)
  } else {
    res.redirect('/login')
  }
})

app.get('/logout', function (req, res) {
  req.session.destroy()
  res.redirect('/login')
})

app.post('/add/bandartist', (req, res, next) => {
  let bandname = req.body.bandname
  let artistname = req.body.artistname
  let artistrole = req.body.artistrole
  let artistimg = req.body.artistimg
  let artistbio = req.body.artistbio
  if (artistname && artistrole && artistimg, artistbio) {
    db.one(`INSERT INTO artists VALUES (default, $1, $2, $3, $4, $5) returning *`, [bandname, artistname, artistrole, artistimg, artistbio])
      .then(result => res.json(result))
      .catch(next)
  } else {
    res.send('Need to put all information')
  }
})

app.get('*', function (req, res) {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

app.listen(5000, function () {
  console.log('Listening on port 5000')
})
