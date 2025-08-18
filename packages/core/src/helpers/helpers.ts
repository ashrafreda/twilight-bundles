declare global {
    interface Window {
        Salla: any;
        salla: any;
        customComponents: string[];
        System: {
            import(moduleId: string): Promise<any>;
        };
    }
    const Salla: any;
    const salla: any;
}


export default class Helpers {
    static onBundlesReady() {
        return Helpers.makeSureSallaIsReady()
            .then(() => Salla.event.onlyWhen('twilight-bundles::initiated'));
    }

    static initializeSalla() {
        if (Salla.status === 'ready') {
            salla.log('Salla is ready');
            return;
        }
        // Get the current script element
        const currentScript = document.currentScript || document.querySelector('script[src*="twilight-bundles.js"]');

        // Access the data attributes
        const demo = currentScript?.hasAttribute('demo-mode');
        const storeId = currentScript?.getAttribute('store-id');
        const config = JSON.parse(currentScript?.getAttribute('config') || 'false');
        // const components = currentScript?.getAttribute('components')?.split(',') || [];

        if (demo || config || storeId) {
            return Salla.init(config || {
                "debug": true,
                "store": { "id": storeId || 1510890315 }
            });
        }
        return Salla.onReady();
    }

    static makeSureSallaIsReady() {
        if (window.Salla) {
            return Promise.resolve(Helpers.initializeSalla());
        }

        return new Promise<void>((resolve, reject) => {
            let intervalId: number;
            const timeoutId = setTimeout(() => {
                window.clearInterval(intervalId);
                reject(new Error('Timeout: Salla object not found after 10 seconds'));
            }, 10000);

            intervalId = window.setInterval(() => {
                if (window.Salla) {
                    window.clearInterval(intervalId);
                    clearTimeout(timeoutId);
                    resolve(Helpers.initializeSalla());
                }
            }, 50);
        });
    }
}
