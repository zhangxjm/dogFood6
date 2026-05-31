import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '跨境保税仓智能库存管理系统',
  description: '基于RFID和Redis的跨境保税仓智能库存管理系统',
}

function GlobalErrorHandler() {
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('Unhandled promise rejection (caught):', event.reason)
      event.preventDefault()
    })
    
    window.addEventListener('error', (event) => {
      console.warn('Global error (caught):', event.error || event.message)
      if (event.message?.includes('localStorage')) {
        console.warn('localStorage access blocked - continuing without it')
        event.preventDefault()
      }
    })
  }
  return null
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var test = window.localStorage;
                  if (test) test.getItem('__init_test__');
                } catch(e) {
                  console.warn('localStorage is not available');
                  Object.defineProperty(window, 'localStorage', {
                    value: {
                      getItem: function() { return null; },
                      setItem: function() {},
                      removeItem: function() {},
                      clear: function() {},
                      key: function() { return null; },
                      length: 0
                    },
                    writable: true,
                    configurable: true
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <GlobalErrorHandler />
        {children}
      </body>
    </html>
  )
}
