import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';
import { vueOutputTarget } from '@stencil/vue-output-target';

export const config: Config = {
  namespace: 'main',
  globalStyle: 'src/global/global.css',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'www',
      serviceWorker: null,
    },
    {
      type: 'docs-vscode',
      file: 'dist/vscode-data.json',
    },
    reactOutputTarget({
      outDir: '../react/src/components',
    }),
    vueOutputTarget({
      componentCorePackage: '@deadlock-api/ui-core',
      proxiesFile: '../vue/src/components.ts',
      includeImportCustomElements: true,
      customElementsDir: 'dist/components',
    }),
  ],
};
