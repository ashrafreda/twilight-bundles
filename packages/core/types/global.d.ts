type Salla = {
    bundles: any;
    log: (...args: any[]) => void;
    event: {
        emit: (event: string, ...args: any[]) => void;
        on: (event: string, callback: (...args: any[]) => void) => void;
    };
    onReady: () => Promise<void>;
    success: (message: string) => void;
};
declare global {
    const Salla: Salla | any;
    
    interface Window {
        customComponents?: string[];
        Salla: Salla | any;
    }
}
