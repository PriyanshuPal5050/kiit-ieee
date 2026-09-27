/**
 * KIIT IEEE Platform - AI Workshop Copilot View
 * Context-aware intelligent technical teammate with streaming responses, code formatting, and lab troubleshooting.
 */

import { store } from '../state.js';
import { AIService } from '../services/ai-service.js';
import { sound } from '../services/audio-service.js';
import { toast } from '../components/toast.js';

export class CopilotView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedEventId = store.events[0]?.id;
    this.messages = [
      {
        sender: 'copilot',
        text: `### ⚡ Welcome to KIIT IEEE Workshop Copilot!

I am your 24/7 technical teammate for campus workshops, hackathons, and hardware labs. 

I can assist you with:
* **Hardware & Drivers:** ESP32 COM port binding, sensor wiring, baud rate issues
* **AI & Neural Networks:** PyTorch CUDA OOM, YOLO quantization, TensorRT pipelines
* **Full-Stack & Cloud:** Next.js 15 server actions, Docker containers, API integration
* **Lab Submissions:** Capstone code formatting, git branch merging, and verification

What are you building or troubleshooting today?`,
        reasoning: "Initialized session with active context loaded from KIIT IEEE technical curriculum.",
        references: ["KIIT IEEE Lab Handbook 2026", "Hardware Starter Kit Documentation"],
        timestamp: 'Just now'
      }
    ];
    this.isStreaming = false;
  }

  render() {
    if (!this.container) return;
    const currentEvent = store.events.find(e => e.id === this.selectedEventId) || store.events[0];

    const suggestedPrompts = [
      "My ESP32 is not detected in COM port",
      "CUDA out of memory in PyTorch training loop",
      "Fix Git SSH permission denied on campus Wi-Fi",
      "Explain the Capstone project submission requirements",
      "How do I quantize a YOLOv11 model for Jetson Nano?"
    ];

    this.container.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-6">
        
        <!-- Header & Context Selector -->
        <div class="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-indigo-500/30">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
              <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
                🤖
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-black text-white">Workshop Copilot</h1>
                <span class="live-pulse"></span>
                <span class="text-[10px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">AI ACTIVE</span>
              </div>
              <p class="text-xs text-slate-400">Contextualized for: <span class="text-indigo-300 font-semibold">${currentEvent.title}</span></p>
            </div>
          </div>

          <!-- Event Context Dropdown & Settings -->
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <select id="copilot-context-select" class="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 flex-1 sm:flex-none">
              ${store.events.map(evt => `
                <option value="${evt.id}" ${evt.id === this.selectedEventId ? 'selected' : ''}>
                  ${evt.title.slice(0, 32)}...
                </option>
              `).join('')}
            </select>

            <button id="btn-copilot-settings" class="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-colors" title="AI Settings / API Key">
              ⚙️
            </button>
          </div>
        </div>

        <!-- Suggested Prompt Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span class="text-[11px] uppercase font-bold text-slate-400 shrink-0">Try asking:</span>
          ${suggestedPrompts.map(p => `
            <button class="btn-prompt-pill shrink-0 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-indigo-950/50 border border-white/10 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-all btn-press" data-prompt="${p}">
              ${p}
            </button>
          `).join('')}
        </div>

        <!-- Chat Conversation Area -->
        <div class="glass-panel rounded-3xl border border-white/10 overflow-hidden flex flex-col h-[560px] shadow-2xl">
          
          <!-- Messages Thread Container -->
          <div id="copilot-thread" class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 no-scrollbar">
            ${this.messages.map(m => this.renderMessage(m)).join('')}
          </div>

          <!-- Bottom Input & Attachment Bar -->
          <div class="p-4 bg-slate-950/80 border-t border-white/10 space-y-2">
            <div id="attached-file-preview" class="hidden text-xs text-indigo-300 flex items-center justify-between px-3 py-1.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
              <span id="attached-file-name">📎 Attached log file</span>
              <button id="btn-remove-attachment" class="text-slate-400 hover:text-white">✕</button>
            </div>

            <div class="flex items-end gap-2">
              <!-- File Attach Simulator -->
              <button id="btn-attach-file" class="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors shrink-0 btn-press" title="Attach terminal log or code snippet">
                📎
              </button>

              <!-- Textarea / Input -->
              <div class="flex-1 relative">
                <textarea 
                  id="copilot-input" 
                  rows="1" 
                  placeholder="Ask a technical question, paste a terminal error, or ask about lab deliverables..." 
                  class="w-full bg-slate-900/90 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none max-h-32"
                ></textarea>
              </div>

              <!-- Send Button -->
              <button id="btn-copilot-send" class="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold transition-all shadow-lg shadow-indigo-500/25 shrink-0 btn-press">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
              <span>Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for newline</span>
              <button id="btn-copilot-dispatch" class="text-rose-400 hover:text-rose-300 font-semibold transition-colors">
                Still stuck? Dispatch Bench Volunteer 🚨
              </button>
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();
    this.scrollToBottom();
  }

  renderMessage(msg) {
    const isUser = msg.sender === 'user';

    return `
      <div class="flex items-start gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}">
        ${!isUser ? `
          <div class="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-sm shrink-0">
            🤖
          </div>
        ` : ''}

        <div class="max-w-[85%] sm:max-w-[80%] space-y-2">
          <div class="p-4 sm:p-5 rounded-2xl leading-relaxed text-xs sm:text-sm ${isUser ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20' : 'bg-slate-900/90 text-slate-200 border border-white/10 rounded-tl-none'}">
            ${this.formatMarkdown(msg.text)}
          </div>

          ${!isUser && msg.reasoning ? `
            <details class="text-[11px] text-slate-400 bg-white/[0.02] border border-white/5 rounded-xl p-2.5 cursor-pointer">
              <summary class="font-semibold text-indigo-300 hover:text-indigo-200">🔍 Technical Reasoning & Trace</summary>
              <p class="mt-2 text-slate-300 leading-relaxed">${msg.reasoning}</p>
              ${msg.references ? `
                <div class="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-1">
                  ${msg.references.map(r => `<span class="px-2 py-0.5 rounded bg-white/5 text-[10px] text-cyan-300 font-mono">${r}</span>`).join('')}
                </div>
              ` : ''}
            </details>
          ` : ''}
        </div>

        ${isUser ? `
          <img src="${store.user.avatar}" class="w-8 h-8 rounded-xl object-cover border border-white/10 shrink-0" />
        ` : ''}
      </div>
    `;
  }

  formatMarkdown(str) {
    if (!str) return '';
    let html = str;

    // Headers
    html = html.replace(/### (.*?)\n/g, '<h4 class="text-sm font-bold text-white mt-2 mb-1">$1</h4>');
    html = html.replace(/## (.*?)\n/g, '<h3 class="text-base font-black text-white mt-3 mb-1.5">$1</h3>');

    // Code blocks
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, (match, lang, code) => {
      const escaped = code.trim();
      return `
        <div class="relative my-3 rounded-xl bg-slate-950 border border-white/10 overflow-hidden font-mono text-xs">
          <div class="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10 text-[10px] text-slate-400">
            <span>${lang || 'code'}</span>
            <button class="btn-copy-code px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition-colors" data-code="${encodeURIComponent(escaped)}">
              Copy
            </button>
          </div>
          <pre class="p-3 overflow-x-auto text-emerald-400"><code>${escaped.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>
      `;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 font-mono text-[11px]">$1</code>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

    // Line breaks
    html = html.replace(/\n\n/g, '<br/><br/>');

    return html;
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      const thread = this.container.querySelector('#copilot-thread');
      if (thread) {
        thread.scrollTop = thread.scrollHeight;
      }
    });
  }

  bindEvents() {
    const input = this.container.querySelector('#copilot-input');
    const sendBtn = this.container.querySelector('#btn-copilot-send');
    const contextSelect = this.container.querySelector('#copilot-context-select');

    // Context Change
    if (contextSelect) {
      contextSelect.addEventListener('change', () => {
        this.selectedEventId = contextSelect.value;
        const evt = store.events.find(e => e.id === this.selectedEventId);
        sound.playClick();
        toast.show({ title: 'Context Switched', message: `Copilot is now tuned to "${evt?.title}".`, type: 'info' });
        this.render();
      });
    }

    // Suggested prompt pills
    this.container.querySelectorAll('.btn-prompt-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.getAttribute('data-prompt');
        sound.playClick();
        if (input) {
          input.value = p;
          this.handleSendMessage();
        }
      });
    });

    // Send button
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        this.handleSendMessage();
      });
    }

    // Keydown in input
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    // Copy Code button handlers
    this.container.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = decodeURIComponent(btn.getAttribute('data-code'));
        navigator.clipboard.writeText(code);
        sound.playClick();
        btn.textContent = 'Copied ✓';
        setTimeout(() => btn.textContent = 'Copy', 2000);
        toast.show({ title: 'Code Copied', message: 'Code copied to clipboard.', type: 'success' });
      });
    });

    // File attach simulator
    const attachBtn = this.container.querySelector('#btn-attach-file');
    const attachPreview = this.container.querySelector('#attached-file-preview');
    const removeAttach = this.container.querySelector('#btn-remove-attachment');

    if (attachBtn && attachPreview) {
      attachBtn.addEventListener('click', () => {
        sound.playClick();
        attachPreview.classList.remove('hidden');
        toast.show({ title: 'Attachment Added', message: 'Simulated terminal diagnostic log attached.', type: 'info' });
      });
    }

    if (removeAttach && attachPreview) {
      removeAttach.addEventListener('click', () => {
        attachPreview.classList.add('hidden');
      });
    }

    // Dispatch bench volunteer
    const dispatchBtn = this.container.querySelector('#btn-copilot-dispatch');
    if (dispatchBtn) {
      dispatchBtn.addEventListener('click', () => {
        sound.playClick();
        window.appDispatcher?.openVolunteerModal();
      });
    }

    // Settings / API Key modal prompt
    const settingsBtn = this.container.querySelector('#btn-copilot-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        const currentKey = AIService.getApiKey();
        const entered = prompt("Enter your Google Gemini API Key for live cloud intelligence (optional - leave blank to use the built-in Copilot simulation engine):", currentKey);
        if (entered !== null) {
          AIService.setApiKey(entered.trim());
          toast.show({
            title: 'AI Settings Updated',
            message: entered.trim() ? 'Connected to live Gemini API!' : 'Switched to built-in offline engine.',
            type: 'success'
          });
        }
      });
    }
  }

  async handleSendMessage() {
    const input = this.container.querySelector('#copilot-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text || this.isStreaming) return;

    input.value = '';
    sound.playClick();

    // Append user message
    this.messages.push({
      sender: 'user',
      text: text,
      timestamp: 'Just now'
    });

    // Create empty copilot message placeholder
    const copilotMsg = {
      sender: 'copilot',
      text: 'Analyzing technical context...',
      reasoning: 'Synthesizing hardware and software environment...',
      references: [],
      timestamp: 'Just now'
    };
    this.messages.push(copilotMsg);
    this.isStreaming = true;
    this.render();

    const currentEvent = store.events.find(e => e.id === this.selectedEventId);

    // Stream response
    try {
      const result = await AIService.askCopilot(text, currentEvent, (chunk) => {
        copilotMsg.text = chunk;
        const thread = this.container.querySelector('#copilot-thread');
        if (thread) {
          const lastMsgBox = thread.lastElementChild?.querySelector('.p-4');
          if (lastMsgBox) {
            lastMsgBox.innerHTML = this.formatMarkdown(chunk);
          }
          thread.scrollTop = thread.scrollHeight;
        }
      });

      copilotMsg.text = result.text;
      copilotMsg.reasoning = result.reasoning;
      copilotMsg.references = result.references;
      sound.playBeep();
    } catch (err) {
      copilotMsg.text = "Error generating response. Please check your internet connection or API settings.";
      sound.playError();
    } finally {
      this.isStreaming = false;
      this.render();
    }
  }
}
