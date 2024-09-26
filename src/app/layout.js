import "./globals.css"; 

export const metadata = {
  title: "Breacout",
  description: "Breacout Genesis 4.0",
  icons: {
    icon: "/favicon.ico", 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased"> 
        {children}
      </body>
    </html>
  );
}
