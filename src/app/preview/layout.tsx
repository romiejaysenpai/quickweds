import WeddingFontProvider from '@/components/WeddingFontProvider';

export default function PreviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <WeddingFontProvider>{children}</WeddingFontProvider>;
}
