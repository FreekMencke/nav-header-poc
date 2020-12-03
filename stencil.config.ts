import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'nav-header-stencil',
  buildEs5: false,
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      empty: true,
    },
  ],
};
