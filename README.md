https://medium.com/@tomastrajan/total-guide-to-custom-angular-schematics-5c50cf90cdb4


## Develop

npm run build:watch

Now you can run schematics from ./TestApp to see what happens. Changes done in index.ts in src/hello/index.ts (yeah, I know) will automatically build and be available.

Test your output with `--dry-run` to avoid actually creating files, or `--force` to overwrite existing files. E.g. `ng g atom MyShinyAtom --dry-run`
