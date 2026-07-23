<template>
  <Teleport to="body">
    <div v-if="visible" class="cr-overlay" @keydown="onKeydown" tabindex="0" ref="overlayRef" @click="closeDropdown">
      <header class="cr-header" :class="{ 'cr-header-hidden': !showHeader }">
        <div class="cr-header-left"><button class="cr-btn cr-btn-icon" @click="close" title="Close (Esc)"><span>✕</span></button><span class="cr-title">{{ comicTitle }}</span></div>
        <div class="cr-header-center"><span v-if="!loading" class="cr-page-indicator">{{ currentPage }} / {{ pageCount }}</span></div>
        <div class="cr-header-right">
          <div class="cr-dropdown"><button class="cr-btn cr-btn-icon" ref="viewMenuBtnRef" @click.stop="showViewMenu = !showViewMenu" title="View options"><span>⚙</span></button></div>
          <button class="cr-btn cr-btn-icon" @click="toggleFullscreen" title="Fullscreen (F)"><span>⛶</span></button>
        </div>
      </header>
      <div v-if="showViewMenu" class="cr-dropdown-menu" :style="menuStyle" @click.stop>
        <button class="cr-menu-item" @click="rotateRight"><span class="cr-menu-text">Rotate Right</span><span class="cr-menu-key">R</span></button>
        <button class="cr-menu-item" @click="rotateLeft"><span class="cr-menu-text">Rotate Left</span><span class="cr-menu-key">L</span></button>
        <hr class="cr-menu-sep"/>
        <button class="cr-menu-item" :class="{ 'is-active': viewMode === 'single' }" @click="viewMode = 'single'"><span class="cr-menu-check">{{ viewMode === 'single' ? '✓' : '' }}</span><span class="cr-menu-text">1-Page</span><span class="cr-menu-key">1</span></button>
        <button class="cr-menu-item" :class="{ 'is-active': viewMode === 'double' }" @click="viewMode = 'double'"><span class="cr-menu-check">{{ viewMode === 'double' ? '✓' : '' }}</span><span class="cr-menu-text">2-Page</span><span class="cr-menu-key">2</span></button>
        <button class="cr-menu-item" :class="{ 'is-active': viewMode === 'strip-v' }" @click="viewMode = 'strip-v'"><span class="cr-menu-check">{{ viewMode === 'strip-v' ? '✓' : '' }}</span><span class="cr-menu-text">Long Strip</span><span class="cr-menu-key">3</span></button>
        <button class="cr-menu-item" :class="{ 'is-active': viewMode === 'strip-h' }" @click="viewMode = 'strip-h'"><span class="cr-menu-check">{{ viewMode === 'strip-h' ? '✓' : '' }}</span><span class="cr-menu-text">Wide Strip</span><span class="cr-menu-key">4</span></button>
        <hr class="cr-menu-sep"/>
        <button class="cr-menu-item" :class="{ 'is-active': fitMode === 'best' }" @click="fitMode = 'best'"><span class="cr-menu-check">{{ fitMode === 'best' ? '✓' : '' }}</span><span class="cr-menu-text">Best Fit</span><span class="cr-menu-key">B</span></button>
        <button class="cr-menu-item" :class="{ 'is-active': fitMode === 'height' }" @click="fitMode = 'height'"><span class="cr-menu-check">{{ fitMode === 'height' ? '✓' : '' }}</span><span class="cr-menu-text">Fit Height</span><span class="cr-menu-key">H</span></button>
        <button class="cr-menu-item" :class="{ 'is-active': fitMode === 'width' }" @click="fitMode = 'width'"><span class="cr-menu-check">{{ fitMode === 'width' ? '✓' : '' }}</span><span class="cr-menu-text">Fit Width</span><span class="cr-menu-key">W</span></button>
        <hr class="cr-menu-sep"/>
        <button class="cr-menu-item" :class="{ 'is-active': !showHeader }" @click="showHeader = !showHeader"><span class="cr-menu-check">{{ !showHeader ? '✓' : '' }}</span><span class="cr-menu-text">Hide Header</span><span class="cr-menu-key">P</span></button>
      </div>
      <div v-if="loading" class="cr-loading"><div class="cr-loading-spinner"></div><p>Loading...</p></div>
      <div v-else-if="error" class="cr-error"><p>{{ error }}</p><button class="cr-btn cr-btn-primary" @click="close">Close</button></div>
      <div v-else class="cr-body" @click="onBodyClick"
        @touchstart.prevent="onSwipeStart" @touchmove.prevent="onSwipeMove" @touchend="onSwipeEnd"
        @mousedown="onSwipeStart" @mousemove="onSwipeMove" @mouseup="onSwipeEnd" @mouseleave="onSwipeEnd"
        :class="{
          'cr-body--hide-header': !showHeader,
          'cr-body--strip-v': viewMode === 'strip-v',
          'cr-body--strip-h': viewMode === 'strip-h',
          'cr-body--double': viewMode === 'double',
        }">
        <template v-if="viewMode === 'double'">
          <div class="cr-double-wrap" :class="'cr-fit--' + fitMode">
            <img v-if="leftSrc" :src="leftSrc" class="cr-page-img cr-page-left" :style="{ transform: `rotate(${rotation}deg)` }" draggable="false"/>
            <img v-if="rightSrc" :src="rightSrc" class="cr-page-img cr-page-right" :style="{ transform: `rotate(${rotation}deg)` }" draggable="false"/>
          </div>
        </template>
        <template v-else-if="viewMode === 'strip-v'">
          <div ref="stripWrapRef" class="cr-strip-v">
            <div v-for="p in pageCount" :key="p" :ref="(el: any) => setStripRef(p - 1, el)" class="cr-strip-page"><div class="cr-strip-label">Page {{ p }}</div><img :src="pageUrl(p)" class="cr-strip-img" :style="{ transform: `rotate(${rotation}deg)` }" loading="lazy" draggable="false"/></div>
          </div>
        </template>
        <template v-else-if="viewMode === 'strip-h'">
          <div ref="stripWrapRef" class="cr-strip-h" :class="'cr-fit--' + fitMode" @scroll="onStripScroll">
            <div v-for="p in pageCount" :key="p" :ref="(el) => setStripRef(p - 1, el)" class="cr-strip-h-page" @click="goToPage(p)"><div class="cr-strip-label">{{ p }}</div><img :src="pageUrl(p)" class="cr-strip-h-img" :style="{ transform: `rotate(${rotation}deg)` }" loading="lazy" draggable="false"/></div>
          </div>
        </template>
        <!-- Single mode with animated transition -->
        <template v-else>
          <div class="cr-single-wrap" :class="'cr-fit--' + fitMode">
            <!-- Base: current page (z-index:2, clipped complementarily during animation) -->
            <img :src="baseSrc" class="cr-page-img cr-img-base" :style="baseStyle" draggable="false"/>
            <!-- Overlay: new page (z-index:3, with animated clip-path + fade-in) -->
            <img v-if="animSrc" :src="animSrc" class="cr-page-img cr-img-anim cr-fade-in" :style="animStyle" draggable="false"/>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  visible: boolean;
  comicId: number;
  comicTitle: string;
  pageCount: number;
}>();
const emit = defineEmits<{ close: [] }>();

