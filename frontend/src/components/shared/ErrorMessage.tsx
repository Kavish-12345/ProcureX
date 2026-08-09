interface ErrorMessageProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm text-destructive">
                {message ?? 'Something went wrong. Please try again.'}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-sm font-medium text-primary underline underline-offset-4"
                >
                    Retry
                </button>
            )}
        </div>
    );
}