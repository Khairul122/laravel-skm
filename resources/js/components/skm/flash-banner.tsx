import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Toaster } from '@/components/ui/sonner';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function FlashNotifier() {
    const { flash } = usePage<SharedData>().props;
    const lastShownRef = useRef<string>('');

    useEffect(() => {
        const key = `${flash?.success ?? ''}|${flash?.error ?? ''}`;
        if (!key || key === '|' || key === lastShownRef.current) {
            return;
        }
        lastShownRef.current = key;

        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    return (
        <>
            <Toaster position="top-right" richColors closeButton />
            {flash?.success && (
                <Alert className="mb-4 border-emerald-300 bg-emerald-50/90 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                    <AlertTitle>Berhasil</AlertTitle>
                    <AlertDescription>{flash.success}</AlertDescription>
                </Alert>
            )}
            {flash?.error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Terjadi Kesalahan</AlertTitle>
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            )}
        </>
    );
}
