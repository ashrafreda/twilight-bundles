export default class SallaCustomComponent extends HTMLElement {
    connectedCallback() {
        let componentName = this.getAttribute('component-name')?.replace(/^salla-/, '');
        if (!componentName) {
            Salla.error('Component name is required', this);
            return Promise.resolve();
        }
        this.innerHTML = `<!-- Loading ${componentName} -->`;
        this.removeAttribute('component-name');
        Salla.bundles.renderCustomComponentDom(`salla-${componentName}`, this);
    }
}
