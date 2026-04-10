import { SiGithub } from '@icons-pack/react-simple-icons'

function Footer() {
    return (
        <div className="flex flex-col items-center pt-10">
            <div className="w-3xl h-0.5 bg-white/20"></div>
            <div className="w-3xl flex flex-row justify-between items-center py-2 px-4">
                <span className="text-white/60 text-xs">© 2026 Salim Zidane. All rights reserved.</span>
                <div className="flex flex-row gap-6">
                    <a href="https://github.com/zidanesalim" className="text-white/60 hover:text-white transition-colors">
                        <SiGithub size={18} />
                    </a>
                </div>

            </div>
        </div>
    )
}

export default Footer