"use client"

import Button from "../../../components/ui/button"
import { findAirbnbStayByUrlFromFormData } from "@/features/airbnbstay/actions/find-airbnbstay-by-url.action"
import TripSelector from "@/features/trip/components/trip-selector"
import { useTrip } from "@/components/trip-provider"

export function AirbnbStayForm() {
    const { selectedTrip } = useTrip()

    return (
        <section className="flex flex-col w-full h-[700px] items-center justify-center">
            <div className="flex flex-col border border-[var(--color-border-primary)] w-[94%] p-10 rounded-[50px] bg-[var(--color-card-bg)] backdrop-blur-md gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gradient">Insert airbnb link with filters</h1>
                    <TripSelector />
                </div>
                <form action={findAirbnbStayByUrlFromFormData} className="flex flex-col gap-10 w-full">
                    <input type="hidden" name="tripId" value={selectedTrip?.id ?? ""} />
                    <div className="flex flex-col gap-5">
                        <textarea
                            name="userPrompt"
                            placeholder="Write what do you want, the magic is here! <3"
                            className="border border-[var(--color-border-primary)] rounded-[50px] h-40 pt-7 px-5 focus:outline-none focus:ring-0 py-3 w-full leading-normal bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
                        />
                    </div>
                    <input type="hidden" name="aiModel" value="deepseek-r1:1.5b" />
                    <div className="flex gap-5 flex-row">
                        <input
                            type="text"
                            name="url"
                            placeholder="Past airbnb link with filters"
                            className="border border-[var(--color-border-primary)] rounded-[50px] focus:outline-none focus:ring-0 px-5 py-2 w-[82%] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
                        />
                        <div className="flex flex-row border border-[var(--color-border-primary)] rounded-[50px] w-[8%] justify-center items-center bg-[var(--color-bg)]">
                            <select
                                name="currency"
                                className="w-2/3 bg-transparent text-[var(--color-text)]"
                                defaultValue="USD"
                            >
                                <option value="" disabled>
                                    Currency
                                </option>
                                <option value="EUR">€</option>
                                <option value="USD">$</option>
                                <option value="BRL">R$</option>
                            </select>
                        </div>
                        <Button type="submit" variant="default" className="w-[10%]" disabled={!selectedTrip}>
                            {selectedTrip ? "Find" : "Select trip"}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default AirbnbStayForm