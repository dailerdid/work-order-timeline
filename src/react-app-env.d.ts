// Webpack (CRA) turns an imported .svg into a file URL.
declare module '*.svg' {
  const src: string;
  export default src;
}
