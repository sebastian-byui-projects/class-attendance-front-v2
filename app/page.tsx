import Link from "next/link";
import {Suspense} from "react";

// Asegúrate de que HOST esté definido en tu .env
const HOST = process.env.HOST || 'localhost:8000';

type QrResponse = {
    qr_image: string;
    token: string;
    seconds_remaining: number;
}

// 1. Hacemos el fetch más defensivo
async function fetchData(): Promise<QrResponse | null> {
    try {
        const response = await fetch(`https://${HOST}/generate-qr`, {
            method: 'GET',
            cache: 'no-store', // 'no-store' asegura que siempre traiga datos frescos en Next.js App Router
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Error del servidor: ${response.status} ${response.statusText}`);
            return null;
        }

        // Leemos como texto primero para evitar el "Unexpected EOF" si viene vacío
        const text = await response.text();
        if (!text) return null;

        return JSON.parse(text) as QrResponse;
    } catch (error) {
        console.error("Fallo de conexión con el backend:", error);
        return null;
    }
}

// 2. Componente Asíncrono que hace el fetch (este va dentro del Suspense)
async function QrCodeFetcher() {
    const data = await fetchData();

    if (!data) {
        return (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-center">
                ❌ Error cargando el código QR. Verifica que el backend esté encendido.
            </div>
        );
    }

    return <QrCode data={data}/>;
}

// 3. Página principal (Síncrona o Asíncrona) que envuelve el fetcher en Suspense
export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Suspense fallback={<div className="text-gray-500 animate-pulse font-medium">Generando QR...</div>}>
                <QrCodeFetcher/>
            </Suspense>
        </div>
    );
}

// 4. Componente de UI puro
function QrCode({data}: { data: QrResponse }) {
    return (
        <div
            className="flex flex-col items-center justify-center space-y-4 p-6 border bg-white rounded-lg shadow-lg max-w-sm mx-auto mt-10">
            <h2 className="text-xl font-bold text-gray-800">
                Scan the QR to attend
            </h2>

            <div className="border-4 border-black p-2 rounded">
                {data?.qr_image ? (
                    <img
                        src={`data:image/png;base64,${data.qr_image}`}
                        alt="Attendance QR Code"
                        className="w-64 h-64"
                    />
                ) : (
                    <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
                        Sin imagen
                    </div>
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
                        Current Token:{' '}
                        <span className="font-mono font-bold text-black text-lg select-all">
                            {data.token}
                        </span>
                    </p>

                    <Link
                        href={`/verify?token=${data.token}`}
                        target="_blank"
                        className="text-sm bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Click to Simulate Scan
                    </Link>
                </div>
            </div>
        </div>
    );
}