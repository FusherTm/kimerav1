import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </>
  );
}
