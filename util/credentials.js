exports.getCredentialsBase64 = function(emp) {
    let credBase64 = "";
    const clientId = emp.cliente_id.trim();
    const secretClient = emp.cliente_secret.trim();
    const credentials = clientId + ":" + secretClient;
    let buff = Buffer.from(credentials);
    credBase64 = buff.toString('base64');
    return credBase64;
}