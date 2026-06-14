/* ========================================
   PARTICLES BACKGROUND
   ======================================== */
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 15000), 80);
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.4 + 0.1,
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, i) => {
            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(162, 155, 254, ${p.opacity})`;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(108, 92, 231, ${0.08 * (1 - dist / 120)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }

            // Mouse interaction
            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    p.vx += (dx / dist) * force * 0.02;
                    p.vy += (dy / dist) * force * 0.02;
                }
            }

            // Dampen velocity
            p.vx *= 0.999;
            p.vy *= 0.999;
        });

        requestAnimationFrame(() => this.animate());
    }
}

/* ========================================
   NAVBAR
   ======================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const links = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[data-section="${id}"]`);
            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    links.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });
}

/* ========================================
   CAREER DATA & DYNAMIC CALCULATIONS
   ======================================== */
const CAREER_DATA = [
    { company: '씨엔티테크', start: new Date(2013, 8, 1), end: new Date(2016, 3, 30) },   // 2013.09 ~ 2016.04
    { company: 'CJ메조미디어', start: new Date(2016, 4, 1), end: new Date(2021, 7, 31) }, // 2016.05 ~ 2021.08
    { company: '클리오', start: new Date(2021, 7, 1), end: null },                         // 2021.08 ~ 현재
];

function calcMonthDiff(startDate, endDate) {
    const end = endDate || new Date();
    let months = (end.getFullYear() - startDate.getFullYear()) * 12;
    months += end.getMonth() - startDate.getMonth();
    if (end.getDate() < startDate.getDate()) months--;
    return Math.max(months, 0);
}

function getCareerStats() {
    const now = new Date();
    // 총 경력: 첫 입사일부터 오늘까지
    const totalMonths = calcMonthDiff(CAREER_DATA[0].start, now);
    const totalYears = Math.floor(totalMonths / 12);
    const totalRemainMonths = totalMonths % 12;

    // 회사 수
    const companyCount = CAREER_DATA.length;

    // 평균 근속년수
    let totalTenureMonths = 0;
    CAREER_DATA.forEach(c => {
        totalTenureMonths += calcMonthDiff(c.start, c.end || now);
    });
    const avgTenureMonths = Math.round(totalTenureMonths / companyCount);
    const avgYears = Math.floor(avgTenureMonths / 12);
    const avgRemainMonths = avgTenureMonths % 12;

    return {
        totalYears, totalRemainMonths, totalMonths,
        companyCount,
        avgYears, avgRemainMonths, avgTenureMonths
    };
}

function animateNumber(element, target, duration = 2000) {
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function initCareerStats() {
    const stats = getCareerStats();
    let started = false;

    function applyStats() {
        if (started) return;
        started = true;

        // Hero Stats - 총 경력
        const totalCareerEl = document.getElementById('stat-total-career');
        const totalCareerUnitEl = document.getElementById('stat-total-career-unit');
        if (totalCareerEl) {
            animateNumber(totalCareerEl, stats.totalYears);
            if (totalCareerUnitEl) {
                totalCareerUnitEl.textContent = `년 ${stats.totalRemainMonths}개월`;
            }
        }

        // Hero Stats - 재직 경험
        const companiesEl = document.getElementById('stat-companies');
        if (companiesEl) {
            animateNumber(companiesEl, stats.companyCount, 1000);
        }

        // Hero Stats - 평균 근속년수
        const avgTenureEl = document.getElementById('stat-avg-tenure');
        const avgTenureUnitEl = document.getElementById('stat-avg-tenure-unit');
        if (avgTenureEl) {
            animateNumber(avgTenureEl, stats.avgYears);
            if (avgTenureUnitEl) {
                avgTenureUnitEl.textContent = `년 ${stats.avgRemainMonths}개월`;
            }
        }

        // Hero description 텍스트
        const careerTextEl = document.getElementById('career-years-text');
        if (careerTextEl) {
            careerTextEl.textContent = `${stats.totalYears}년 ${stats.totalRemainMonths}개월`;
        }

        // Experience section subtitle
        const expSubtitle = document.getElementById('experience-subtitle');
        if (expSubtitle) {
            expSubtitle.textContent = `총 경력 ${stats.totalYears}년 ${stats.totalRemainMonths}개월 (${new Date().toLocaleDateString('ko-KR')} 기준)`;
        }
    }

    // Animate when hero-stats comes into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                applyStats();
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) observer.observe(heroStats);

    // Also update the text-based elements immediately (no animation needed)
    const careerTextEl = document.getElementById('career-years-text');
    if (careerTextEl) {
        careerTextEl.textContent = `${stats.totalYears}년 ${stats.totalRemainMonths}개월`;
    }
    const expSubtitle = document.getElementById('experience-subtitle');
    if (expSubtitle) {
        expSubtitle.textContent = `총 경력 ${stats.totalYears}년 ${stats.totalRemainMonths}개월 (${new Date().toLocaleDateString('ko-KR')} 기준)`;
    }
}

