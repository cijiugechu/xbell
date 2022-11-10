import * as fs from 'node:fs';
import * as path from 'node:path';
import color from '@xbell/color';
import { format } from '@xbell/format';
import { ensureDir, getSnapshotFilePath } from './utils';

export interface ToMatchJavaScriptSnapshot {
  /**
   * js file name
   */
  name: string;
}

function writeSnapshot(
  filename: string,
  content: string
) {
  fs.writeFileSync(filename, [
    '// XBell Snapshot v1',
    'export default `',
    content,
    '`;'
  ].join('\n') + '\n', 'utf-8');
}


// emmmm... use import will become asynchronous
export function getJSContent(filepath: string) {
  const fileContent = fs.readFileSync(filepath, 'utf-8');
  const jsContent = fileContent.match(/export default `\n([\s\S]*?)\n`;\n/)![1];
  return jsContent;
}

// TODO: write diff.js.snap
export function matchJavaScriptSnapshot({
  value,
  name,
  filepath,
  projectName
}: {
  value: any;
  name: string;
  filepath: string;
  projectName?: string;
}) {
  const { filepath: snapshotPath, newFilepath, diffFilepath } = getSnapshotFilePath({
    projectName,
    filepath,
    name,
    type: 'js',
  });

  const existSnapshot = fs.existsSync(snapshotPath);
  const jsContent = format(value);

  if (existSnapshot) {
    const existedJSContent = getJSContent(snapshotPath);
    if (existedJSContent !== jsContent) {
      ensureDir(path.dirname(newFilepath));
      writeSnapshot(newFilepath, jsContent);
      return {
        pass: false,
        message: ({ not }: { not: boolean }) => [
          `JavaScriptSnapshot "${name}" ${not ? 'matched' : 'mismatched'}`,
          '',
          color.green('Expected: ') + color.green.underline(snapshotPath),
          color.red('Received: ') + color.red.underline(newFilepath),
          color.yellow('    Diff: ') + color.yellow.underline(diffFilepath)
        ].join('\n'),
      }
    }
  } else {
    const dirPath = path.dirname(snapshotPath);
    ensureDir(dirPath);
    writeSnapshot(snapshotPath, jsContent);
  }

}
