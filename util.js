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

function urlParams (fragment) {
  var extract = function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
      var p=a[i].split('=', 2);
      if (p.length == 1)
        b[p[0]] = "";
      else
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
  }

  return extract(fragment.split('&'));
}

function fromHex(code) {
  if (code >= 48 && code <= 57) { return code - 48; }
  if (code >= 65 && code <= 70) { return code - 55; }
  else { return 0; } // bad idea??
}

function hexStringToUint8Array (str) {
  var len = Math.floor(str.length/2);
  var buf = new ArrayBuffer(len);
  var bufView = new Uint8Array(buf);
  var upper = str.toUpperCase();

  for (var i = 0; i < len; i++) {
    var code1 = upper.charCodeAt(i * 2);
    var code2 = upper.charCodeAt(i * 2 + 1);
    bufView[i] = 16 * fromHex(code1) + fromHex(code2);
  }
  return bufView;
}

function randomHex(n) {
  var res = '';
  for (var i = 0; i < n; i++) {
    rand = (Math.floor(Math.random() * 256)).toString(16);
    res = res.concat(Array(3 - rand.length).join('0'), rand.toString(16));
  }
  return res;
}

function isTouch() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
}
