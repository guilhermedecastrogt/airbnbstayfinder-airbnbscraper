import {HiBookmark, HiColorSwatch, HiDatabase, HiDotsVertical, HiExternalLink} from "react-icons/hi";
import Image from "next/image"

export function DashboardNavbar() {
    return (
        <div className="flex flex-col gap-2 justify-center items-center bg-transparent backdrop-blur-[3px] border border-primary text-[#5d5d5e] gap-6 py-15 rounded-[50px]">
            <div className="rounded-[50px] pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(255,90,95,0.1),transparent)]" />
            <Image
                src="/images/airbnb-tile.svg"
                alt=""
                width={45}
                height={45}
                className="mb-10"
            />

            <HiBookmark size={40} className="transform transition-transform duration-300 hover:scale-135"/>
            <HiDatabase size={40} className="transform transition-transform duration-300 hover:scale-135"/>
            <HiExternalLink size={40} className="transform transition-transform duration-300 hover:scale-135"/>
            <HiColorSwatch size={40} className="transform transition-transform duration-300 hover:scale-135"/>

            <div className="mt-20">
                <HiDotsVertical size={40} className="transform transition-transform duration-300 hover:scale-135" />
            </div>
        </div>
    )
}

export default DashboardNavbar;