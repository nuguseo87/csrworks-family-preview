/* site.js — 패밀리 사이트 공통 거동
 * 통합 사이트의 무대(장면 전환) 로직은 가져오지 않는다. 이 두 사이트는 문서형이다.
 */
(() => {
  'use strict';

  /* 모바일 메뉴 ------------------------------------------------------------ */
  const burger = document.querySelector('.site-header__burger');
  const menu = document.getElementById('mobile-menu');

  if (burger && menu) {
    const setOpen = (open) => {
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? burger.dataset.labelClose : burger.dataset.labelOpen);
      burger.querySelector('.site-header__burger-icon--open').hidden = open;
      burger.querySelector('.site-header__burger-icon--close').hidden = !open;
      // 메뉴가 열린 동안 뒤 지면이 스크롤되면 닫고 나서 위치를 잃는다
      document.documentElement.style.overflow = open ? 'hidden' : '';
    };

    burger.addEventListener('click', () => setOpen(menu.hidden));

    // Esc 로 닫고 포커스를 버거로 되돌린다
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) { setOpen(false); burger.focus(); }
    });

    // 데스크톱 폭으로 넓어지면 열린 메뉴가 남아 본문을 덮는다
    const mq = window.matchMedia('(min-width:1200px)');
    mq.addEventListener('change', (e) => { if (e.matches && !menu.hidden) setOpen(false); });
  }

  /* 기념·추모 상담 폼 ------------------------------------------------------ */
  // 프리필: 상품 상세·허브 분기에서 ?item= ?kind= ?for= 로 들어온다.
  // 미리보기(noindex) 빌드에서는 백엔드가 아직 없으니 보내기를 가로채 안내만 한다.
  const consult = document.querySelector('form[data-consult]');
  if (consult) {
    const q = new URLSearchParams(location.search);
    const pick = (name, val) => {
      if (!val) return;
      const el = consult.querySelector(`[name="${name}"][value="${val}"]`) || consult.querySelector(`[name="${name}"]`);
      if (!el) return;
      if (el.type === 'radio') el.checked = true;
      else el.value = val;
    };
    pick('item', q.get('item')); pick('kind', q.get('kind')); pick('for', q.get('for'));

    const isPreview = !!document.querySelector('meta[name="robots"][content*="noindex"]');
    consult.addEventListener('submit', (e) => {
      const live = consult.querySelector('[data-form-live]');
      if (!consult.checkValidity()) {
        e.preventDefault();
        if (live) live.textContent = '이름과 연락처, 동의 항목을 확인해 주세요.';
        consult.querySelector(':invalid')?.focus();
        return;
      }
      if (isPreview) {
        e.preventDefault();
        if (live) live.textContent = '미리보기 화면입니다. 접수 기능은 홈페이지가 열리는 날 함께 연결됩니다.';
      }
    });
  }

  /* 장바구니 (제주자랑 시안 전용) ------------------------------------------ */
  // localStorage 는 사설 창·차단 설정에서 접근 자체가 throw 한다. 읽기·쓰기 모두 감싼다.
  const KEY = 'jeju-cart-v1';

  const readCart = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  };
  const writeCart = (items) => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* 저장 못 해도 화면은 돈다 */ }
    paintCount(items);
  };

  const paintCount = (items = readCart()) => {
    const n = items.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = n ? String(n) : '';
      el.hidden = !n;
    });
  };

  window.jejuCart = { read: readCart, write: writeCart, paint: paintCount };
  paintCount();

  // 담기 버튼
  document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { sku, name, price, cat } = btn.dataset;
      const items = readCart();
      const hit = items.find((i) => i.sku === sku);
      if (hit) hit.qty += 1;
      else items.push({ sku, name, price: Number(price), cat, qty: 1 });
      writeCart(items);

      const live = document.getElementById('cart-live');
      if (live) live.textContent = `${name} 담았습니다. 장바구니 ${items.reduce((s, i) => s + i.qty, 0)}개.`;
      btn.textContent = '담았습니다';
      setTimeout(() => { btn.textContent = '장바구니 담기'; }, 1600);
    });
  });
})();
