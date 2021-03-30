import core from 'jscodeshift';
import { Collection } from 'jscodeshift/src/Collection';

/**
 * Renames a variable with the given name.
 *
 * @param from String
 * @param toName String
 */
const createRenameVariableTransaction = (from: string, toName: string) => {
  return (j: core.JSCodeshift, source: Collection<any>) => {
    source.find(j.Identifier, { name: from }).forEach(x => {
      x.replace(j.identifier(toName));
    });
  };
};

export const renameExperimentalTextColorProp = createRenameVariableTransaction(
  'EXPERIMENTAL_allowMoreTextColors',
  'allowMoreTextColors',
);
