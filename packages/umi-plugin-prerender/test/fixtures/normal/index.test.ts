import { existsSync, readFileSync } from 'fs';
import glob from 'glob';
import { join } from 'path';

describe('normal', () => {
  it('test', () => {
    const cwd = join(__dirname, 'dist');
    const actualFiles = glob.sync('**/*.html', { cwd });
    actualFiles.forEach(file => {
      const actualFile = readFileSync(join(cwd, file), 'utf-8');
      expect(actualFile).toMatchSnapshot();
    });
  })
})
