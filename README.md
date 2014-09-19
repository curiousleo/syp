Scrypt Your Passwords
=====================

[SYP][gh-page] is a password manager that doesn't store your passwords – instead, it (re)generates them on demand.

Quickstart
----------

1. Open [SYP][gh-page].
2. Enter a master password.
3. Add a first login, e.g. `john.doe@example.com`.
4. Click on the newly added login to generate the password.
5. Bookmark the URL to be able to regenerate your passwords. See [What's in a URL?](#whats-in-a-url)

What's in a URL?
----------------

Notice that the URL will contain a few parameters, for example:

```
https://curiousleo.github.io/syp/#N=16384&r=8&p=1&salt=0063b3028795b083f30780f871d70b52
```

`N`, `r` and `p` are passed on to the [Scrypt][scrypt-wp] algorithm which is used for generating the passwords. They are set to the recommended values for interactive logins.

The `salt` parameter is passed to the password generator too. A random salt is generated when you visit the webapp. In order to [regenerate your passwords](#password-generation), you must use the same salt every time.

Password generation
-------------------

SYP's password generation algorithm takes an alphabet, the desired password length, the master password, a login identifier, the salt and parameters for Scrypt (`N`, `p`, `r`). It then treats the output of successive calls to the Scrypt function with increasing length (`L`) argument as an infinite stream from which the actual password is extracted.

In Haskell-like pseudocode, this works roughly as follows:

``` haskell
scrypted :: String -> Salt -> Int -> Int -> Int -> [Word8]
scrypted pwd salt n p r = scrypted' 2 where
  scrypted' len = scrypt pwd' salt' n p r len : drop len $ scrypted' (len * 2)
  pwd' = fromString pwd :: [Word8]
  salt' = fromSalt salt :: [Word8]

password :: [a] -> Int -> String -> String -> Salt -> Int -> Int -> Int -> [a]
password alphabet len master login salt n p r =
  take len $ map (alphabet !!) $ filter (< k) $ map (`div` d) stream
  where
    k = length alphabet
    d = 255 `div` k
    pwd = master ++ login
    stream = scrypted pwd salt n p r
```

[gh-page]: http://curiousleo.github.io/syp/
[scrypt-wp]: https://en.m.wikipedia.org/wiki/Scrypt
