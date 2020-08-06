const createError = require("http-errors")
const express = require("express")
const path = require("path")
const logger = require("morgan")
const bodyParser = require("body-parser")
const expressSession = require("express-session")
const hbsMiddleware = require("express-handlebars")
const fs = require("fs")
const flash = require("flash")


const app = express()

// view engine setup
app.set("views", path.join(__dirname, "../views"))
app.engine(
  "hbs",
  hbsMiddleware({
    defaultLayout: "default",
    extname: ".hbs"
  })
)
app.set("view engine", "hbs")

app.use(logger("dev"))
app.use(express.json())
app.use(
  expressSession({
    secret: "Launch Academy",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
)
app.use(flash())

// flush session
app.use((req, res, next) => {
  if (req.session && req.session.flash && req.session.flash.length > 0) {
    req.session.flash = []
  }
  next()
})

app.use(express.static(path.join(__dirname, "../public")))
app.use(bodyParser.urlencoded({ extended: true }))

const { Pool } = require("pg")

const pool = new Pool({
  connectionString: "postgres://postgres:password@127.0.0.1:5432/food"
})

app.get("/food", (req, res) => {
  pool
    .query("SELECT name, type, description FROM food")
    .then(result => {
      res.render("index", {food: result.rows})
    })
    .catch(error => {
      res.sendStatus(500)
    })
})
app.get("/food/id", (req, res) => {
  let foodId = req.params.id
  pool
    .query("SELECT name, type, description FROM food")
    .then(result => {
      res.render("index", {food: result.rows})
    })
    .catch(error => {
      res.sendStatus(500)
    })
})

app.get("/food/new", (req, res) => {
  res.render("new")
})

app.post("/food", (req, res) => {
  const food = req.body.food
  const {name, type, description} = food
  
  const errors = []
  if (!name || name.trim() === "") {
    errors.push("Food Name can't be blank!")
  }
  if (!type || type.trim() === "") {
    errors.push("Type can't be blank!")
  }

  if (errors.length === 0) {
    pool
      .query(
        "INSERT INTO food (name, type, description) VALUES ($1, $2, $3)",
        [food.name, food.type, food.description]
      )
      .then(result => {
        res.redirect("/food")
      })
      .catch(error => {
        res.sendStatus(500)
      })
  } else {
    res.render("new", {food:food, errors:errors})
  }
})

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is listening...")
})

module.exports = app
