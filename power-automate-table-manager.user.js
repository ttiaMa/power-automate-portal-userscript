// ==UserScript==
// @name         PA Enhanced
// @namespace    local.powerautomate.tablemanager
// @version      1.4.8
// @description  Migliora l'esperienza d'uso del portale Microsoft Power Automate.
// @author       ttiaMa
// @homepageURL  https://github.com/ttiaMa/power-automate-portal-userscript
// @supportURL   https://github.com/ttiaMa/power-automate-portal-userscript/issues
// @downloadURL  https://raw.githubusercontent.com/ttiaMa/power-automate-portal-userscript/main/power-automate-table-manager.user.js
// @updateURL    https://raw.githubusercontent.com/ttiaMa/power-automate-portal-userscript/main/power-automate-table-manager.user.js
// @match        https://make.powerautomate.com/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==

(function () {
  'use strict';

  const SCRIPT_ID = 'pa-table-manager';
  const STORE_KEY = `${SCRIPT_ID}:v1`;
  const MIN_WIDTH = 56;
  const MAX_WIDTH = 1200;
  const gridStates = new WeakMap();
  let scanQueued = false;
  let nextGridToken = 1;
  let autoShowMoreRoute = '';
  let autoShowMoreTimer = null;
  let autoShowMoreClickCount = 0;
  const AUTO_SHOW_MORE_DELAY = 4000;

  const css = `
    [data-pa-tm-header] { position: relative !important; }
    [data-pa-tm-cell], [data-pa-tm-header] {
      box-sizing: border-box !important;
      overflow: hidden !important;
    }
    .pa-tm-drag {
      position: absolute; top: 50%; right: 9px; transform: translateY(-50%);
      width: 17px; height: 24px; padding: 0; border: 0; border-radius: 3px;
      background: transparent; color: #616161; cursor: grab; z-index: 4;
      font: 15px/24px "Segoe UI", sans-serif; opacity: 0;
    }
    [data-pa-tm-header]:hover .pa-tm-drag,
    .pa-tm-drag:focus-visible { opacity: 1; background: #f3f2f1; }
    .pa-tm-drag:active { cursor: grabbing; }
    .pa-tm-hide {
      position: absolute; top: 50%; right: 30px; transform: translateY(-50%);
      height: 22px; padding: 0 4px; border: 0; border-radius: 3px;
      background: #f3f2f1; color: #424242; cursor: pointer; z-index: 4;
      font: 10px/22px "Segoe UI", sans-serif; opacity: 0;
    }
    [data-pa-tm-header]:hover .pa-tm-hide,
    .pa-tm-hide:focus-visible { opacity: 1; }
    .pa-tm-resize {
      position: absolute; top: 0; right: -3px; width: 8px; height: 100%;
      cursor: col-resize; z-index: 5; touch-action: none;
    }
    .pa-tm-resize::after {
      content: ""; position: absolute; top: 15%; bottom: 15%; left: 3px;
      border-left: 1px solid transparent;
    }
    [data-pa-tm-header]:hover .pa-tm-resize::after,
    .pa-tm-resize:hover::after { border-color: #0078d4; }
    [data-pa-tm-header].pa-tm-drop-target { outline: 2px solid #0078d4; outline-offset: -2px; }
    .pa-tm-items-link {
      display: inline-flex; align-items: center; margin-left: 8px; padding: 1px 6px;
      border: 1px solid #8a8886; border-radius: 3px; color: #0067b8 !important;
      background: white; text-decoration: none !important; white-space: nowrap;
      font: 600 11px/20px "Segoe UI", sans-serif;
    }
    .pa-tm-items-link:hover { background: #f3f2f1; border-color: #0078d4; }
    body.pa-tm-resizing, body.pa-tm-resizing * { cursor: col-resize !important; user-select: none !important; }
    #pa-tm-button {
      position: fixed; right: 18px; bottom: 18px; z-index: 2147483646;
      border: 0; border-radius: 18px; padding: 8px 13px;
      color: white; background: #0078d4; box-shadow: 0 2px 8px #0004;
      font: 600 12px/20px "Segoe UI", sans-serif; cursor: grab;
      touch-action: none; user-select: none;
    }
    #pa-tm-button.pa-tm-dragging { cursor: grabbing; }
    #pa-tm-panel {
      position: fixed; right: 18px; bottom: 62px; z-index: 2147483647;
      width: 310px; padding: 14px; border: 1px solid #d1d1d1; border-radius: 8px;
      background: white; color: #242424; box-shadow: 0 5px 22px #0003;
      font: 13px/1.4 "Segoe UI", sans-serif;
    }
    #pa-tm-panel[hidden] { display: none; }
    #pa-tm-panel strong { display: block; margin-bottom: 5px; font-size: 14px; }
    #pa-tm-panel .pa-tm-view {
      margin: 0 0 10px; padding: 8px 10px; border-left: 3px solid #0078d4;
      background: #f5f9fd;
    }
    #pa-tm-panel .pa-tm-view span,
    #pa-tm-panel .pa-tm-view small { display: block; color: #616161; }
    #pa-tm-panel .pa-tm-view b { display: block; margin: 2px 0; font-size: 14px; }
    #pa-tm-panel .pa-tm-status { margin: 7px 0 10px; color: #616161; }
    #pa-tm-panel .pa-tm-hidden { margin: 8px 0 10px; }
    #pa-tm-panel .pa-tm-hidden:empty { display: none; }
    #pa-tm-panel .pa-tm-hidden-label { display: block; margin-bottom: 5px; color: #616161; }
    #pa-tm-panel .pa-tm-hidden-chip {
      display: inline-block;
      margin: 0 5px 5px 0;
      padding: 3px 8px;
      border: 1px solid #c8c6c4;
      border-radius: 3px;
      background: #f3f2f1;
      color: #323130;
    }
    #pa-tm-panel .pa-tm-option {
      margin: 9px 0 10px; padding: 8px 9px; border: 1px solid #e1dfdd; border-radius: 4px;
      background: #faf9f8;
    }
    #pa-tm-panel .pa-tm-option label { display: flex; align-items: flex-start; gap: 7px; cursor: pointer; }
    #pa-tm-panel .pa-tm-option input { margin-top: 2px; }
    #pa-tm-panel .pa-tm-option small { display: block; margin: 3px 0 0 23px; color: #616161; }
    #pa-tm-panel .pa-tm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
    #pa-tm-panel button {
      min-height: 30px; border: 1px solid #8a8886; border-radius: 4px;
      background: white; color: #242424; cursor: pointer;
    }
    #pa-tm-panel button:hover { background: #f3f2f1; }
    #pa-tm-panel button:disabled { color: #a19f9d; background: #f3f2f1; cursor: default; }
    #pa-tm-panel .pa-tm-wide { grid-column: 1 / -1; }
    #pa-tm-toast {
      position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
      z-index: 2147483647; display: flex; align-items: center; gap: 12px;
      padding: 9px 11px 9px 14px; border-radius: 4px;
      background: #323130; color: white; font: 13px "Segoe UI", sans-serif;
    }
    #pa-tm-toast button {
      min-height: 28px; padding: 2px 10px; border: 1px solid #fff8; border-radius: 3px;
      color: white; background: transparent; font: 600 12px "Segoe UI", sans-serif; cursor: pointer;
    }
    #pa-tm-toast button:hover { background: #ffffff20; }
  `;

  function readStore() {
    try {
      const raw = typeof GM_getValue === 'function'
        ? GM_getValue(STORE_KEY, '')
        : localStorage.getItem(STORE_KEY);
      const value = raw ? JSON.parse(raw) : {};
      return {
        layouts: value.layouts && typeof value.layouts === 'object' ? value.layouts : {},
        widths: value.widths && typeof value.widths === 'object' ? value.widths : {},
        hidden: value.hidden && typeof value.hidden === 'object' ? value.hidden : {},
        settings: value.settings && typeof value.settings === 'object'
          ? {
            autoShowMore: value.settings.autoShowMore === true,
            buttonPosition: value.settings.buttonPosition
              && Number.isFinite(value.settings.buttonPosition.x)
              && Number.isFinite(value.settings.buttonPosition.y)
              ? { x: value.settings.buttonPosition.x, y: value.settings.buttonPosition.y }
              : null,
          }
          : { autoShowMore: false, buttonPosition: null },
      };
    } catch (error) {
      console.warn('[PA Enhanced] Cache non leggibile:', error);
      return {
        layouts: {}, widths: {}, hidden: {},
        settings: { autoShowMore: false, buttonPosition: null },
      };
    }
  }

  function writeStore(store) {
    const raw = JSON.stringify(store);
    if (typeof GM_setValue === 'function') GM_setValue(STORE_KEY, raw);
    else localStorage.setItem(STORE_KEY, raw);
  }

  function cssAttribute(value) {
    return JSON.stringify(String(value));
  }

  function refreshPersistentStyles() {
    const style = document.getElementById('pa-tm-persistent-styles');
    if (!style) return;
    const store = readStore();
    const rules = [];
    activeStates().forEach((state) => {
      const savedOrder = store.layouts[state.schema];
      const order = mergeOrder(state.originalKeys, savedOrder);
      const orderIndex = Array.isArray(savedOrder) && savedOrder.length
        ? new Map(order.map((key, index) => [key, index]))
        : null;
      const hidden = new Set((store.hidden[state.schema] || []).filter((key) => !isSelectionKey(key)));
      const scope = `[data-pa-tm-grid=${cssAttribute(state.token)}]`;
      if (orderIndex) {
        rules.push(`${scope} [data-pa-tm-unmatched]{order:9999!important}`);
      }
      state.originalKeys.forEach((key) => {
        const declarations = [];
        const width = store.widths[key];
        if (width) {
          const px = `${Math.round(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width)))}px`;
          declarations.push(
            `width:${px}!important`,
            `min-width:${px}!important`,
            `max-width:${px}!important`,
            `flex:0 0 ${px}!important`,
          );
        }
        if (orderIndex?.has(key)) declarations.push(`order:${orderIndex.get(key)}!important`);
        if (hidden.has(key)) declarations.push('display:none!important');
        if (!declarations.length) return;
        const header = `[data-pa-tm-header=${cssAttribute(key)}]`;
        const cell = `[data-pa-tm-cell=${cssAttribute(key)}]`;
        rules.push(`${scope} ${header},${scope} ${cell}{${declarations.join(';')}}`);
      });
    });
    const cssText = rules.join('\n');
    if (style.textContent !== cssText) style.textContent = cssText;
  }

  function clearStore() {
    if (typeof GM_deleteValue === 'function') GM_deleteValue(STORE_KEY);
    else localStorage.removeItem(STORE_KEY);
  }

  function normalizeKey(rawKey, fallbackIndex) {
    if (!rawKey) return fallbackIndex === 0 ? '__selection__' : `column-${fallbackIndex}`;
    let key = rawKey
      .replace(/^header\d+-/i, '')
      .replace(/^workQueuesList/i, '')
      .replace(/^workQueueItemLists/i, '')
      .replace(/^workQueueItems?List/i, '')
      .replace(/^workQueue/i, '');
    return key || `column-${fallbackIndex}`;
  }

  function cleanColumnLabel(value) {
    return String(value || '')
      .normalize('NFKC')
      .replace(/[\p{Cc}\p{Cf}\p{Co}\p{Cs}]+/gu, ' ')
      .replace(/[⌃⌄▲▼△▽↑↓↕⋮⋯…]+$/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function headerKey(header, index) {
    const idNode = header.id ? header : header.querySelector('[id]');
    const raw = idNode?.id || header.getAttribute('data-automation-key') || '';
    if (raw) return normalizeKey(raw, index);
    const label = cleanColumnLabel(header.getAttribute('aria-label') || header.innerText || '');
    if (/select all/i.test(label)) return '__selection__';
    return normalizeKey(label.replace(/\W+/g, '-').toLowerCase(), index);
  }

  function directChildrenByRole(row, roles) {
    return Array.from(row.children).filter((node) => roles.includes(node.getAttribute('role')));
  }

  function findHeaderRow(grid) {
    return Array.from(grid.querySelectorAll('[role="row"]')).find(
      (row) => directChildrenByRole(row, ['columnheader']).length > 1,
    );
  }

  function schemaId(keys) {
    return keys.slice().sort().join('|');
  }

  function mergeOrder(originalKeys, savedOrder) {
    const selection = originalKeys.filter(isSelectionKey);
    const known = Array.isArray(savedOrder)
      ? savedOrder.filter((key) => originalKeys.includes(key) && !isSelectionKey(key))
      : [];
    const remaining = originalKeys.filter((key) => !isSelectionKey(key));
    return [...new Set([...selection, ...known, ...remaining])];
  }

  function isSelectionKey(key) {
    return key === '__selection__' || /(^|-)check(box)?$/i.test(key || '');
  }

  function setWidth(node, width) {
    const px = `${Math.round(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width)))}px`;
    node.style.setProperty('width', px, 'important');
    node.style.setProperty('min-width', px, 'important');
    node.style.setProperty('max-width', px, 'important');
    node.style.setProperty('flex', `0 0 ${px}`, 'important');
  }

  function ensureHeaderControls(header, state, key) {
    header.dataset.paTmHeader = key;
    if (header.querySelector(':scope > .pa-tm-resize')) return;

    const drag = document.createElement('button');
    drag.type = 'button';
    drag.className = 'pa-tm-drag';
    drag.textContent = '⋮⋮';
    drag.title = 'Trascina per spostare la colonna. Alt+Shift+←/→ da tastiera.';
    drag.setAttribute('aria-label', `Sposta colonna ${(header.innerText || key).trim()}`);
    drag.addEventListener('pointerdown', (event) => beginDrag(event, state, key));
    drag.addEventListener('keydown', (event) => keyboardMove(event, state, key));

    const hide = document.createElement('button');
    hide.type = 'button';
    hide.className = 'pa-tm-hide';
    hide.textContent = 'Hide';
    hide.title = 'Nascondi questa colonna solo nella visualizzazione';
    hide.setAttribute('aria-label', `Nascondi colonna ${cleanColumnLabel(state.labels[key] || key)}`);
    hide.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      hideColumn(state, key);
    });

    const resize = document.createElement('span');
    resize.className = 'pa-tm-resize';
    resize.title = 'Trascina per ridimensionare; doppio clic per adattare al contenuto';
    resize.setAttribute('role', 'separator');
    resize.setAttribute('aria-orientation', 'vertical');
    resize.setAttribute('aria-label', `Ridimensiona colonna ${(header.innerText || key).trim()}`);
    resize.addEventListener('pointerdown', (event) => beginResize(event, state, key, header));
    resize.addEventListener('dblclick', (event) => {
      event.preventDefault();
      event.stopPropagation();
      autoFit(state, key);
    });

    if (isSelectionKey(key)) header.append(resize);
    else header.append(hide, drag, resize);
  }

  function stateKeyFromAutomation(rawKey, state) {
    if (!rawKey) return null;
    const normalized = normalizeKey(rawKey, -1).toLowerCase();
    return state.originalKeys.find((key) => key.toLowerCase() === normalized) || null;
  }

  function expandCellTargets(row, pairs) {
    const cells = pairs.map(({ cell }) => cell);
    const targets = new Set();
    pairs.forEach(({ cell, key }) => {
      let node = cell;
      while (node && node !== row) {
        const containedCells = cells.reduce(
          (count, candidate) => count + (node.contains(candidate) ? 1 : 0),
          0,
        );
        if (containedCells !== 1) break;
        node.dataset.paTmCell = key;
        targets.add(node);
        node = node.parentElement;
      }
    });
    return [...targets];
  }

  function positionalCellPairs(cells, state) {
    if (cells.length === state.originalKeys.length) {
      return cells.map((cell, index) => ({ cell, key: state.originalKeys[index] }));
    }
    if (
      cells.length === state.originalKeys.length - 1
      && isSelectionKey(state.originalKeys[0])
    ) {
      return cells.map((cell, index) => ({ cell, key: state.originalKeys[index + 1] }));
    }
    return [];
  }

  function keyCells(row, state) {
    const nonSelectionKeys = state.originalKeys.filter((key) => !isSelectionKey(key));
    row.querySelectorAll('[data-pa-tm-cell], [data-pa-tm-unmatched]').forEach((node) => {
      node.removeAttribute('data-pa-tm-cell');
      node.removeAttribute('data-pa-tm-unmatched');
    });

    // La posizione ARIA è il riferimento più affidabile quando Fluent UI
    // virtualizza soltanto una parte delle colonne.
    const indexedMap = new Map();
    row.querySelectorAll('[aria-colindex]').forEach((node) => {
      const columnIndex = Number.parseInt(node.getAttribute('aria-colindex'), 10) - 1;
      const key = state.originalKeys[columnIndex];
      if (!key || isSelectionKey(key) || indexedMap.has(key)) return;
      const cell = node.closest(
        '[data-automationid="DetailsRowCell"], [data-automation-id="DetailsRowCell"], '
        + '.ms-DetailsRow-cell, [role="gridcell"], [role="rowheader"], [role="cell"]',
      ) || node;
      if (row.contains(cell)) indexedMap.set(key, cell);
    });
    if (nonSelectionKeys.every((key) => indexedMap.has(key))) {
      return expandCellTargets(
        row,
        nonSelectionKeys.map((key) => ({ cell: indexedMap.get(key), key })),
      );
    }

    // Seconda scelta: associazione semantica nativa di Fluent UI. Non dipende
    // dalla posizione e continua a funzionare con colonne virtualizzate.
    const semanticMap = new Map();
    row.querySelectorAll('[data-automation-key]').forEach((node) => {
      const key = stateKeyFromAutomation(node.getAttribute('data-automation-key'), state);
      if (!key || isSelectionKey(key) || semanticMap.has(key)) return;
      const cell = node.closest(
        '[data-automationid="DetailsRowCell"], [data-automation-id="DetailsRowCell"], '
        + '.ms-DetailsRow-cell, [role="gridcell"], [role="rowheader"], [role="cell"]',
      ) || node;
      if (row.contains(cell)) semanticMap.set(key, cell);
    });
    if (nonSelectionKeys.every((key) => semanticMap.has(key))) {
      return expandCellTargets(
        row,
        nonSelectionKeys.map((key) => ({ cell: semanticMap.get(key), key })),
      );
    }

    // Terza scelta: i veri contenitori DetailsRowCell, che sono i flex-item
    // responsabili della larghezza nella pagina Items.
    const fluentCells = [...new Set(row.querySelectorAll(
      '[data-automationid="DetailsRowCell"], [data-automationid="DetailsRowCheck"], '
      + '[data-automation-id="DetailsRowCell"], [data-automation-id="DetailsRowCheck"], '
      + '.ms-DetailsRow-cell, .ms-DetailsRow-check',
    ))];
    const fluentPairs = positionalCellPairs(fluentCells, state);
    if (fluentPairs.length) return expandCellTargets(row, fluentPairs);

    // Ultima scelta: ruoli ARIA senza indice. Se il numero non coincide non
    // viene applicata alcuna modifica alla riga.
    const roleSelector = '[role="gridcell"], [role="rowheader"], [role="cell"]';
    let roleCells = directChildrenByRole(row, ['gridcell', 'rowheader', 'cell']);
    if (!positionalCellPairs(roleCells, state).length) {
      roleCells = Array.from(row.querySelectorAll(roleSelector));
    }
    const rolePairs = positionalCellPairs(roleCells, state);
    return rolePairs.length ? expandCellTargets(row, rolePairs) : [];
  }

  function markUnmappedCells(row) {
    const selector = '[data-automationid="DetailsRowCell"], [data-automation-id="DetailsRowCell"], '
      + '.ms-DetailsRow-cell, [role="gridcell"], [role="rowheader"], [role="cell"]';
    row.querySelectorAll(selector).forEach((cell) => {
      if (cell.hasAttribute('data-pa-tm-cell')) return;
      if (
        cell.matches('[data-automationid="DetailsRowCheck"], [data-automation-id="DetailsRowCheck"], .ms-DetailsRow-check')
        || cell.querySelector('[role="checkbox"], [role="radio"], input[type="checkbox"], input[type="radio"]')
      ) return;
      cell.setAttribute('data-pa-tm-unmatched', '');
    });
  }

  function setColumnPresentation(node, key, orderIndex, hidden, width) {
    if (Number.isInteger(orderIndex)) node.style.setProperty('order', String(orderIndex), 'important');
    else node.style.removeProperty('order');
    if (hidden) node.style.setProperty('display', 'none', 'important');
    else node.style.removeProperty('display');
    if (width) setWidth(node, width);
  }

  function reorderHeaders(headerRow, headers, order) {
    const byKey = new Map(headers.map((header) => [header.dataset.paTmHeader, header]));
    const desired = [
      ...order.map((key) => byKey.get(key)).filter(Boolean),
      ...headers.filter((header) => !order.includes(header.dataset.paTmHeader)),
    ];
    if (desired.every((header, index) => headers…1148 tokens truncated…}"]`).forEach((cell) => setWidth(cell, width));
    };
    const end = (upEvent) => {
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', end, true);
      window.removeEventListener('pointercancel', end, true);
      document.body.classList.remove('pa-tm-resizing');
      saveWidth(state, key, startWidth + upEvent.clientX - startX);
    };
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', end, true);
    window.addEventListener('pointercancel', end, true);
  }

  function beginDrag(event, state, sourceKey) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    let targetKey = sourceKey;
    const move = (moveEvent) => {
      const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest('[data-pa-tm-header]');
      state.headerRow.querySelectorAll('.pa-tm-drop-target').forEach((node) => node.classList.remove('pa-tm-drop-target'));
      if (target && target.closest('[role="grid"]') === state.grid) {
        targetKey = target.dataset.paTmHeader;
        target.classList.add('pa-tm-drop-target');
      }
    };
    const end = () => {
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', end, true);
      state.headerRow.querySelectorAll('.pa-tm-drop-target').forEach((node) => node.classList.remove('pa-tm-drop-target'));
      if (targetKey !== sourceKey) {
        const order = state.order.slice();
        const from = order.indexOf(sourceKey);
        const to = order.indexOf(targetKey);
        order.splice(from, 1);
        order.splice(to, 0, sourceKey);
        saveOrder(state, order);
        toast('Ordine colonne salvato');
      }
    };
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', end, true);
  }

  function keyboardMove(event, state, key) {
    if (!(event.altKey && event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight'))) return;
    event.preventDefault();
    const order = state.order.slice();
    const from = order.indexOf(key);
    const to = Math.max(0, Math.min(order.length - 1, from + (event.key === 'ArrowLeft' ? -1 : 1)));
    if (to === from) return;
    order.splice(from, 1);
    order.splice(to, 0, key);
    saveOrder(state, order);
    requestAnimationFrame(() => state.headerRow.querySelector(`[data-pa-tm-header="${CSS.escape(key)}"] .pa-tm-drag`)?.focus());
  }

  function autoFit(state, key) {
    const nodes = [
      ...state.grid.querySelectorAll(`[data-pa-tm-header="${CSS.escape(key)}"], [data-pa-tm-cell="${CSS.escape(key)}"]`),
    ];
    const width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, ...nodes.map((node) => node.scrollWidth + 26)));
    saveWidth(state, key, width);
    toast(`Larghezza adattata: ${width}px`);
  }

  function registerGrid(grid) {
    if (gridStates.has(grid)) {
      const existingState = gridStates.get(grid);
      if (existingState.headerRow.isConnected) {
        applyState(existingState);
        return;
      }
      gridStates.delete(grid);
    }
    const headerRow = findHeaderRow(grid);
    if (!headerRow) return;
    const headers = directChildrenByRole(headerRow, ['columnheader']);
    const originalKeys = headers.map(headerKey);
    if (new Set(originalKeys).size !== originalKeys.length) return;
    headers.forEach((header, index) => { header.dataset.paTmHeader = originalKeys[index]; });
    const labels = Object.fromEntries(headers.map((header, index) => [
      originalKeys[index],
      cleanColumnLabel(header.getAttribute('aria-label') || header.innerText || originalKeys[index]),
    ]));
    const token = `grid-${nextGridToken++}`;
    grid.dataset.paTmGrid = token;
    const state = {
      grid,
      headerRow,
      originalKeys,
      labels,
      schema: schemaId(originalKeys),
      order: originalKeys.slice(),
      token,
    };
    gridStates.set(grid, state);
    applyState(state);
  }

  function isWorkQueuesListPage() {
    return /\/monitor\/work-queues\/?$/i.test(location.pathname);
  }

  function enhanceWorkQueueLinks() {
    if (!isWorkQueuesListPage()) {
      document.querySelectorAll('.pa-tm-items-link').forEach((link) => link.remove());
      return;
    }
    document.querySelectorAll('a[href*="/monitor/work-queues/"]').forEach((queueLink) => {
      if (queueLink.classList.contains('pa-tm-items-link')) return;
      const row = queueLink.closest('[role="row"]');
      if (!row || row.querySelector('[role="columnheader"]')) return;
      let url;
      try {
        url = new URL(queueLink.href, location.origin);
      } catch {
        return;
      }
      const match = url.pathname.match(/^(.*\/monitor\/work-queues\/)([0-9a-f-]{36})(?:\/details)?\/?$/i);
      if (!match) return;
      const existing = queueLink.parentElement?.querySelector(':scope > .pa-tm-items-link');
      if (existing) return;
      const itemsLink = document.createElement('a');
      itemsLink.className = 'pa-tm-items-link';
      itemsLink.href = `${match[1]}${match[2]}/items`;
      itemsLink.textContent = 'Items →';
      itemsLink.title = `Apri direttamente gli item di ${cleanColumnLabel(queueLink.innerText)}`;
      itemsLink.setAttribute('aria-label', itemsLink.title);
      itemsLink.addEventListener('click', (event) => event.stopPropagation());
      queueLink.insertAdjacentElement('afterend', itemsLink);
    });
  }

  function currentRouteKey() {
    return `${location.pathname}${location.search}${location.hash}`;
  }

  function resetAutoShowMoreSchedule() {
    if (autoShowMoreTimer) clearTimeout(autoShowMoreTimer);
    autoShowMoreTimer = null;
    autoShowMoreRoute = '';
    autoShowMoreClickCount = 0;
  }

  function scheduleAutoShowMore(route, delay = AUTO_SHOW_MORE_DELAY) {
    if (autoShowMoreTimer || route !== currentRouteKey()) return;
    autoShowMoreTimer = setTimeout(() => {
      autoShowMoreTimer = null;
      tryAutoShowMore(route);
    }, delay);
  }

  function tryAutoShowMore(route) {
    if (route !== currentRouteKey() || !readStore().settings.autoShowMore) return;
    const button = document.querySelector(
      'button[data-automation-id="showMoreButton"], button[data-automationid="showMoreButton"]',
    );
    if (!button) return;
    if (button.disabled || button.getAttribute('aria-disabled') === 'true') {
      scheduleAutoShowMore(route);
      return;
    }
    button.click();
    autoShowMoreClickCount += 1;
    if (autoShowMoreClickCount === 1) {
      toast('Espansione automatica della tabella in corso…', { duration: 5000 });
    }
    scheduleAutoShowMore(route);
  }

  function syncAutoShowMore() {
    if (!readStore().settings.autoShowMore) {
      resetAutoShowMoreSchedule();
      return;
    }
    const route = currentRouteKey();
    if (route !== autoShowMoreRoute) {
      if (autoShowMoreTimer) clearTimeout(autoShowMoreTimer);
      autoShowMoreRoute = route;
      autoShowMoreClickCount = 0;
      autoShowMoreTimer = null;
      scheduleAutoShowMore(route);
      return;
    }
    scheduleAutoShowMore(route);
  }

  function setAutoShowMore(enabled) {
    const store = readStore();
    store.settings.autoShowMore = enabled;
    writeStore(store);
    resetAutoShowMoreSchedule();
    updatePanel();
    if (enabled) {
      syncAutoShowMore();
      toast('Caricamento automatico attivato');
    } else {
      toast('Caricamento automatico disattivato');
    }
  }

  function scan() {
    scanQueued = false;
    document.querySelectorAll('[role="grid"]').forEach(registerGrid);
    enhanceWorkQueueLinks();
    refreshPersistentStyles();
    updatePanel();
    syncAutoShowMore();
  }

  function scheduleScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(scan);
  }

  function activeStates() {
    return Array.from(document.querySelectorAll('[role="grid"]'))
      .map((grid) => gridStates.get(grid))
      .filter(Boolean);
  }

  function resetVisible() {
    const store = readStore();
    activeStates().forEach((state) => {
      delete store.layouts[state.schema];
      delete store.hidden[state.schema];
    });
    const visibleKeys = new Set(activeStates().flatMap((state) => state.originalKeys));
    visibleKeys.forEach((key) => delete store.widths[key]);
    writeStore(store);
    location.reload();
  }

  function exportSettings() {
    const text = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...readStore() }, null, 2);
    const copyOperation = navigator.clipboard?.writeText(text);
    if (copyOperation) {
      copyOperation
        .then(() => toast('Configurazione copiata negli appunti'))
        .catch(() => window.prompt('Copia la configurazione:', text));
    } else {
      window.prompt('Copia la configurazione:', text);
    }
  }

  function importSettings() {
    const raw = window.prompt('Incolla la configurazione esportata:');
    if (!raw) return;
    try {
      const value = JSON.parse(raw);
      if (!value.layouts || !value.widths) throw new Error('Formato non valido');
      writeStore({
        layouts: value.layouts,
        widths: value.widths,
        hidden: value.hidden || {},
        settings: {
          autoShowMore: value.settings?.autoShowMore === true,
          buttonPosition: value.settings?.buttonPosition
            && Number.isFinite(value.settings.buttonPosition.x)
            && Number.isFinite(value.settings.buttonPosition.y)
            ? value.settings.buttonPosition
            : null,
        },
      });
      toast('Configurazione importata');
      location.reload();
    } catch (error) {
      window.alert(`Importazione non riuscita: ${error.message}`);
    }
  }

  function toast(message, { duration = 3000, actionLabel = '', onAction = null } = {}) {
    document.getElementById('pa-tm-toast')?.remove();
    const node = document.createElement('div');
    node.id = 'pa-tm-toast';
    const text = document.createElement('span');
    text.textContent = message;
    node.appendChild(text);
    let timeoutId;
    if (actionLabel && typeof onAction === 'function') {
      const action = document.createElement('button');
      action.type = 'button';
      action.textContent = actionLabel;
      action.addEventListener('click', () => {
        clearTimeout(timeoutId);
        node.remove();
        onAction();
      });
      node.appendChild(action);
    }
    document.body.appendChild(node);
    timeoutId = setTimeout(() => node.remove(), duration);
  }

  function currentViewLabel() {
    if (/\/monitor\/work-queues\/[^/]+\/items\/?$/i.test(location.pathname)) return 'Items';

    const main = document.querySelector('[role="main"], main');
    const headings = Array.from(main?.querySelectorAll('h1, h2, [role="heading"]') || []);
    const heading = headings
      .map((node) => node.innerText?.trim())
      .find((text) => text && text.length < 100 && !/^Power Automate$/i.test(text));
    const selectedTab = Array.from(main?.querySelectorAll('[role="tab"][aria-selected="true"]') || [])
      .map((node) => node.innerText?.trim())
      .find(Boolean);
    if (heading && selectedTab && heading.toLowerCase() !== selectedTab.toLowerCase()) {
      return `${heading} · ${selectedTab}`;
    }
    if (heading) return heading;

    const pathParts = location.pathname.split('/').filter(Boolean);
    const monitorIndex = pathParts.findIndex((part) => part.toLowerCase() === 'monitor');
    const slug = monitorIndex >= 0 ? pathParts[monitorIndex + 1] : pathParts.at(-1);
    if (!slug) return 'Power Automate';
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function updatePanel() {
    const status = document.querySelector('#pa-tm-panel .pa-tm-status');
    if (!status) return;
    const states = activeStates();
    const columns = new Set(states.flatMap((state) => state.originalKeys)).size;
    status.textContent = states.length
      ? `${states.length} griglia/e rilevata/e · ${columns} colonne gestite`
      : 'In attesa di una griglia Power Automate…';

    const viewName = document.querySelector('#pa-tm-panel .pa-tm-view-name');
    if (viewName) viewName.textContent = currentViewLabel();

    const hiddenBox = document.querySelector('#pa-tm-panel .pa-tm-hidden');
    if (!hiddenBox) return;
    hiddenBox.replaceChildren();
    const store = readStore();
    const seen = new Set();
    states.forEach((state) => {
      (store.hidden[state.schema] || []).forEach((key) => {
        const identity = `${state.schema}::${key}`;
        if (seen.has(identity)) return;
        seen.add(identity);
        if (!hiddenBox.children.length) {
          const label = document.createElement('span');
          label.className = 'pa-tm-hidden-label';
          label.textContent = 'Colonne nascoste:';
          hiddenBox.appendChild(label);
        }
        const chip = document.createElement('span');
        chip.className = 'pa-tm-hidden-chip';
        chip.textContent = cleanColumnLabel(state.labels[key] || key);
        hiddenBox.appendChild(chip);
      });
    });
    const showHidden = document.querySelector('#pa-tm-panel [data-action="show-hidden"]');
    if (showHidden) showHidden.disabled = seen.size === 0;
    const autoShowMore = document.querySelector('#pa-tm-auto-show-more');
    if (autoShowMore) autoShowMore.checked = readStore().settings.autoShowMore;
  }

  function addUi() {
    const style = document.createElement('style');
    style.id = 'pa-tm-base-styles';
    style.textContent = css;
    document.head.appendChild(style);
    const persistentStyle = document.createElement('style');
    persistentStyle.id = 'pa-tm-persistent-styles';
    document.head.appendChild(persistentStyle);

    const button = document.createElement('button');
    button.id = 'pa-tm-button';
    button.type = 'button';
    button.textContent = 'PA Enhanced';
    button.title = 'Trascina per spostare; clicca per aprire PA Enhanced';

    const panel = document.createElement('section');
    panel.id = 'pa-tm-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <strong>PA Enhanced</strong>
      <div class="pa-tm-view">
        <span>Vista corrente</span>
        <b class="pa-tm-view-name">Power Automate</b>
        <small>Le modifiche agiscono soltanto su questa pagina.</small>
      </div>
      <div>Trascina <b>⋮⋮</b> per spostare; usa il bordo destro per il resize. Passa sul titolo e premi <b>Hide</b> per rimuovere una colonna dalla vista.</div>
      <div class="pa-tm-status"></div>
      <div class="pa-tm-hidden"></div>
      <div class="pa-tm-option">
        <label>
          <input id="pa-tm-auto-show-more" type="checkbox">
          <span>Premi automaticamente <b>Show more</b></span>
        </label>
        <small>Se il tasto è presente al termine della tabella, verrà cliccato automaticamente più volte fino a espandere tutti gli elementi disponibili.</small>
      </div>
      <div class="pa-tm-actions">
        <button type="button" class="pa-tm-wide" data-action="show-hidden">Mostra tutte le colonne nascoste</button>
        <button type="button" data-action="reset-visible">Ripristina questa vista</button>
        <button type="button" data-action="reset-all">Azzera tutto</button>
        <button type="button" data-action="export">Esporta layout</button>
        <button type="button" data-action="import">Importa layout</button>
      </div>`;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));
    const positionPanel = () => {
      if (panel.hidden) return;
      const buttonRect = button.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const margin = 8;
      const maxLeft = window.innerWidth - panelRect.width - margin;
      const maxTop = window.innerHeight - panelRect.height - margin;
      const left = clamp(buttonRect.right - panelRect.width, margin, maxLeft);
      const above = buttonRect.top - panelRect.height - margin;
      const below = buttonRect.bottom + margin;
      const top = clamp(above >= margin ? above : below, margin, maxTop);
      panel.style.left = `${Math.round(left)}px`;
      panel.style.top = `${Math.round(top)}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    };
    const positionButton = (x, y) => {
      const rect = button.getBoundingClientRect();
      const margin = 8;
      const next = {
        x: clamp(x, margin, window.innerWidth - rect.width - margin),
        y: clamp(y, margin, window.innerHeight - rect.height - margin),
      };
      button.style.left = `${Math.round(next.x)}px`;
      button.style.top = `${Math.round(next.y)}px`;
      button.style.right = 'auto';
      button.style.bottom = 'auto';
      positionPanel();
      return next;
    };
    const saveButtonPosition = (position) => {
      const store = readStore();
      store.settings.buttonPosition = {
        x: Math.round(position.x),
        y: Math.round(position.y),
      };
      writeStore(store);
    };

    let ignoreNextClick = false;
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      const startX = event.clientX;
      const startY = event.clientY;
      const startRect = button.getBoundingClientRect();
      let moved = false;
      let current = { x: startRect.left, y: startRect.top };

      const move = (moveEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        if (!moved && Math.hypot(deltaX, deltaY) < 4) return;
        moved = true;
        moveEvent.preventDefault();
        button.classList.add('pa-tm-dragging');
        current = positionButton(startRect.left + deltaX, startRect.top + deltaY);
      };
      const end = () => {
        window.removeEventListener('pointermove', move, true);
        window.removeEventListener('pointerup', end, true);
        window.removeEventListener('pointercancel', end, true);
        button.classList.remove('pa-tm-dragging');
        if (!moved) return;
        saveButtonPosition(current);
        ignoreNextClick = true;
        setTimeout(() => { ignoreNextClick = false; }, 0);
      };

      window.addEventListener('pointermove', move, true);
      window.addEventListener('pointerup', end, true);
      window.addEventListener('pointercancel', end, true);
    });

    button.addEventListener('click', () => {
      if (ignoreNextClick) return;
      panel.hidden = !panel.hidden;
      updatePanel();
      requestAnimationFrame(positionPanel);
    });
    panel.querySelector('#pa-tm-auto-show-more').addEventListener('change', (event) => {
      setAutoShowMore(event.target.checked);
    });
    panel.addEventListener('click', (event) => {
      const action = event.target.closest('button')?.dataset.action;
      if (action === 'reset-visible') resetVisible();
      if (action === 'reset-all' && window.confirm('Azzerare tutti i layout salvati da questo script?')) {
        clearStore();
        location.reload();
      }
      if (action === 'export') exportSettings();
      if (action === 'import') importSettings();
      if (action === 'show-hidden') showAllHiddenVisible();
    });
    document.body.append(button, panel);
    const savedPosition = readStore().settings.buttonPosition;
    if (savedPosition) requestAnimationFrame(() => positionButton(savedPosition.x, savedPosition.y));
    window.addEventListener('resize', () => {
      const rect = button.getBoundingClientRect();
      const adjusted = positionButton(rect.left, rect.top);
      if (readStore().settings.buttonPosition) saveButtonPosition(adjusted);
    });
    updatePanel();
  }

  addUi();
  const observer = new MutationObserver(scheduleScan);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleScan();
  window.addEventListener('popstate', scheduleScan);
})();

