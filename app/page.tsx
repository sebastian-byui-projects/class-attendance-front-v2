
import Link from "next/link";
import {Suspense} from "react";

const HOST = process.env.HOST!;

type QrResponse = {
    qr_image: string,
    token: string,
    seconds_remaining: number,
}

async function fetchData() {
    'use server';
    return await fetch(`https://${HOST}/generate-qr`, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()) as QrResponse

}

export default async function Home() {

    const data = await fetchData();

    if (!data) return null;

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QrCode data={data}/>
        </Suspense>
    )
}


function QrCode({data}: { data: QrResponse }) {

    return (
        <div
            className="flex flex-col items-center justify-center space-y-4 p-6 border rounded-lg shadow-lg max-w-sm mx-auto mt-10">
            <h2 className="text-xl font-bold">
                Scan the QR to attend
            </h2>

            <div className="border-4 border-black p-2 rounded">
                {data?.qr_image && (
                    <img
                        src={`data:image/png;base64,${data.qr_image}`}
                        alt="Attendance QR Code"
                        className="w-64 h-64"
                    />
                )}
            </div>

            <div className="text-center">
                <p className="text-sm text-gray-500">
                    The QR will expire in
                </p>
                <p className="text-2xl font-mono font-bold text-blue-600">
                    {Math.floor(data.seconds_remaining)} s
                </p>
            </div>

            <div className="w-full mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-xs font-bold text-yellow-800 uppercase mb-2">
                    🚧 Debug / Testing Mode
                </p>

                <div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-600">
                        Current Token: <span
                        className="font-mono font-bold text-black text-lg select-all">{data.token}</span>
                    </p>

                    <Link
                        href="/verify"
                        as={`/verify?token=${data.token}`}
                        target="_blank"
                        className="text-sm bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Click to Simulate Scan (Open in new tab)
                    </Link>
                </div>
            </div>
        </div>
    )
}
