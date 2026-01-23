"use client"
import AirbnbStayForm from "@/features/airbnbstay/components/airbnbstay-form";
import NullInterestAirbnbStayGridForm from "@/features/airbnbstay/components/null-interest-airbnbstay-grid-form";
import {useState, useEffect} from "react";
import {AirbnbStay} from "@/features/airbnbstay/domain/airbnbstay";
import {setAirbnbStayInterestAction} from "@/features/airbnbstay/actions/set-airbnbstay-interest.action";

export default function GetAirbnbStay({ initialStays }: { initialStays: AirbnbStay[] }) {

    const [stays, setStays] = useState<AirbnbStay[]>(initialStays)

    useEffect(() => {
        setStays(initialStays)
    }, [initialStays])

    async function onSetInterest(room_id: string, interest: boolean): Promise<void>{
        const snapshot = stays
        setStays((prev) =>
            prev.map((s) => (s.room_id === room_id ? { ...s, interest: interest } : s))
        )

        try {
            await setAirbnbStayInterestAction(room_id, interest)
        } catch {
            setStays(snapshot)
        }
    }

    return (
        <div>
            <AirbnbStayForm/>
            <NullInterestAirbnbStayGridForm stays={stays} onSetInterest={onSetInterest} />
        </div>
    )
}