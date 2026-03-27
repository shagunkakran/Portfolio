const App = {
    init() {
        this.theme.init();
        this.threeBg.init();
        this.gsap.init();
        this.api.init();
        this.projects.init();
        this.experience.init();
        this.contactForm.init();
    },

    theme: {
        init() {
            if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage))) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            const toggle = document.getElementById('theme-toggle');
            this.sunIcon = document.getElementById('theme-icon-sun');
            this.moonIcon = document.getElementById('theme-icon-moon');
            if(toggle) toggle.addEventListener('click', () => this.toggle());
            this.updateIcons();
        },
        toggle() {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            this.updateIcons();
            if(App.threeBg) App.threeBg.updateColors(); 
        },
        updateIcons() {
            const isDark = document.documentElement.classList.contains('dark');
            if(this.sunIcon) this.sunIcon.classList.toggle('hidden', isDark);
            if(this.moonIcon) this.moonIcon.classList.toggle('hidden', !isDark);
        }
    },

    threeBg: {
        init() {
            this.container = document.getElementById('three-bg');
            if (!this.container) return;
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ alpha: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.container.appendChild(this.renderer.domElement);
            this.camera.position.z = 5;
            this.mouse = new THREE.Vector2();
            this.createParticles();
            this.updateColors();
            this.animate();
            window.addEventListener('resize', () => this.onWindowResize());
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        },
        createParticles() {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(8000 * 3);
            for (let i = 0; i < 15000; i++) positions[i] = (Math.random() - 0.5) * 10;
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.material = new THREE.PointsMaterial({ size: 0.010, color: 0xDB2777, transparent: true, opacity: 1 });
            this.points = new THREE.Points(geometry, this.material);
            this.scene.add(this.points);
        },
        updateColors() {
            if (!this.material) return;
            const isDark = document.documentElement.classList.contains('dark');
            // Light: Pinkish (#DB2777), Dark: Lavender (#D8B4FE)
            this.material.color.set(isDark ? 0xD8B4FE : 0xDB2777);
        },
        animate() {
            requestAnimationFrame(() => this.animate());
            this.points.rotation.x += 0.0002;
            this.points.rotation.y += 0.0002;
            this.renderer.render(this.scene, this.camera);
        },
        onWindowResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        },
        onMouseMove(event) {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    },

    gsap: {
        init() {
            gsap.registerPlugin(ScrollTrigger);
            document.querySelectorAll('.gsap-reveal').forEach(el => {
                gsap.from(el, {
                    scrollTrigger: { trigger: el, start: "top 90%" },
                    opacity: 0, y: 30, duration: 0.8, ease: "power2.out"
                });
            });
        }
    },

    api: {
        init() { this.getGitHubStats(); },
        async getGitHubStats() {
            const reposEl = document.getElementById('github-repos');
            const followersEl = document.getElementById('github-followers');
            try {
                const response = await fetch('https://api.github.com/users/shagunkakran');
                const data = await response.json();
                if(reposEl) reposEl.textContent = data.public_repos || '0';
                if(followersEl) followersEl.textContent = data.followers || '0';
            } catch (e) { console.error(e); }
        }
    },

    projects: {
        init() {
            this.container = document.getElementById('project-grid');
            this.filtersContainer = document.getElementById('project-filters');
             this.data = [
                { title: "MindSage", description: "AI-powered content analysis platform.", category: "AI", github: "https://github.com/shagunkakran/demo1",
    live: "https://shagunkakran.github.io/demo1/" },
                 { title: "SkillSwap", description: "Interactive skill exchange platform.", category: "JS", github: "https://github.com/shagunkakran/SkillSwap",
    live: "#" },
                 { title: "Astroverse", description: "AR/VR based gameplay.", category: "AR/VR", github: "#",
    live: "#"  }
             ];
           
            this.renderFilters();
            this.renderProjects('all');
        },
        renderFilters() {
            const cats = ['all', ...new Set(this.data.map(p => p.category))];
            this.filtersContainer.innerHTML = cats.map(c => `
                <button class="filter-btn text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-pink-100 dark:border-purple-900 ${c === 'all' ? 'active' : ''}" data-filter="${c}">${c}</button>
            `).join('');
            this.filtersContainer.addEventListener('click', e => {
                if (e.target.closest('.filter-btn')) {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.renderProjects(e.target.dataset.filter);
                }
            });
        },
        renderProjects(filter) {
            const items = filter === 'all' ? this.data : this.data.filter(p => p.category === filter);
            this.container.innerHTML = items.map(p => `
                <div class="project-card card rounded-2xl p-6 group cursor-pointer">
                    <div class="flex justify-between items-start mb-4">
                        <span class="text-xs font-bold text-pink-600 dark:text-lavender-400 uppercase">${p.category}</span>
                        <div class="h-2 w-2 rounded-full bg-pink-400 animate-pulse"></div>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800 dark:text-white group-hover:text-pink-600 transition-colors">${p.title}</h3>
                    <p class="mt-2 text-slate-600 dark:text-pink-100/70 text-sm">${p.description}</p>
                    <div class="mt-4 flex gap-4">
  <a href="${p.github}" target="_blank" 
     class="text-sm font-bold text-pink-600 hover:underline">
     🔗 GitHub
  </a>

  <a href="${p.live}" target="_blank" 
     class="text-sm font-bold text-pink-600 hover:underline">
     🚀 Live
  </a>
</div>
                </div>
            `).join('');
        }
    },

    experience: {
        init() {
            const container = document.getElementById('experience-container');
            const experiences = [
                 { date: "January 2026 - Present", title: "AI Foundations Associate", company: "Oracle", desc: "Acquired comprehensive knowledge of Artificial Intelligence and Machine Learning principles using Oracle Cloud Infrastructure. Explored Generative AI applications and large language model (LLM) fundamentals." },
                { date: "November 2025 - Present", title: "AR/VR Immersive Technologies Trainee", company: "Aalgorix", desc: "Developing expertise in Augmented and Virtual Reality technologies to create immersive digital experiences. Designing interactive 3D environments and understanding AR/VR integration in enterprise solutions." },
                { date: "June 2025 - Present", title: "Cybersecurity foundation & cloud security fundamentals certification", company: "PaloAlto Networks Cybersecurity Academy", desc: "Mastered core concepts of network security, threat prevention, and cloud infrastructure protection. Gained practical insights into securing cloud environments." }
            ];
            container.innerHTML = `
                <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-pink-100 dark:bg-purple-900/40"></div>
                <div class="space-y-10">
                    ${experiences.map(exp => `
                        <div class="relative pl-12">
                            <div class="absolute left-4 top-2 -translate-x-1/2 w-3 h-3 rounded-full bg-pink-600 dark:bg-lavender-400 ring-4 ring-pink-50 dark:ring-purple-900/20"></div>
                            <span class="text-xs font-bold text-pink-500">${exp.date}</span>
                            <h3 class="text-lg font-bold text-slate-800 dark:text-white">${exp.title}</h3>
                            <p class="text-sm text-slate-500 dark:text-lavender-300/60">${exp.company}</p>
                            <p class="mt-2 text-slate-600 dark:text-pink-100/80 text-sm">${exp.desc}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    },

  
    contactForm: {
    init() {
        this.form = document.getElementById('contact-form');
        this.toast = document.getElementById('toast-notification');
        
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = this.form.querySelector('button');
            const originalBtnText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            // Form data ko collect karna
            const formData = new FormData(this.form);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            try {
                // Ab ye seedha Web3Forms par jayega, server.js ki zaroorat nahi
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });

                const result = await response.json();

                if (response.status === 200) {
                    this.showToast('Message sent to Shagun!', true);
                    this.form.reset(); // Form khali kar dega
                } else {
                    this.showToast('Error: ' + result.message, false);
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                this.showToast('Network Error! Please try again.', false);
            } finally {
                btn.textContent = originalBtnText;
                btn.disabled = false;
            }
        });
    },

    showToast(msg, ok) {
        if (!this.toast) return;
        this.toast.textContent = msg;
        // Styling for toast
        this.toast.className = `toast p-4 rounded-xl shadow-2xl text-white fixed bottom-10 right-10 z-50 transition-all duration-500 transform translate-y-0 opacity-100 ${ok ? 'bg-pink-600' : 'bg-red-500'}`;
        
        setTimeout(() => {
            this.toast.className = 'toast fixed bottom-10 right-10 translate-y-20 opacity-0 pointer-events-none';
        }, 5000);
    }
},
        
};

App.init();
