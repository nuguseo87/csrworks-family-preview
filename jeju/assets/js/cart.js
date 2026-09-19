/* cart.js — 장바구니 지면 렌더 (제주자랑 시안 전용)
 * 담긴 항목은 site.js 의 window.jejuCart 가 localStorage 로 관리한다.
 */
(() => {
  'use strict';

  const root = document.getElementById('cart-root');
  if (!root || !window.jejuCart) return;

  const won = (n) => n.toLocaleString('ko-KR') + '원';

  function render() {
    const items = window.jejuCart.read();

    if (!items.length) {
      root.innerHTML = '<p class="cart-empty">장바구니가 비어 있습니다.</p>';
      return;
    }

    const lines = items.map((it, i) => `
      <div class="cart-line" data-i="${i}">
        <span class="cart-line__thumb"><span class="product-card__ph">사진<br>준비 중</span></span>
        <div>
          <p class="cart-line__name">${it.name}</p>
          <p class="cart-line__meta">${it.cat}, ${won(it.price)} (예시)</p>
          <div class="cart-line__foot">
            <span class="qty">
              <button type="button" data-act="dec" aria-label="${it.name} 수량 줄이기">−</button>
              <span class="qty__value">${it.qty}</span>
              <button type="button" data-act="inc" aria-label="${it.name} 수량 늘리기">+</button>
            </span>
            <button class="cart-remove" type="button" data-act="del">삭제</button>
          </div>
        </div>
        <strong>${won(it.price * it.qty)}</strong>
      </div>`).join('');

    const total = items.reduce((s, i) => s + i.price * i.qty, 0);

    root.innerHTML = lines + `
      <div class="cart-total"><span>합계</span><span>${won(total)}</span></div>
      <p style="font-size:var(--cs-text-xs);color:var(--cs-ink-soft);margin-top:8px">
        배송비는 포함되지 않았습니다. 전부 예시 가격입니다.</p>`;
  }

  // 이벤트 위임 — 렌더할 때마다 다시 붙이지 않는다
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const i = Number(btn.closest('.cart-line').dataset.i);
    const items = window.jejuCart.read();
    if (!items[i]) return;

    const act = btn.dataset.act;
    if (act === 'inc') items[i].qty += 1;
    else if (act === 'dec') items[i].qty = Math.max(1, items[i].qty - 1);
    else if (act === 'del') items.splice(i, 1);

    window.jejuCart.write(items);
    render();
  });

  render();
})();