// Internal comic state — initialized from props, then self-managed for cross-comic nav
const comicId = ref(props.comicId);
const comicTitle = ref(props.comicTitle);
const pageCount = ref(props.pageCount);
const nextId = ref<number | null>(null);
const prevId = ref<number | null>(null);
const comicSlug = ref("");

// Sync from props on external changes (e.g. parent navigates to different comic)
watch(() => props.comicId, (v) => { comicId.value = v; });
watch(() => props.comicTitle, (v) => { comicTitle.value = v; });
watch(() => props.pageCount, (v) => { pageCount.value = v; });

const currentPage = ref(1);
const loading = ref(false); const error = ref("");
const overlayRef = ref<HTMLDivElement | null>(null);

// ── Transition state (like CodePen: new slide gets is-animating, old stays visible)
const animSrc = ref("");        // new page image URL for the overlay
const animProgress = ref(0);    // 0→1 linear
const animDir = ref(1);         // 1=next, -1=prev
let animating = false;
let animId = 0;

// Base shows the OLD page during animation, updates after
const basePage = ref(1);
const baseSrc = computed(() => basePage.value > 0 && basePage.value <= pageCount.value ? pageUrl(basePage.value) : "");

const viewMode = ref<"single" | "double" | "strip-v" | "strip-h">("single");
const fitMode = ref<"best" | "height" | "width">("best");
const rotation = ref(0);
const showHeader = ref(true);
const showViewMenu = ref(false);
const viewMenuBtnRef = ref<HTMLButtonElement | null>(null);
const stripWrapRef = ref<HTMLDivElement | null>(null);
const stripPageRefs = ref<HTMLElement[]>([]);

