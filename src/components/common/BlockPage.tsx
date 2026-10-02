import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface BlockPageProps {
    message?: string;
};

const BlockPage = (props: BlockPageProps) => {
    const { message } = props;

    return (
        <div className="flex items-center justify-center h-64">
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                        {message || "You do not have permission to access this page."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default BlockPage;