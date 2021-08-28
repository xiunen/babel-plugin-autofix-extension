const fs = require('fs');
const path = require('path');

const tryFiles = (dir, file, { extensions = ['js'], pathMap = [] }, autofix) => {
  let relativePath;
  let relativeFile;
  for (let [regex, replacement] of pathMap) {
    if (regex.test(file)) {
      relativePath = replacement;
      relativeFile = file.replace(regex, '');
    }
  }

  for (let ext of extensions) {
    let retFile = `${file}.${autofix}.${ext}`;
    let filename = retFile;
    if (relativeFile) {
      filename = `${relativeFile}.${autofix}.${ext}`;
    }

    let fileDir = path.resolve(dir, filename);
    if (relativePath) {
      fileDir = path.resolve(relativePath, filename)
    }

    if (fs.existsSync(fileDir)) {
      return retFile;
    }

    retFile = `${file}${file.endsWith('/') ? '' : '/'}index.${autofix}.${ext}`;
    filename = retFile;
    fileDir = path.resolve(dir, filename);
    if (relativeFile) {
      filename = `${relativeFile}/index.${autofix}.${ext}`;
    }

    fileDir = path.resolve(dir, filename);
    if (relativePath) {
      fileDir = path.resolve(relativePath, filename)
    }

    if (fs.existsSync(fileDir)) {
      return retFile;
    }
  }
  return file;
}

const createLog = (state, ...args) => {
  if (!state.opts.debug) return;
  console.log(...args);
}

module.exports = ({ types }) => {
  const autofix = process.env.autofix;
  return {
    name: 'autofix-extension',
    visitor: {
      ImportDeclaration: function (filePath, state) {
        const log = createLog.bind(undefined, state);
        log('[autofix] src', filePath.node.source.value);
        if (!filePath.node.source.value.includes('/')) return;
        if (!autofix) return;
        const dir = path.dirname(state.file.opts.filename);
        const triedFile = tryFiles(dir, filePath.node.source.value, state.opts, autofix);
        if (triedFile === filePath.node.source.value) return;
        log('[autofix] target', triedFile);
        filePath.replaceWith(types.importDeclaration(
          filePath.node.specifiers,
          types.stringLiteral(triedFile)
        ));
      }
    }
  }
}