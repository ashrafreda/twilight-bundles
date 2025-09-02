import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { Product } from "./types";

export default class ProductCard extends LitElement {
  @property({ type: Object }) config?: {product:Array<{value:number; label: string;}>};
  @property({ type: Object }) product?: Product;

  static styles = css`
    .product-card {
      width: 250px;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
      background: white;
      margin: 1rem;
    }
    .product-card:hover {
      transform: translateY(-5px);
    }
    .product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 4px;
    }
    .product-title {
      margin: 0.5rem 0;
      color: #333;
      font-size: 1.1rem;
    }
    .price-tag {
      font-size: 1.2rem;
      color:var(--primary);
      font-weight: bold;
    }
    .discount {
      background: #ff4444;
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
      margin-left: 0.5rem;
    }
    .add-to-cart {
      width: 100%;
      padding: 0.8rem;
      margin-top: 1rem;
      border: none;
      border-radius: 4px;
      background: var(--primary);
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
    }
    .add-to-cart:hover {
      background: var(--primary-100);
    }
    
    /* Skeleton loading styles */
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.8; }
      100% { opacity: 0.6; }
    }
    
    .skeleton-image {
      width: 100%;
      height: 200px;
      background-color: #e0e0e0;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      animation: pulse 1.5s infinite ease-in-out;
    }
    
    .skeleton-title {
      width: 80%;
      height: 20px;
      background-color: #e0e0e0;
      border-radius: 4px;
      margin: 0.5rem 0;
      animation: pulse 1.5s infinite ease-in-out;
    }
    
    .skeleton-price {
      width: 40%;
      height: 24px;
      background-color: #e0e0e0;
      border-radius: 4px;
      margin: 0.5rem 0;
      animation: pulse 1.5s infinite ease-in-out;
    }
    
    .skeleton-button {
      width: 100%;
      height: 40px;
      background-color: #e0e0e0;
      border-radius: 4px;
      margin-top: 1rem;
      animation: pulse 1.5s infinite ease-in-out;
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    const productID = this.config?.product?.[0]?.value;
    if(!productID){
      console.error('Product card config is not valid, you must provide `config="{...}"!');
      return;
    }
    await (window as any).Salla.onReady();
    this.product = await (window as any).Salla.product.api.getDetails(productID)
    .then((res:{data:Product}) => res.data);
  }

  private handleAddToCart() {
    (window as any).Salla.log("Adding to cart:", {product: this.product});

    // Show a simple notification
    (window as any).Salla.success(`Added ${this.product?.name} to cart!`);
  }

  renderPlaceholder() {
    return html`
      <div class="product-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-price"></div>
        <div class="skeleton-button"></div>
      </div>
    `;
  }

  render() {
    if(!this.product){
      return this.renderPlaceholder();
    }
    return html`
      <div class="product-card">
        <img
          class="product-image"
          src="${this.product.image?.url}"
          alt="${this.product.image?.alt}"
        />
        <h3 class="product-title">${this.product.name}</h3>
        <div>
          <span class="price-tag">${(window as any).Salla.money(this.product.price)}</span>
          ${this.product.discount
            ? html`<span class="discount">${(window as any).Salla.money(this.product.discount)}</span>`
            : ""}
        </div>
        <button class="add-to-cart" @click="${this.handleAddToCart}">
          ${ (window as any).Salla.lang.get('pages.cart.add_to_cart')}
        </button>
      </div>
    `;
  }
}
