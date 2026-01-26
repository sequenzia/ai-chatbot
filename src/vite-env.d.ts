/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK_CHAT: string;
  readonly VITE_MOCK_STREAM_DELAY_MS: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
