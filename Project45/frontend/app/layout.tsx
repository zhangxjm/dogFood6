import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: '非遗手工技艺数字传承系统',
  description: '基于直播与搜索技术的非遗文化传承平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