const menuStyle = computed(() => {
  if (!viewMenuBtnRef.value) return { top: "48px", right: "4px" };
  const r = viewMenuBtnRef.value.getBoundingClientRect();
  return { top: r.bottom + "px", right: window.innerWidth - r.right + "px" };
});

function closeDropdown() { showViewMenu.value = false; }
function setStripRef(i: number, el: any) { if (el instanceof HTMLElement) stripPageRefs.value[i] = el; }
function pageUrl(p: number) { return `/api/comics/${comicId.value}/pages/${p}`; }
const currentSrc = computed(() => currentPage.value > 0 && currentPage.value <= pageCount.value ? pageUrl(currentPage.value) : "");
const leftSrc = computed(() => currentPage.value > 0 ? pageUrl(currentPage.value) : "");
const rightSrc = computed(() => currentPage.value < pageCount.value ? pageUrl(currentPage.value + 1) : "");

// CodePen clip-path shapes mapped to 0-100% coordinates
// Phase 1: thin edge → diagonal sweep. Phase 2: diagonal → full
const animStyle = computed(() => {
  let s = `transform: rotate(${rotation.value}deg)`;
  if (!animSrc.value) return s;
  const t = animProgress.value;
  const dir = animDir.value;
  if (dir > 0) {
    // NEXT: sweep from right to left
    if (t < 0.5) {
      const p = ease1(t / 0.5);
      const x1 = 99.8 - p * 60;   // 99.8 → 39.8
      const x2 = 99.8 - p * 75;   // 99.8 → 24.8
      s += `; clip-path: polygon(${x1}% 0, 100% 0, 100% 100%, ${x2}% 100%)`;
    } else {
      const p = ease2((t - 0.5) / 0.5);
      const x1 = 39.8 - p * 39.8; // 39.8 → 0
      const x2 = 24.8 - p * 24.8; // 24.8 → 0
      s += `; clip-path: polygon(${x1}% 0, 100% 0, 100% 100%, ${x2}% 100%)`;
    }
  } else {
    // PREV: sweep from left to right
    if (t < 0.5) {
      const p = ease1(t / 0.5);
      const x1 = 0.2 + p * 60;    // 0.2 → 60.2
      const x2 = 0.2 + p * 75;    // 0.2 → 75.2
      s += `; clip-path: polygon(0 0, ${x1}% 0, ${x2}% 100%, 0 100%)`;
    } else {
      const p = ease2((t - 0.5) / 0.5);
      const x1 = 60.2 + p * 39.8; // 60.2 → 100
      const x2 = 75.2 + p * 24.8; // 75.2 → 100
      s += `; clip-path: polygon(0 0, ${x1}% 0, ${x2}% 100%, 0 100%)`;
    }
  }
  return s;
});

