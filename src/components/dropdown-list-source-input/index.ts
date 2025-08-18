import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
interface OptionItem {
  label: string;
  value: string;
  key: string;
}

export default class DropdownListSourceInput extends LitElement {
  @property({ type: Object })
  config?: {
    product:OptionItem[];
    category:OptionItem[];
    brand:OptionItem[];
    blog_article:OptionItem[];
    blog_category:OptionItem[];
    page:OptionItem[];
    special_offer:OptionItem[];
    branch:OptionItem[];
    product_tag:OptionItem[];
    source_url:OptionItem[];
  };

  static styles = css`
    .grid {
      display: grid;
      grid-template-columns: 30% 65%;
      gap: 0.5rem 1rem;
      align-items: center;
    }
    .label { 
      font-weight: bold; 
      font-size: 0.9rem; 
      text-align: left;
    }
    .value { 
      background: #f5f5f5;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      direction: ltr;
    }
  `;

  render() {
    if (!this.config) {
      return html`<div style="color: red;">Configuration is required</div>`;
    }

    return html`
      <div class="grid">
        ${Object.entries(this.config).map(([fieldId, value]) => this.renderValue(fieldId, value))}
      </div>
    `;
  }

  renderValue(fieldId: string, value: string|OptionItem[]) {
    value = typeof value === 'object' ? value.map((item: OptionItem) => item.label).join(', ') : value;
    return html`
      <div class="label">${fieldId}</div>
      <code class="value">${value}</code>
    `;
  }
}
