/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'true' turns on author mode in the dev server. Set it in .env.local, or run `pnpm author`. */
  readonly VITE_AUTHOR?: string
}
