let processados = [];

exports.addProcessados = function (value) {
  processados.push(value);

  return;
};

exports.clearProcessados = function () {
  return (processados = []);
};

exports.getProcessados = function (id_empresa) {
  return processados;
};
