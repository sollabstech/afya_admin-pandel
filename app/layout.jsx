import './globals.css';

export const metadata = {
  title: 'ÁFYA Admin Panel',
  description: 'Admin panel for ÁFYA Home Needs',
  icons: {
    icon: '/fac.png',
    shortcut: '/fac.png',
    apple: '/fac.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
