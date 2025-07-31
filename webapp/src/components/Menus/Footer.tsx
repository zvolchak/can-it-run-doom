import { 
    BtnUserAccount,
} from "@/src/components"
import Image from "next/image"


interface IFooterProps {
    className?: string
}


export function Footer({ className = "", }: IFooterProps) {
    return (
        <footer className={`footer relative bottom-0 py-6 mt-12 ${className}`}>
            <div className="w-full mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                {/* Left Section */}
                <div className="flex flex-col text-center md:text-left">
                    <BtnUserAccount />
                </div>

                {/* Middle Section */}
                <div className="mt-4 md:mt-0 text-center">
                    <p className="text-sm italic">&quot;Everything can run DOOM, but can it run you?&quot;</p>
                </div>

                {/* Right Section */}
                <div className="mt-4 md:mt-0 flex space-x-4">
                    <a 
                        href="https://github.com" 
                        target="_blank" 
                        className="flex flex-row gap-2" 
                        rel="noopener noreferrer"
                    >
                        <Image
                            src="/icons/github-mark-white.png"
                            alt="source code"
                            width={24}
                            height={24}
                            className="rounded-full sm:ml-4 cursor-pointer"
                        />
                        Github
                    </a>

                    <a 
                        href="https://discord.com" 
                        target="_blank"
                        className="flex flex-row gap-2" 
                        rel="noopener noreferrer"
                    >
                        <Image
                            src="/icons/discord-48.png"
                            alt="discord server"
                            width={24}
                            height={24}
                            className="rounded-full sm:ml-4 cursor-pointer"
                        />
                        Discord
                    </a>
                </div>
            </div>
        </footer>
    )
}