// Base image gets the complementary clip-path so the old page
// doesn't peek through the edges of the new page during animation.
const baseStyle = computed(() => {
  let s = `transform: rotate(${rotation.value}deg)`;
  if (!animSrc.value) return s;
  const t = animProgress.value;
  const dir = animDir.value;
  if (dir > 0) {
    // NEXT: overlay sweeps right→left, base complements left→right
    if (t < 0.5) {
      const p = ease1(t / 0.5);
      const x1 = 99.8 - p * 60;
      const x2 = 99.8 - p * 75;
      s += `; clip-path: polygon(0 0, ${x1}% 0, ${x2}% 100%, 0 100%)`;
    } else {
      const p = ease2((t - 0.5) / 0.5);
      const x1 = 39.8 - p * 39.8;
      const x2 = 24.8 - p * 24.8;
      s += `; clip-path: polygon(0 0, ${x1}% 0, ${x2}% 100%, 0 100%)`;
    }
  } else {
    // PREV: overlay sweeps left→right, base complements right→left
    if (t < 0.5) {
      const p = ease1(t / 0.5);
      const x1 = 0.2 + p * 60;
      const x2 = 0.2 + p * 75;
      s += `; clip-path: polygon(${x1}% 0, 100% 0, 100% 100%, ${x2}% 100%)`;
    } else {
      const p = ease2((t - 0.5) / 0.5);
      const x1 = 60.2 + p * 39.8;
      const x2 = 75.2 + p * 24.8;
      s += `; clip-path: polygon(${x1}% 0, 100% 0, 100% 100%, ${x2}% 100%)`;
    }
  }
  return s;
});

function ease1(t: number): number { // cubic-bezier(0.42, 0.03, 0.77, 0.63)
  const u = 1 - t;
  return 3 * u * u * t * 0.03 + 3 * u * t * t * 0.77 + t * t * t;
}
function ease2(t: number): number { // cubic-bezier(0.27, 0.5, 0.6, 0.99)
  const u = 1 - t;
  return 3 * u * u * t * 0.5 + 3 * u * t * t * 0.6 + t * t * t;
}