/* ========================================
   SCROLL REVEAL
   ======================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.about-card, .skill-card, .timeline-item, .achievement-card, .edu-card, .contact-card, .showcase-main, .showcase-secondary'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animation
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/* ========================================
   SMOOTH SCROLL
   ======================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ========================================
   TYPING EFFECT FOR CODE CARD
   ======================================== */
function initCodeTyping() {
    const codeBlock = document.querySelector('.card-code code');
    if (!codeBlock) return;

    const fullHTML = codeBlock.innerHTML;
    codeBlock.innerHTML = '';
    codeBlock.style.visibility = 'visible';

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typeCode(codeBlock, fullHTML);
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });

    observer.observe(codeBlock);
}

function typeCode(element, html) {
    let i = 0;
    let isTag = false;
    let buffer = '';
    const speed = 8;

    function type() {
        if (i < html.length) {
            const char = html[i];
            
            if (char === '<') {
                isTag = true;
            }

            buffer += char;

            if (char === '>' && isTag) {
                isTag = false;
            }

            if (!isTag) {
                element.innerHTML = buffer;
            }

            i++;
            setTimeout(type, isTag ? 0 : speed);
        }
    }

    type();
}

/* ========================================
   동적 기간 계산 (data-duration)
   ========================================
   [RULE] HTML에서 기간(X년 Y개월)을 표시할 때는 하드코딩하지 않고,
   아래 data 속성을 가진 <span>을 사용합니다.
   
   사용법:
     <span class="dynamic-duration"
           data-duration-start="YYYY-MM"
           data-duration-end="YYYY-MM">   ← 생략 시 오늘 기준
     </span>
   
   이 함수가 자동으로 "X년 Y개월" 텍스트를 채웁니다.
   ======================================== */
function initDynamicDurations() {
    const elements = document.querySelectorAll('.dynamic-duration[data-duration-start]');

    elements.forEach(el => {
        const startParts = el.dataset.durationStart.split('-');
        const startDate = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, 1);

        let endDate = new Date();
        if (el.dataset.durationEnd) {
            const endParts = el.dataset.durationEnd.split('-');
            endDate = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, 1);
        }

        const months = calcMonthDiff(startDate, endDate);
        const years = Math.floor(months / 12);
        const remainMonths = months % 12;

        if (years > 0 && remainMonths > 0) {
            el.textContent = `${years}년 ${remainMonths}개월`;
        } else if (years > 0) {
            el.textContent = `${years}년`;
        } else {
            el.textContent = `${remainMonths}개월`;
        }
    });
}

/* ========================================
   LIGHTBOX (이미지 클릭 시 크게 보기)
   ======================================== */
function initLightbox() {
    const overlay = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close');

    if (!overlay) return;

    // 모든 갤러리 이미지와 스킬 이미지에 클릭 이벤트 추가
    const clickableImages = document.querySelectorAll('.gallery-item img, .skill-image, .profile-photo');
    clickableImages.forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            // 캡션: gallery-caption이 있으면 사용, 없으면 alt 텍스트
            const caption = img.parentElement.querySelector('.gallery-caption');
            lightboxCaption.textContent = caption ? caption.textContent : img.alt;
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // 닫기: X 버튼, 배경 클릭, ESC 키
    function closeLightbox() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

/* ========================================
   INITIALIZE
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Particles
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        new ParticleSystem(canvas);
    }

    // Components
    initNavbar();
    initCareerStats();
    initDynamicDurations();
    initScrollReveal();
    initSmoothScroll();
    initCodeTyping();
    initLightbox();
});
