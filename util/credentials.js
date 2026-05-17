exports.getCredentialsBase64_old = function (emp) {
  let credBase64 = "";
  const clientId = emp.cliente_id.trim();
  const secretClient = emp.cliente_secret.trim();
  const credentials = clientId + ":" + secretClient;
  let buff = Buffer.from(credentials);
  credBase64 = buff.toString("base64");
  return credBase64;
};

exports.getCredentialsBase64 = function (emp) {
  const clientId = emp.cliente_id.trim();
  const secretClient = emp.cliente_secret.trim();

  if (!clientId || !secretClient) {
    throw new Error("client_id ou client_secret estão ausentes ou inválidos");
  }

  const credentials = `${clientId}:${secretClient}`;
  console.log("Credenciais antes da codificação Base64:", credentials);
  return Buffer.from(credentials).toString("base64");
};
