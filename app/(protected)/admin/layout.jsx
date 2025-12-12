export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-rose-500/30">
            {children}
        </div>
    );
}