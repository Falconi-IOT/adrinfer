function adicionaZero(numero) {
  if (numero <= 9) return "0" + numero;
  else return "" + numero;
}

exports.formatDate = function (date) {
  if (date == null) {
    return null;
  }

  if (typeof date === "string") {
    if (date.length > 10) date = date.substring(0, 10);
    return date;
  } else {
    data = new Date(date);
    return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }
};

exports.formatDateYYYYMMDD = function (date) {
  if (date == null) {
    return null;
  }
  if (typeof date === "string") {
    if (date.trim().length == 0) {
      return "null";
    }
    if (date.length > 10) date = date.substring(0, 10);
    date = date.split("/");
    return "'" + [date[2], date[1], date[0]].join("-") + "'";
  } else {
    return date.yyyymmdd();
  }
};

exports.IfNUllNoAspas = function (date) {
  if (date == "null") return "null";

  return `'${date}'`;
};

Date.prototype.yyyymmdd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    this.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("-");
};

exports.formatDateHour = function (date) {
  return date;
};

exports.excluirCaracteres = function (value) {
  const searchRegExp = /'/g;
  const retorno = value.replace(searchRegExp, "''");
  return retorno;
};

exports.excluirVirgulasePontos = function (value) {
  let retorno = "";
  if (typeof value == "string") {
    if (value.length == 0) return "0";
    for (x = value.length - 1; x >= 0; x--) {
      if (value[x] == "," || value[x] == ".") {
        if (value[x] == ",") retorno = "." + retorno;
        if (value[x] == ".") retorno = "" + retorno;
      } else {
        retorno = value[x] + retorno;
      }
    }
  } else {
    retorno = "0";
  }
  return retorno;
};

exports.NullOrText = function (value) {
  if (value == null) {
    return null;
  } else {
    return `'${value}'`;
  }
};
