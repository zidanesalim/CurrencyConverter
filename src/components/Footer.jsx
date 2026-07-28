function Footer({ name, socialLinks }) {
    const year = new Date().getFullYear()

    return (
        <footer className="w-full">
            <div className="h-[0.5px] bg-white/20" />
            <div className="px-6">
                <div className="flex h-20 items-center justify-between">
                    <p className="text-sm text-white/60">
                        © {year} <b className="text-white">{name}</b>, All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {Object.entries(socialLinks).map(([slug, link]) => {
                            const Icon = link.icon
                            return (
                                <a
                                    key={slug}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={link.label}
                                    className="text-white/60 hover:text-white transition-colors"
                                >
                                    <Icon size={18} />
                                </a>
                            )
                        })}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
