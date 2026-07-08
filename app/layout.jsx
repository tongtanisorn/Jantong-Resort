import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://jantongresort.com"),
  title: {
    default: "Jantong Resort | ที่พักธรรมชาติ จองห้องพักออนไลน์",
    template: "%s | Jantong Resort"
  },
  description:
    "Jantong Resort รีสอร์ทบรรยากาศธรรมชาติ ห้องพักสะอาด เงียบสงบ เหมาะกับครอบครัว คู่รัก และทริปพักผ่อน จองห้องพักออนไลน์ได้ทันที",
  keywords: ["Jantong Resort", "รีสอร์ท", "จองห้องพัก", "ที่พักธรรมชาติ", "ห้องพักครอบครัว"],
  openGraph: {
    title: "Jantong Resort",
    description: "รีสอร์ทบรรยากาศธรรมชาติ พร้อมระบบจองห้องพักออนไลน์",
    images: ["/assets/images/hero-resort.png"],
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
