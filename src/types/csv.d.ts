
declare module '*.csv' {
  const content: {
    [key: string]: string;
  }[];
  export default content;
}
