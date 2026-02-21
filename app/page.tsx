'use client';

import Link from "next/link";
import {useState, useEffect} from "react";

type QrResponse = {
    qr_image: string;
    token: string;
    seconds_remaining: number;
}

export default function Home() {
    // 1. Estados nativos para manejar los datos y la UI
    const [data, setData] = useState<QrResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 2. useEffect para hacer el fetch cuando el componente se monta
    useEffect(() => {
        const fetchQrCode = async () => {
            try {
                // Usamos NEXT_PUBLIC_HOST para que sea accesible en el cliente
                const host = process.env.NEXT_PUBLIC_HOST || 'localhost:8000';

                const response = await fetch(`https://${host}/generate-qr`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error del servidor: ${response.status}`);
                }

                const text = await response.text();
                if (!text) {
                    throw new Error("El servidor devolvió una respuesta vacía.");
                }

                const jsonData = JSON.parse(text) as QrResponse;
                setData(jsonData);

            } catch (err: any) {
                console.error("Fallo de conexión:", err);
                setError(err.message || "Error al cargar el QR");
            } finally {
                setIsLoading(false);
            }
        };

        fetchQrCode();
    }, []); // El array vacío asegura que solo se ejecute al montar la página

    // 3. Manejo de estado de carga
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="text-gray-500 animate-pulse font-medium">Generando QR...</div>
            </div>
        );
    }

    // 4. Manejo de estado de error
    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-center max-w-sm">
                    ❌ {error || "Error cargando el código QR. Verifica el backend."}
                </div>
            </div>
        );
    }

    // 5. Estado de éxito (mostramos el QR)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <QrCode data={data}/>
        </div>
    );
}

// El componente QrCode se queda exactamente igual, no necesita cambios
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
                    <div className="w-64 h-64 bg-gray-200 flex items-center justify-center text-gray-500">
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