import { useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import { useAuthStore } from '../store';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>元宇宙教育虚拟实训平台</title>
        <meta name="description" content="元宇宙教育虚拟实训平台 - 专业技能虚拟操作与实训数据记录" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {isAuthenticated ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}
