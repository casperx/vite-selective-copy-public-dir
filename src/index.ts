import {access, copyFile, mkdir, readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {join, normalize} from 'node:path/posix';

import type {Plugin} from 'vite';

export default ({
  include,
  exclude,
}: {
  include?: string[];
  exclude?: string[];
} = {}): Plugin => {
  const normInclude = include && new Set(include.map(normalize));
  const normExclude = exclude && new Set(exclude.map(normalize));

  return {
    name: 'selective-copy-public-dir',
    apply: 'build',

    config(config) {
      return {
        ...config,

        build: {
          copyPublicDir: false,
        },
      };
    },

    async generateBundle() {
      const {
        environment: {
          config: {
            publicDir,
            build: {outDir},
          },
        },
      } = this;

      if (!publicDir) return;

      if (!(await exists(outDir))) await mkdir(outDir);

      const walk = async (relDir: string) => {
        const items = await readdir(resolve(publicDir, relDir), {
          withFileTypes: true,
        });

        for (const item of items) {
          const {name} = item;
          const relPath = join(relDir, name);

          if (
            (normInclude && !normInclude.has(relPath)) ||
            normExclude?.has(relPath)
          )
            continue;

          const outAbsPath = resolve(outDir, relPath);

          if (item.isDirectory()) {
            await mkdir(outAbsPath);
            await walk(relPath);

            continue;
          }

          await copyFile(resolve(publicDir, relPath), outAbsPath);
        }
      };

      await walk('.');
    },
  };
};

const exists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};
