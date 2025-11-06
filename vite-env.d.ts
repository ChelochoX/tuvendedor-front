/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // podés agregar más variables aquí si usás otras, por ejemplo:
  // readonly VITE_OTRA_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
