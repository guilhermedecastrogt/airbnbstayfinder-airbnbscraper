import {NextRequest, NextResponse} from "next/server";
import { getAirbnbStayByUrl } from "@/features/airbnbstay/actions/airbnbstay.action";
import {AirbnbStay} from "@/features/airbnbstay/domain/airbnbstay";

export async function POST(req: NextRequest) {
    try{
        const body = await req.json();
        const { url, userPrompt, currency } = body;

        const response: AirbnbStay[] = await getAirbnbStayByUrl(url, currency, userPrompt);

        return NextResponse.json(response, { status:200 });
    }
    catch(err){
        console.log(err);
        return NextResponse.json({error: err}, { status: 400, statusText: 'Internal Server Error' });
    }
}