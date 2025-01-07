declare module 'next/font/google' {
  const inter: (options: {
    subsets: string[];
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    weight?: string[];
  }) => {
    className: string;
    style: { fontFamily: string };
  };

  export { inter };
} 