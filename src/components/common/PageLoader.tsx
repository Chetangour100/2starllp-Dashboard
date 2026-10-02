import React from "react";

interface pageLoaderProps {
    pagename?: string;
};

const PageLoader = (props: pageLoaderProps) => {
    const { pagename } = props;

    return (
        <div className="flex items-center justify-center min-h-[400px]"> {/* min-h-screen */}
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading {pagename} details......</p>
            </div>
        </div>
    );
};

export default PageLoader;