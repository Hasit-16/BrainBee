import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrainBee - Adaptive Learning Management System',
  description: 'An offline-capable Progressive Web App for K-12 adaptive learning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap"
        />
      </head>
      <body>
        <div id="root-canvas">
          {children}
        </div>
      </body>
    </html>
  );
}
