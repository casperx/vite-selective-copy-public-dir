## vite-selective-copy-public-dir

Selectively copy files from your public directory to output directory during build.

## Usage

```ts
import selectiveCopyPublicDir from '@casperx102/vite-selective-copy-public-dir';

export default {
  plugins: [
    selectiveCopyPublicDir({
      exclude: ['config.json'],
    }),
  ],
};
```
