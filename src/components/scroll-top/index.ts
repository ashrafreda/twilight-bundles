export default class ScrollTop extends HTMLElement {
  connectedCallback() {
    this.innerHTML = "↑";
    this.style.cssText = `
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        background: hsl(var(--primary-400));
        color: hsl(var(--primary-force));
        cursor:pointer;
        font-size: 24px;
        `;
    this.onclick = () => window.scrollTo(0, 0);
  }
}
