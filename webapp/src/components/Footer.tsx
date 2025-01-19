interface IFooterProps {
    className?: string
}


export function Footer({ className = "", }: IFooterProps) {
    return (
        <footer className={`footer py-6 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                {/* Left Section */}
                <div className="flex flex-col text-center md:text-left">
                </div>

                {/* Middle Section */}
                <div className="mt-4 md:mt-0 text-center">
                    <p className="text-sm italic">&quot;Everything can run DOOM, but can it run you?&quot;</p>
                </div>

                {/* Right Section */}
                <div className="mt-4 md:mt-0 flex space-x-4">
                    <a href="https://github.com" target="_blank" className="">
                        Github
                    </a>
                    <a href="https://discord.com" target="_blank" className="">
                        Discord
                    </a>
                </div>
            </div>
        </footer>
    )
}
