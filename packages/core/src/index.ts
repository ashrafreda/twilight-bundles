import SallaComponent from './components/salla-base-component';
import Helpers from './helpers/helpers';
import SallaCustomComponent from './components/salla-custom-component';

class TwilightBundles {
    private components: Map<string, { dynamicTagName: string, component?: typeof SallaComponent }> = new Map();
    private pendingComponents: { tagName: string, component: HTMLElement }[] = [];
    private initialized: boolean = false;

    constructor() {
        Salla.onReady()
            .then(() => {
                if (Salla.bundles) {
                    Salla.log('TwilightBundles is already initialized');
                    return;
                }
                this.init()
                Salla.bundles = this;
                Salla.event.emit('twilight-bundles::initiated');
                this.registerCustomComponents();
            });
    }


    private async init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        // Update SystemJS import map
        // if (Object.keys(this.importMap).length) {
        //     System.config({
        //         imports: this.importMap
        //     });
        // }
    }

    private registerCustomComponents() {
        //I need to inject static method for LitElement
        (HTMLElement as any).registerSallaComponent = function (tagName: string) {
            Salla.bundles.registerComponent(tagName, {
                component: this,
                dynamicTagName: `${tagName}-${Math.random().toString(36).substring(2, 8)}`
            });
        };
        window.customComponents?.forEach(path => {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = path;
            document.head.appendChild(script);
        });
    }

    /**
     * This is takes the `<salla-custom-component component-name="${tagName}">` element
     * and replaces it with the actual component
     */
    renderCustomComponentDom(tagName: string, component: HTMLElement) {
        salla.log('Rendering custom component', tagName);
        component.getAttribute('component-name');
        const existingComponent = this.components.get(tagName);

        if (!existingComponent) {
            return this.pendingComponents.push({ tagName, component });
        }

        return this.renderDynamicCustomComponentDom(existingComponent.dynamicTagName, component);
    }

    renderDynamicCustomComponentDom(dynamicTagName: string, component: HTMLElement) {
        const newComponent = document.createElement(dynamicTagName);
        Array.from(component.attributes)
            .forEach(attr => newComponent.setAttribute(attr.name, attr.value || ''));
        component.before(newComponent);
        component.remove();
    }

    registerComponent(tagName: string, component: { dynamicTagName: string, component?: typeof SallaComponent }) {
        if (this.components.has(tagName)) {
            return console.warn(`Component ${tagName} is already registered into the this.components map. Skipping.`);
        }

        if (!component.dynamicTagName) {
            return console.warn(`Component ${tagName} is missing dynamicTagName. Skipping.`);
        }

        if (!component.component) {
            return console.warn(`Component ${tagName} is missing component. Skipping.`);
        }

        if (window.customElements.get(component.dynamicTagName)) {
            return console.warn(`Component ${component.dynamicTagName} is already registered into the window custom elements. Skipping.`);
        }

        window.customElements.define(component.dynamicTagName, component.component);

        this.components.set(tagName, component);
        Salla.log('Component registered:', component.dynamicTagName);

        // Handle all pending components with the same tagName
        const pendingComponentsWithTag = this.pendingComponents.filter(pc => pc.tagName === tagName);
        if (!pendingComponentsWithTag.length) {
            return;
        }
        pendingComponentsWithTag.forEach(pc => {
            this.renderDynamicCustomComponentDom(component.dynamicTagName, pc.component);
        });

        // Remove the rendered components from pendingComponents array
        this.pendingComponents = this.pendingComponents.filter(pc => pc.tagName !== tagName);
        Salla.log('Pending Components rendered:', tagName, component.dynamicTagName);

        // if (component.imports) {
        //     this.importMap = {
        //         ...this.importMap,
        //         ...component.imports
        //     };
        // }
    }
}

Helpers.makeSureSallaIsReady()
    .then(() => new TwilightBundles())
    .then(() => window.customElements.get('salla-custom-component') || window.customElements.define('salla-custom-component', SallaCustomComponent));

export { SallaComponent };