// ── Load
async function load() {
  if (!props.visible || !comicId.value) return;
  loading.value = true; error.value = "";

  // Fetch comic info to get nextId/prevId and accurate page count
  try {
    const data = await $fetch<any>(`/api/comics/${comicId.value}`);
    const c = data.comic;
    comicTitle.value = c.title || c.file_name;
    pageCount.value = c.page_count || 1;
    nextId.value = data.nextId ?? null;
    prevId.value = data.prevId ?? null;
    comicSlug.value = c.slug || "";
  } catch { /* use props */ }

  const hp = parseInt((window.location.hash || "").replace(/^#p?/, ""), 10);
  const p = (hp >= 1 && hp <= pageCount.value) ? hp : 1;
  currentPage.value = p;
  basePage.value = p;
  try { const r = await fetch(pageUrl(p)); if (!r.ok) throw new Error(`status ${r.status}`); }
  catch (e: any) { error.value = e.message || "Failed to load comic"; }
  loading.value = false;
  preloadAdjacent(p);
}
watch(() => props.visible, (v) => { if (v) load(); });
watch(() => props.comicId, () => { if (props.visible) load(); });

function preloadAdjacent(p: number) {
  for (let i = p - 2; i <= p + 5; i++) {
    if (i >= 1 && i <= pageCount.value && i !== p) {
      const img = new Image();
      img.src = pageUrl(i);
      // Decode immediately so rasterization doesn't compete with animation later
      img.decode().catch(() => {});
    }
  }
}

async function loadImage(p: number): Promise<void> {
  const img = new Image();
  img.src = pageUrl(p);
  // decode() resolves only when the image is fully rasterized — not just downloaded.
  // This guarantees zero decode-jank during the subsequent clip-path animation.
  try { await img.decode(); } catch { /* broken image, continue anyway */ }
}

// ── Hash
function updateHash(p: number) { if (props.visible && p > 0) history.replaceState(null, "", `#p${p}`); }
function onHashChange() {
  if (!props.visible) return;
  const p = parseInt((window.location.hash || "").replace(/^#p?/, ""), 10);
  if (p >= 1 && p <= pageCount.value && p !== currentPage.value) goToPage(p);
}
onMounted(() => window.addEventListener("hashchange", onHashChange));
onUnmounted(() => window.removeEventListener("hashchange", onHashChange));

function goToPage(n: number) {
  const p = Math.max(1, Math.min(pageCount.value, n));
  currentPage.value = p; basePage.value = p; updateHash(p);
  if (viewMode.value === "strip-v" || viewMode.value === "strip-h") scrollToStrip();
}
function scrollToStrip() { nextTick(() => { const el = stripPageRefs.value[currentPage.value - 1]; if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" }); }); }
function onStripScroll() {
  if (viewMode.value !== "strip-h") return; const w = stripWrapRef.value; if (!w) return;
  const cx = w.scrollLeft + w.clientWidth / 2; let best = 0, bestD = Infinity;
  for (let i = 0; i < stripPageRefs.value.length; i++) { const el = stripPageRefs.value[i]; if (!el) continue; const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - cx); if (d < bestD) { bestD = d; best = i; } }
  currentPage.value = best + 1; basePage.value = best + 1; updateHash(currentPage.value);
}

// ── Animated page turn (CodePen: new slide overlays with animated clip-path)
async function pageTurn(dir: 1 | -1) {
  if (viewMode.value !== "single" || animating) { dir > 0 ? goToPage(currentPage.value + 1) : goToPage(currentPage.value - 1); return; }

  // Check for cross-comic navigation at boundaries
  if (dir > 0 && currentPage.value >= pageCount.value) {
    if (nextId.value) { await loadComic(nextId.value, 1); }
    return;
  }
  if (dir < 0 && currentPage.value <= 1) {
    if (prevId.value) { await loadComic(prevId.value, -1); }
    return;
  }

  const target = dir > 0 ? Math.min(pageCount.value, currentPage.value + 1) : Math.max(1, currentPage.value - 1);
  if (target === currentPage.value) return;
  animating = true;

  // Preload and wait for target image to be fully loaded
  await loadImage(target);

  // Show overlay with start clip-path, base stays as old page
  animSrc.value = pageUrl(target);
  animDir.value = dir;
  animProgress.value = 0;

  // Page change and hash update instantly
  currentPage.value = target;
  updateHash(target);

  // Single animation: 0→1 over 500ms
  await new Promise<void>(resolve => {
    cancelAnimationFrame(animId);
    const start = performance.now();
    const duration = 375;
    function frame(now: number) {
      const t = Math.min((now - start) / duration, 1);
      animProgress.value = t;
      if (t < 1) { animId = requestAnimationFrame(frame); } else { resolve(); }
    }
    animId = requestAnimationFrame(frame);
  });

  // Done: update base to new page, clear anim
  basePage.value = target;
  animSrc.value = "";
  animating = false;
}

/**
 * Load a different comic and jump to its first or last page.
 * Updates internal state and browser URL.
 */
async function loadComic(newId: number, startPage: number) {
  try {
    const data = await $fetch<any>(`/api/comics/${newId}`);
    const c = data.comic;

    comicId.value = c.id;
    comicTitle.value = c.title || c.file_name;
    pageCount.value = c.page_count || 1;
    nextId.value = data.nextId ?? null;
    prevId.value = data.prevId ?? null;
    comicSlug.value = c.slug || "";

    // Go to first or last page
    const targetPage = startPage > 0 ? 1 : pageCount.value;
    currentPage.value = targetPage;
    basePage.value = targetPage;

    // Update URL to new comic + page hash
    const slugPart = comicSlug.value ? `-${comicSlug.value}` : "";
    const newPath = `/comic/${comicId.value}${slugPart}#p${targetPage}`;
    history.replaceState(null, "", newPath);

    // Preload pages for the new comic
    preloadAdjacent(targetPage);
  } catch {
    // silently fail — stay on current comic
  }
}

function onBodyClick(e: MouseEvent) {
  if (swipeFired) return;
  if (viewMode.value !== "single" && viewMode.value !== "double") return;
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = e.clientX - r.left;
  if (x < r.width * 0.3) pageTurn(-1);
  else if (x > r.width * 0.7) pageTurn(1);
}

// ── Swipe (touch + mouse drag)
let swipeX = 0, swipeY = 0, swiping = false, swipeFired = false;
const SWIPE_THRESH = 50;

function onSwipeStart(e: TouchEvent | MouseEvent) {
  swipeFired = false;
  if ("touches" in e) { swipeX = e.touches[0].clientX; swipeY = e.touches[0].clientY; }
  else { swipeX = e.clientX; swipeY = e.clientY; swiping = true; }
}

function onSwipeMove(e: TouchEvent | MouseEvent) {
  // Only track if actually dragging
  if (!swiping && !("touches" in e)) return;
}

function onSwipeEnd(e: TouchEvent | MouseEvent) {
  if (!swiping && !("touches" in e)) return; // Not dragging, ignore
  let cx: number, cy: number;
  if ("changedTouches" in e) { cx = e.changedTouches[0].clientX; cy = e.changedTouches[0].clientY; }
  else { cx = (e as MouseEvent).clientX; cy = (e as MouseEvent).clientY; }
  swiping = false;
  const dx = cx - swipeX, dy = cy - swipeY;
  const absDx = Math.abs(dx), absDy = Math.abs(dy);

  if (absDx < SWIPE_THRESH && absDy < SWIPE_THRESH) return; // too small

  if (absDy > absDx * 1.5) {
    // Vertical swipe: toggle header
    swipeFired = true;
    showHeader.value = dy > 0;
  } else if (absDx > absDy * 1.5) {
    // Horizontal swipe: page turn
    swipeFired = true;
    pageTurn(dx < 0 ? 1 : -1);
  }
}

function rotateLeft() { rotation.value = (rotation.value - 90 + 360) % 360; showViewMenu.value = false; }
function rotateRight() { rotation.value = (rotation.value + 90) % 360; showViewMenu.value = false; }
function toggleFullscreen() { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") close();
  else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") pageTurn(-1);
  else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") pageTurn(1);
  else if (e.key === "ArrowUp") { showHeader.value = false; }
  else if (e.key === "ArrowDown") { showHeader.value = true; }
  else if (e.key === "Home") goToPage(1);
  else if (e.key === "End") goToPage(pageCount.value);
  else if (e.key === "f" || e.key === "F") toggleFullscreen();
  else if (e.key === "1") viewMode.value = "single";
  else if (e.key === "2") viewMode.value = "double";
  else if (e.key === "3") viewMode.value = "strip-v";
  else if (e.key === "4") viewMode.value = "strip-h";
  else if (e.key === "b" || e.key === "B") fitMode.value = "best";
  else if (e.key === "h" || e.key === "H") fitMode.value = "height";
  else if (e.key === "w" || e.key === "W") fitMode.value = "width";
  else if (e.key === "r" || e.key === "R") rotateRight();
  else if (e.key === "l" || e.key === "L") rotateLeft();
  else if (e.key === "p" || e.key === "P") showHeader.value = !showHeader.value;
}

function close() { showViewMenu.value = false; emit("close"); }
watch(() => props.visible, (v) => { if (v) nextTick(() => overlayRef.value?.focus()); });
</script>

<style>
.cr-overlay{position:fixed;inset:0;z-index:1000;background:#000;display:flex;flex-direction:column;outline:none;user-select:none}
.cr-header{position:absolute;top:0;left:0;right:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:.5rem 1rem;background:linear-gradient(to bottom,rgba(0,0,0,.9),transparent);color:#fff;transition:opacity .2s,transform .2s}
.cr-header-hidden{opacity:0;transform:translateY(-100%);pointer-events:none}
.cr-header-left,.cr-header-center,.cr-header-right{display:flex;align-items:center;gap:.75rem}
.cr-title{font-size:.875rem;font-weight:500;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cr-page-indicator{font-size:.8125rem;color:rgba(255,255,255,.7)}
.cr-btn{border:none;cursor:pointer;font-family:inherit}
.cr-btn-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:6px;color:#fff;font-size:1.25rem;background:none;transition:background .15s}
.cr-btn-icon:hover{background:rgba(255,255,255,.15)}
.cr-btn-primary{padding:.5rem 1.5rem;background:#6366f1;color:#fff;border-radius:6px}
.cr-dropdown{position:relative}
.cr-dropdown-menu{position:fixed;z-index:20;background:#1e1e2e;border:1px solid #333;border-radius:8px;padding:.5rem 0;min-width:220px;box-shadow:0 8px 24px rgba(0,0,0,.6)}
.cr-menu-item{display:flex;align-items:center;gap:.75rem;width:100%;padding:.5rem 1rem;color:#ccc;font-size:.8125rem;background:none;border:none;cursor:pointer;text-align:left;transition:background .15s}
.cr-menu-item:hover,.cr-menu-item.is-active{background:rgba(255,255,255,.08);color:#fff}
.cr-menu-check{width:16px;text-align:center;color:#6366f1}
.cr-menu-text{flex:1}
.cr-menu-key{font-size:.6875rem;color:#666;background:rgba(255,255,255,.06);padding:.1rem .4rem;border-radius:3px}
.cr-menu-sep{border:none;border-top:1px solid #333;margin:.25rem 0}
.cr-body{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative;cursor:pointer}
.cr-single-wrap{flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.cr-page-img{max-width:100%;max-height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none}
.cr-img-base{position:relative;z-index:2}
.cr-img-anim{position:absolute;z-index:3}
.cr-fade-in{animation:cr-fade-in .125s ease both}
@keyframes cr-fade-in{0%{opacity:0}100%{opacity:1}}
.cr-fit--height .cr-page-img{max-width:none;height:100%;width:auto}
/* Fit-width: allow vertical scroll for tall pages */
.cr-single-wrap.cr-fit--width{overflow-y:auto;align-items:flex-start;justify-content:flex-start}
.cr-single-wrap.cr-fit--width .cr-page-img{max-height:none;width:100%;height:auto}
.cr-double-wrap.cr-fit--width{overflow-y:auto;align-items:flex-start}
.cr-double-wrap.cr-fit--width .cr-page-img{max-height:none;height:auto}
.cr-double-wrap{flex:1;display:flex;overflow:hidden}
.cr-double-wrap .cr-page-img{width:50%;height:100%;object-fit:contain;cursor:pointer}
.cr-strip-v{flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;gap:2rem;padding:1.5rem 1rem 3rem}
.cr-strip-page{display:flex;flex-direction:column;align-items:center;gap:.4rem;max-width:100%}
.cr-strip-label{font-size:.8rem;color:#666;font-weight:500}
.cr-strip-img{max-width:100%;height:auto;border-radius:2px;box-shadow:0 2px 12px rgba(0,0,0,.5);user-select:none;-webkit-user-drag:none}
.cr-strip-h{flex:1;overflow-x:auto;display:flex;gap:1rem;padding:1rem 1.5rem;align-items:flex-start}
.cr-strip-h-page{display:flex;flex-direction:column;align-items:center;gap:.3rem;flex-shrink:0}
.cr-strip-h-img{height:85vh;width:auto;border-radius:2px;box-shadow:0 2px 12px rgba(0,0,0,.5);user-select:none;-webkit-user-drag:none}
.cr-loading,.cr-error{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;flex:1;color:#999}
.cr-loading-spinner{width:40px;height:40px;border:3px solid #333;border-top-color:#6366f1;border-radius:50%;animation:cr-spin .6s linear infinite}
@keyframes cr-spin{to{transform:rotate(360deg)}}
.cr-error{color:#ef4444}
@media(max-width:600px){.cr-title{max-width:120px;font-size:.8rem}}
</style>
