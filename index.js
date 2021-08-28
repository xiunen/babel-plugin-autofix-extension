const fs = require('fs');
const path = require('path');

module.exports = ({ types }) => {
  const autofix = process.env.autofix;
  return {
    name: 'autofix-extension',
    visitor: {
      ImportDeclaration: function (filePath, state) {
        if (!autofix) return;
        const { extensions = ['js'] } = state.opts;
        const dir = path.dirname(state.file.opts.filename);
        const file = path.basename(state.file.opts.filename);
        const parts = file.split('.');
        const ext = parts[parts.length - 1];
        if (!extensions.includes(ext)) return;
        const prefix = parts.slice(0, parts.length - 1).join('.');
        if (parts.length > 2) {
          if (parts[parts.length - 2] === autofix) return;
        }
        const autofixFile = path.join(dir, [prefix, autofix, ext].join('.'));
        const autofixIndexFile = path.join(dir, [autofix, ext].join('.'));
        if (fs.existsSync(autofixFile)) {
          filePath.replaceWith(types.importDeclaration(
            filePath.node.specifiers,
            types.stringLiteral(autofixFile)
          ));
        } else if (fs.existsSync(autofixIndexFile)) {
          filePath.replaceWith(types.importDeclaration(
            filePath.node.specifiers,
            types.stringLiteral(autofixIndexFile)
          ));
        }
      }
    }
  }
}