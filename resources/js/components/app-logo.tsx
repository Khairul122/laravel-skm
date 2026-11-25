export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-white/10 ring-1 ring-white/15">
                <img src="/images/skm/logo.svg" alt="Logo SKM Synectra" className="size-7 object-contain" />
            </div>
            <div className="ml-1.5 grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold tracking-tight">SKM Synectra</span>
                <span className="truncate text-[11px] opacity-75">Permenpan-RB 14/2017</span>
            </div>
        </>
    );
}
