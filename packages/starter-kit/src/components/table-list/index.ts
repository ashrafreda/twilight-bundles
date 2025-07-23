import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
interface TabelItem {
  title: string;
  description?: string;
}

export default class TableList extends LitElement {
  @property({ type: Object })
  config?: {items: TabelItem[]};

  static styles = css`
    .table-list {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .table-item {
      display: flex;
      padding: 1rem;
      background: white;
      border-bottom: 1px solid #eee;
      align-items: center;
      transition: background 0.2s;
    }
    .table-item:hover {
      background: #f8f9fa;
    }
    .item-content {
      flex: 1;
    }
    .item-title {
      font-weight: 500;
      color: #2c3e50;
      margin: 0;
    }
    .item-description {
      color: #666;
      font-size: 0.9rem;
      margin: 4px 0 0;
    }
  `;

  render() {
    return html`
      <div class="table-list">
        ${this.config?.items?.map((item) => html`
            <div class="table-item">
              <div class="item-content">
                <h3 class="item-title">${item.title}</h3>
                <p class="item-description">${item.description}</p> 
              </div>
            </div>
          `,
        )}
      </div>
    `;
  }
}
