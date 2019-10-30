import path from 'path';
import chalk from 'chalk';

import { VERSIONED_RN_IOS_DIR } from '../../../Constants';

export type TransformConfig = {
  pipeline: TransformPipeline;
  targetPath: string;
  input: string;
  versionName: string;
};

export type TransformPattern = {
  paths?: string | string[];
  replace: RegExp | string;
  with: string;
};

export type TransformPipeline = {
  logHeader?: (filePath: string) => void;
  transforms: TransformPattern[];
};

type RegExpCapturesKeys = '$1' | '$2' | '$3' | '$4' | '$5' | '$6' | '$7' | '$8' | '$9';
type RegExpCaptures = { [key in RegExpCapturesKeys]?: string };

export async function runTransformPipelineAsync({ pipeline, targetPath, input, versionName }: TransformConfig) {
  let output = input;
  const matches: { value: string, line: number, replacedWith: string }[] = [];

  if (!Array.isArray(pipeline.transforms)) {
    throw new Error('Pipeline\'s transformations must be an array of transformation patterns.');
  }

  pipeline.transforms
    .filter(transform => pathMatchesTransformPaths(targetPath, transform.paths))
    .forEach(transform => {
      const newOutput = output.replace(transform.replace, transform.with);

      if (newOutput.length !== output.length || newOutput !== output) {
        const regExpCaptures = copyRegExpCaptures();

        matches.push({
          value: RegExp.lastMatch,
          line: (RegExp as unknown as { leftContext: string }).leftContext.split(/\n/g).length,
          replacedWith: transform.with.replace(/\$[1-9]/g, m => regExpCaptures[m]),
        });
        output = newOutput;
      }
    });

  if (matches.length > 0) {
    if (pipeline.logHeader) {
      pipeline.logHeader(path.relative(VERSIONED_RN_IOS_DIR, targetPath));
    }

    for (const match of matches) {
      console.log(
        `${chalk.gray(String(match.line))}:`,
        chalk.red('-'),
        chalk.red(match.value.trimRight()),
      );
      console.log(
        `${chalk.gray(String(match.line))}:`,
        chalk.green('+'),
        chalk.green(match.replacedWith.trimRight()),
      );
    }
    console.log();
  }

  return output;
}

function pathMatchesTransformPaths(filePath: string, transformPaths?: string | string[]): boolean {
  if (typeof transformPaths === 'string') {
    return filePath.includes(transformPaths);
  }
  if (Array.isArray(transformPaths)) {
    return transformPaths.some(transformPath => filePath.includes(transformPath));
  }
  return true;
}

// Copies `$1`-`$9` fields from RegExp as they would be overwritten by `replace` function where we use these captures.
function copyRegExpCaptures(): RegExpCaptures {
  return Array(9).fill(0).map((value, index) => `$${index + 1}`).reduce((acc, key) => {
    acc[key] = RegExp[key];
    return acc;
  }, {});
}
