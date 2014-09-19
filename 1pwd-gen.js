var scrypt = scrypt_module_factory();

function symbolGenerator(password, salt, params, L, alphabet) {
    var i = 0;
    var divisor = Math.floor(255 / alphabet.length);
    var scrypted = scrypt.crypto_scrypt(
            password, salt, params.N, params.r, params.p, L);

    function next() {
        var j;
        do {
            if (i >= scrypted.length) {
                var newScrypted = scrypt.crypto_scrypt(
                        password, salt, params.N, params.r, params.p, L * 2);
                scrypted = newScrypted.subarray(L, L * 2);
                L = L * 2;
                i = 0;
            }
            j = Math.floor(scrypted[i] / divisor);
            i++;
        } while (j >= alphabet.length);
        return alphabet[j];
    }

    return next;
}

function generatePassword(password, salt, params, len, alphabet) {
    var L = Math.pow(2, Math.ceil(Math.log(len) / Math.LN2));
    var generated = new Array(len);
    var nextSymbol = symbolGenerator(password, salt, params, L, alphabet);

    for (var i = 0; i < len; i++) { generated[i] = nextSymbol(); }

    return generated.join('');
}
