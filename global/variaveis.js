let ACCESSTOKEN = "";

let REFRESH_TOKEN = ""

let CODE = ""

let IDDEPOSITO = "";

let IDCATEGORIA = "";

let KEYCHG = "";

exports.setAcessToken = function(value) {

    ACESSTOKEN = value;

    return;

}

exports.getAcessToken = function() {

    return ACESSTOKEN;

}

exports.setRefreshToken = function(value) {

    REFRESH_TOKEN = value;

    return;

}

exports.getRefreshToken = function(value) {

    return REFRESH_TOKEN;

}


exports.getCode = function() {

    return CODE;

}


exports.setCode = function(value) {

    console.log(`CODE TROCADO DE ${CODE}  PARA ${value}`)
    CODE = value;

    return;

}

exports.getIdDeposito = function() {

    return IDDEPOSITO;

}


exports.setIdDeposito = function(value) {

    IDDEPOSITO = value;

    return;

}

exports.getIdCategoria = function() {

    return IDCATEGORIA;

}


exports.setIdCategoria = function(value) {

    IDCATEGORIA = value;

    return;

}


exports.getKeyChg = function() {

    return KEYCHG.trim();

}


exports.setKeyChg = function(value) {

    KEYCHG = value;

    return;

}