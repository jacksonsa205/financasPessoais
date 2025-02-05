require("dotenv").config();

const cors = require('cors')
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { home, transacoes } = require('./routes/index.routes');
const app = express();
const PORT = process.env.PORT || 3000;


// No seu app.js, substitua o TIME_SESSION por:
const TIME_SESSION = process.env.SESSION_MAX_AGE || 1800000;

// E na configuração do CORS:
const corsOption = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOption));

const IN_PROD = process.env.NODE_ENV === 'production';

// session config
app.use(session({
  name: process.env.SESS_NAME,
  secret: process.env.SESS_SECRET,
  resave: false, // Alterado para false
  saveUninitialized: false, // Alterado para false
  rolling: true,
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 1800000, // Convert para número
    sameSite: true,
    secure: process.env.NODE_ENV === 'production' // Secure apenas em produção
  }
}));

app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use the router for handling routes
app.use('/', home);
app.use('/transacao', transacoes);


// Catch-all route for handling 404 errors
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  });
  
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
