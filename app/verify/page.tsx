'use client';
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

// 1. Separamos todo el formulario y su lógica en este componente
function AttendanceForm() {
    const searchParams = useSearchParams();
    const initialToken = searchParams.get('token') || '';

    const [token, setToken] = useState(initialToken);
    const [studentId, setStudentId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        try {
            const response = await fetch(`https://${process.env.NEXT_PUBLIC_HOST}/verify-attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_id: studentId,
                    token: String(token)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error verifying attendance');
            }

            await response.json();
            setIsSuccess(true);

        } catch (err: any) {
            setError(err.message || 'Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Register Attendance
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student ID
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="Ex: A00123456"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attendance Code
                    </label>
                    <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="000000"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md text-center text-2xl tracking-[0.5em] font-mono focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors
          ${isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {isLoading ? 'Verifying...' : 'Submit Attendance'}
                </button>
            </form>

            {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-center animate-pulse">
                    ❌ {error}
                </div>
            )}

            {isSuccess && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-center">
                    ✅ Attendance recorded successfully!
                </div>
            )}
        </div>
    );
}

// 2. Exportamos la página principal envolviendo el formulario con <Suspense>
export default function Page() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <Suspense fallback={<div className="text-gray-500 font-medium animate-pulse">Cargando formulario...</div>}>
                <AttendanceForm />
            </Suspense>
        </div>
    );
}