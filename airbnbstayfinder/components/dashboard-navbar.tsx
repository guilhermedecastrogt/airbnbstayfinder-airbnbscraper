import {HiBookmark, HiColorSwatch, HiDatabase, HiDotsVertical, HiExternalLink} from "react-icons/hi";
import Image from "next/image"

export function DashboardNavbar() {
    return (
        <div className="flex flex-col gap-2 justify-center items-center bg-[linear-gradient(180deg,rgba(26,26,22,1)0%,rgba(16,16,18,1)70%,rgba(51,28,28,1)100%)] gap-6 text-[#686864] py-15 rounded-[50px]">

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