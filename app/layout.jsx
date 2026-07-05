import './globals.css';

export const metadata = {
  title: 'ÁFYA Admin Panel',
  description: 'Admin panel for ÁFYA Home Needs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
