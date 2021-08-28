# babel-plugin-autofix-extension
Auto Try Extensions

```
autofix=fix npm start
```

For `import foo.js`, it will try `import foo.fix.js`.

For `import foo/index.js`, it will try `import foo/index.fix.js`, then `import foo/fix.js`.

## Configuration
```
[
  "babel-plugin-autofix-extension",
  {
    "extensions":["js"],
  }
]
```
