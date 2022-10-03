import * as React from "react";
import {Spinner, SpinnerSize} from "office-ui-fabric-react/lib/Spinner";

export const LoadingOverlay = ({ children, loading }: { children: React.ReactNode; loading: boolean }) => {
    if (!loading) return <>{children}</>;

    return (
        <div className="loading-overlay-parent">
            <div className="loading-overlay-children-disabled">{children}</div>
            <div className="loading-overlay-overlay">
                <Spinner size={SpinnerSize.medium} label="Checking spellings..." />
            </div>
        </div>
    );
};
