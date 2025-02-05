const express = require('express');
const controller = require('../../controllers/transacao/transacao');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/transacao.html'));
});
router.post('/cadastrar', controller.post);
router.get('/buscar', controller.get);

module.exports = router;