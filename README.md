Scrypt Your Passwords
=====================

[SYP][gh-page] is a webapp that generates passwords on the fly for different logins, based on a single master password. The key idea is that password generation is deterministic, which means that there is no need to save them anywhere.

Webapp quickstart
-----------------

1. Open [SYP][gh-page].
2. Enter a master password.
3. Add a first login, e.g. `john.doe@example.com`.
4. Click on the newly added login to generate the password.
5. Bookmark the generated webapp URL to be able to regenerate your passwords. See [What's with the URLs?](#whats-with-the-urls)

What's with the URLs?
---------------------

Notice that the URL will contain a few parameters, for example:

```
http://curiousleo.github.io/syp/#N=16384&r=8&p=1&salt=0063b3028795b083f30780f871d70b52
```

`N`, `r` and `p` are passed on to the [scrypt][scrypt-wp] which is used for generating the passwords. They are set to the recommended values for interactive logins.

The `salt` parameter is passed to the password generator too. A random salt is generated when you visit the webapp. In order to regenerate your passwords, you must use the same salt every time.

[gh-page]: http://curiousleo.github.io/syp/
[scrypt-wp]: https://en.m.wikipedia.org/wiki/Scrypt
