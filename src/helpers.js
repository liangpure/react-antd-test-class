import {
  isIdentifier,
  isMemberExpression,
  isStringLiteral,
  isJSXElement,
  isJSXAttribute,
  isJSXSpreadAttribute,
  isCallExpression
} from '@babel/types';

export function genMapByArr(arr) {
  const res = {};
  arr.forEach((keyItem) => {
    if (typeof keyItem === 'string') {
      res[keyItem] = keyItem;
    }
  });
  return res;
}

// get needed string name from node
export function getNeededNameFromNode(node) {
  if (isMemberExpression(node)) {
    if (isIdentifier(node.property)) {
      return node.property.name
    }
  }
  if (isIdentifier(node)) {
    return node.name
  }
  if (isStringLiteral(node)) {
    return node.value
  }
  return ''
}


export function getReactIntlMessageName(node) {
  let res = ''
  if (isJSXElement(node)) {
    // when use preset-react@7.0, the <FormattedMessage /> has been transformed to function,
    // It's not right.
    // https://astexplorer.net/#/gist/d8ef99d64d0596a81878d0ba0696a38b/d63d527e29f163fe1f8a154720e5742dcff22c2a
    // work right in the astexpolorer
    if (node.openingElement.name.name === 'FormattedMessage') {
      node.openingElement.attributes.find((attribute) => {
        if (isJSXAttribute(attribute) && attribute.name.name === 'id') {
          if (isStringLiteral(attribute.value)) {
            res = attribute.value.value
            return true;
          }
        }
        if (isJSXSpreadAttribute(attribute)) {
          if (isMemberExpression(attribute.argument)) {
            if (isIdentifier(attribute.argument.property)) {
              res = attribute.argument.property.name
              return true;
            }
          }
        }
        return false
      })
    }
  }
  if (isCallExpression(node)) {
    if (isIdentifier(node.callee)) {
      if (node.callee.name === 'formatMessage') {
        res = getNeededNameFromNode(node.arguments[0]) // eslint-disable-line
      }
    }
    // hack Plugin-transform-react-jsx bug
    // see https://github.com/babel/babel/issues/8819
    if (
      isMemberExpression(node.callee)
      && Array.isArray(node.arguments)
    ) {
      const [arg1, arg2] = node.arguments;
      if (isIdentifier(arg1) && arg1.name === 'FormattedMessage') {
        res = getNeededNameFromNode(arg2)
      }
    }
  }
  return res;
}
