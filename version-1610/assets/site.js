import { H as Hls } from "./hls-vendor-dru42stk.js";

const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (header) {
    const setHeader = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 20);
    };
    setHeader();
    window.addEventListener("scroll", setHeader, { passive: true });
}

if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
        mobileNav.classList.toggle("is-open");
    });
}

const hero = document.querySelector("[data-hero]");
if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let active = 0;
    const show = (index) => {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === active);
        });
    };
    dots.forEach((dot) => {
        dot.addEventListener("click", () => show(Number(dot.dataset.heroDot)));
    });
    if (slides.length > 1) {
        window.setInterval(() => show(active + 1), 5200);
    }
}

const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q") || "";
const searchPanel = document.querySelector("[data-search-panel]");
if (searchPanel) {
    const input = searchPanel.querySelector("[data-search-input]");
    const clear = searchPanel.querySelector("[data-search-clear]");
    const category = searchPanel.querySelector("[data-filter-category]");
    const year = searchPanel.querySelector("[data-filter-year]");
    const type = searchPanel.querySelector("[data-filter-type]");
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    const note = document.querySelector("[data-search-note]");

    if (input) {
        input.value = initialQuery;
    }

    const normalize = (value) => String(value || "").trim().toLowerCase();
    const filter = () => {
        const q = normalize(input ? input.value : "");
        const c = category ? category.value : "";
        const y = year ? year.value : "";
        const t = type ? type.value : "";
        let visible = 0;
        cards.forEach((card) => {
            const text = normalize(card.dataset.search);
            const okQuery = !q || text.includes(q);
            const okCategory = !c || card.dataset.category === c;
            const okYear = !y || card.dataset.year === y;
            const okType = !t || card.dataset.type === t;
            const ok = okQuery && okCategory && okYear && okType;
            card.hidden = !ok;
            if (ok) {
                visible += 1;
            }
        });
        if (note) {
            note.textContent = visible > 0 ? "已显示匹配影片，点击卡片进入播放详情。" : "没有找到匹配内容，请调整关键词或筛选条件。";
        }
    };

    [input, category, year, type].filter(Boolean).forEach((el) => {
        el.addEventListener("input", filter);
        el.addEventListener("change", filter);
    });

    if (clear) {
        clear.addEventListener("click", () => {
            if (input) {
                input.value = "";
            }
            if (category) {
                category.value = "";
            }
            if (year) {
                year.value = "";
            }
            if (type) {
                type.value = "";
            }
            filter();
        });
    }

    filter();
}

const initPlayer = (shell) => {
    const video = shell.querySelector("video");
    const button = shell.querySelector("[data-play-button]");
    const message = shell.querySelector("[data-player-message]");
    let hls = null;
    let prepared = false;

    if (!video) {
        return;
    }

    const showMessage = (text) => {
        if (message) {
            message.textContent = text;
            message.hidden = false;
        }
    };

    const prepare = () => {
        if (prepared) {
            return;
        }
        const src = video.dataset.src;
        if (!src) {
            showMessage("当前视频暂时无法加载。");
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            prepared = true;
            return;
        }
        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    showMessage("网络加载异常，播放器正在重新连接。");
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    showMessage("媒体加载异常，播放器正在恢复。");
                    hls.recoverMediaError();
                } else {
                    showMessage("当前视频暂时无法播放。");
                    hls.destroy();
                }
            });
            prepared = true;
        } else {
            showMessage("当前浏览器不支持 HLS 播放。");
        }
    };

    const play = () => {
        prepare();
        shell.classList.add("is-playing");
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(() => {
                shell.classList.remove("is-playing");
                showMessage("点击视频控件可继续播放。");
            });
        }
    };

    if (button) {
        button.addEventListener("click", play);
    }
    video.addEventListener("click", () => {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", () => shell.classList.add("is-playing"));
    video.addEventListener("pause", () => shell.classList.remove("is-playing"));
    window.addEventListener("beforeunload", () => {
        if (hls) {
            hls.destroy();
        }
    });
};

document.querySelectorAll("[data-player]").forEach(initPlayer);
