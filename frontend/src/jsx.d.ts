declare namespace JSX {
  interface IntrinsicElements {
    [key: string]: any
  }
}

declare module "react" {
  const React: any
  export default React
}
