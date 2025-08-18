import { LitElement, css } from 'lit';
import { property } from 'lit/decorators.js';
import Helpers  from '../helpers/helpers';

export default class SallaBaseComponent extends LitElement {
    static styles = css`:host { display: block; }`;
    @property() key: string = '';
    @property() data: Record<string, any> = {};
    @property() imports: Record<string, any> = {};
    @property() protected shadowRootMode?: 'open' | 'closed' | false='open';

    createRenderRoot() {
        return this.shadowRootMode !== false
            ? this.attachShadow({ mode: this.shadowRootMode || 'closed' })
            : this;
    }

    static register(tagName: string) {
        const componentData = {
            component: this,
            dynamicTagName: `${tagName}-${Math.random().toString(36).substring(2, 8)}`
        };
        return Helpers.onBundlesReady().then(() => Salla.bundles.registerComponent(tagName, componentData));
    }
}
