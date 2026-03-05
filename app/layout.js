import './globals.css'
import ThemeProvider from './components/ThemeProvider'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import ScrollToTop from './components/ScrollToTop'

export const metadata = {
  title: 'ViralScope',
  description: 'Your brain called. It wants dopamine. Viral videos + AI tools.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('vs-theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <TopBar />
          <main>{children}</main>
          <ScrollToTop />
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
