const express = require("express");
const router = express.Router();

process.env.TZ = "America/Araguaina";

router.get("", function(req, res) {
    const hoje = new Date().toLocaleString("pt-BR");

    console.log(hoje);

    res.status(200).json({ message: "Sistema No Ar!", horario: hoje });
});

module.exports = router;