interface ErrorMessageProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 border border-black/10 p-8 text-center">
            <p className="font-mono text-[11px] uppercase tracking-wide text-red-600">
                {message ?? 'Something went wrong.'}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="font-mono text-[11px] uppercase tracking-wide text-black underline underline-offset-4 hover:no-underline"
                >
                    Retry
                </button>
            )}
        </div>
    );
}
