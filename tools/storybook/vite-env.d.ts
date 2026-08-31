/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.css?inline' {
  const content: string;
  export default content;
}

declare module '*.css?raw' {
  const content: string;
  export default content;
}

declare module '*.css?url' {
  const url: string;
  export default url;
}

declare module '*.scss?url' {
  const url: string;
  export default url;
}

declare module '*.xml' {
  const content: string;
  export default content;
}
