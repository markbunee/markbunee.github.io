/**
 * 彩色粒子背景（仅首页 hero 使用）
 */
(function () {
    function initParticles(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        const colors = ['#ff3333', '#ff6633', '#ffaa00', '#00ff88', '#00ccff', '#aa66ff', '#ff3366'];
        const particles = [];
        const particleCount = 200;

        function Particle() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 2 + 0.5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = Math.random() * 0.5 + 0.3;
        }

        Particle.prototype.draw = function () {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        };

        Particle.prototype.update = function () {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
        };

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = particles[i].color;
                        ctx.globalAlpha = (1 - dist / 120) * 0.15;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            }
        }

        function loop() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(function (p) {
                p.update();
                p.draw();
            });
            drawLines();
            requestAnimationFrame(loop);
        }

        window.addEventListener('resize', function () {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        });

        loop();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initParticles('particle-canvas');
        });
    } else {
        initParticles('particle-canvas');
    }
})();
