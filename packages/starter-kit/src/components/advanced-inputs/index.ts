import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";

export default class AdvancedInputs extends LitElement {
  @property({ type: Object })
  config?: {
    color: string;
    lingual_text: string;
    image: string;
    icon: string;
    date: string;
    time: string;
    datetime: string;
  };

  static styles = css`
    .grid {
      display: grid;
      grid-template-columns: 20% 75%;
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

  renderValue(fieldId: string, value: string) {
    if(typeof value === 'object'){
        value = JSON.stringify(value);
    }
    return html`
      <div class="label">${fieldId}</div>
      <code class="value">${value}</code>
    `;
  }
}
