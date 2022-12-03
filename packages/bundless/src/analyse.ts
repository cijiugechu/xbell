import type {
  Program,
  ImportDeclaration,
  Declaration,
  CallExpression,
  Expression
} from '@swc/core';
import type { ImportItem, DynamicImportItem, RequireItem } from './types';
import { Visitor } from './visitor';

class Dependency extends Visitor {
  static parse(program: Program) {
    const instance = new Dependency();
    instance.visitProgram(program);
    const { imports, dynamicImports, requires } = instance;
    return { imports, dynamicImports, requires };
  }

  imports: ImportItem[] = [];
  requires: RequireItem[] = [];
  dynamicImports: DynamicImportItem[] = [];

  visitImportDeclaration(n: ImportDeclaration): ImportDeclaration {
    const path = n.source.value;
    const onlyImportDefault = n.specifiers.length === 1 && n.specifiers[0].type === 'ImportDefaultSpecifier';
    this.imports.push({
      path,
      onlyImportDefault,
    });
    return n;
  }

  visitCallExpression(n: CallExpression): Expression {
    if (n.callee.type === 'Import') {
      if (n.arguments.length === 1 && n.arguments[0].expression.type === 'StringLiteral') {
        this.dynamicImports.push({
          path: n.arguments[0].expression.value,
        });
      }
    } else if (n.callee.type === 'Identifier' && n.callee.value === 'require' && n.arguments.length === 1) {
      if (n.arguments[0].expression.type === 'StringLiteral') {
        this.requires.push({
          path: n.arguments[0].expression.value
        });
      } else {
        throw 'Dynamic require is not supported'
      }
    }
    return n; 
  }

  
}

export function analyse(program: Program): {
  imports: ImportItem[];
  dynamicImports: DynamicImportItem[];
  requires: RequireItem[]
} {
  const { imports, dynamicImports, requires } =  Dependency.parse(program);
  return {
    imports,
    dynamicImports,
    requires,
  };
}
