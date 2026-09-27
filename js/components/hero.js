/**
 * KIIT IEEE Platform - Interactive Hero "Event Universe"
 * 60 FPS interactive physics particle canvas and floating universe elements.
 */

export class HeroUniverse {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.mouse = { x: -1000, y: -1000, radius: 140 };
    this.animId = null;
    this.resizeObserver = null;

    this.init();
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // Mouse movement response
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    this.createNodes();
    this.animate();
  }

  handleResize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    this.width = parent ? parent.clientWidth : window.innerWidth;
    this.height = parent ? parent.clientHeight : 700;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    if (this.nodes.length > 0) {
      this.createNodes();
    }
  }

  createNodes() {
    this.nodes = [];
    const count = Math.min(Math.floor(this.width / 45), 32);

    const labels = [
      { text: "AI / ML", color: "#818cf8", size: 6, tag: true },
      { text: "Robotics", color: "#38bdf8", size: 6, tag: true },
      { text: "Copilot ⚡", color: "#c084fc", size: 7, tag: true },
      { text: "MegaHack", color: "#f43f5e", size: 6, tag: true },
      { text: "IoT / ESP32", color: "#34d399", size: 5, tag: true },
      { text: "Web3 & Cloud", color: "#60a5fa", size: 5, tag: true },
      { text: "Campus 15", color: "#fbbf24", size: 5, tag: true },
      { text: "IEEE SB", color: "#a78bfa", size: 7, tag: true }
    ];

    for (let i = 0; i < count; i++) {
      const hasLabel = i < labels.length;
      const labelObj = hasLabel ? labels[i] : null;

      this.nodes.push({
        x: Math.random() * (this.width - 100) + 50,
        y: Math.random() * (this.height - 100) + 50,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: labelObj ? labelObj.size : Math.random() * 2.5 + 1.5,
        color: labelObj ? labelObj.color : 'rgba(148, 163, 184, 0.4)',
        label: labelObj ? labelObj.text : null,
        baseX: 0,
        baseY: 0,
        glow: !!labelObj
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw connection lines between nearby nodes
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.22;
          this.ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
          this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          this.ctx.stroke();
        }
      }
    }

    // Update and draw nodes
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      // Subtle physics motion
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off walls
      if (node.x < 30 || node.x > this.width - 30) node.vx *= -1;
      if (node.y < 30 || node.y > this.height - 30) node.vy *= -1;

      // Mouse interactivity: gentle magnetic repulsion/spring
      const dx = this.mouse.x - node.x;
      const dy = this.mouse.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.mouse.radius && dist > 0) {
        const force = (this.mouse.radius - dist) / this.mouse.radius;
        const angle = Math.atan2(dy, dx);
        node.x -= Math.cos(angle) * force * 3;
        node.y -= Math.sin(angle) * force * 3;
      }

      // Draw node circle
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = node.color;
      this.ctx.fill();

      // Outer glow for key nodes
      if (node.glow) {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
        this.ctx.fillStyle = node.color.replace(')', ', 0.15)').replace('rgb', 'rgba');
        this.ctx.fill();
      }

      // Draw floating badge label if present
      if (node.label) {
        this.ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        const textWidth = this.ctx.measureText(node.label).width;
        const boxX = node.x - textWidth / 2 - 8;
        const boxY = node.y - node.radius - 22;

        // Pill background
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.roundRect(boxX, boxY, textWidth + 16, 20, 10);
        this.ctx.fill();
        this.ctx.stroke();

        // Label text
        this.ctx.fillStyle = node.color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.label, node.x, boxY + 10);
      }
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }
}
