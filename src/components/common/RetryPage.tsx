import React from "react";
import { Button } from "../ui/button";

interface RetryPageProps {
    message?: string;
    btnName: string;
    onRetry: () => void;
};

const RetryPage = (props: RetryPageProps) => {
    const { message, btnName, onRetry } = props;

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <p className="text-destructive mb-4">{message}</p>
                <Button onClick={onRetry}>{btnName}</Button>
            </div>
        </div>
    );
};

export default RetryPage;