// modules/chatbotui.js
// Chat UI: bubbles, thinking, typing effect

(function(){
  const chatArea = document.querySelector('.chat-area');
  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('userInput');

  if (!chatArea || !chatForm || !userInput) {
    console.warn('chatbotui: elements missing');
    return;
  }

  // ❗ FIX 3: xoá viền đen của textarea (vạch ở ô nhập chat)
  userInput.style.border = "1px solid transparent";
  userInput.style.outline = "none";
  userInput.style.backgroundColor = "rgba(255,255,255,0.95)";

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
  }
  userInput.addEventListener('input', () => autoResize(userInput));
  autoResize(userInput);

  // append bubble
  function appendBubble(text, sender) {
    const wrap = document.createElement('div');
    wrap.className = `chat-msg ${sender}`;
    wrap.style.whiteSpace = 'pre-wrap';

    // ❗ FIX 1 & 2: đồng bộ màu chữ + font-size + bot chữ trắng
    wrap.style.fontSize = "18px";

    if (sender === "bot") {
      wrap.style.color = "#fff";                            // bot chữ trắng
      wrap.style.background = "rgba(255,255,255,0.15)";     // nền mờ đẹp hơn
      wrap.style.backdropFilter = "blur(4px)";
    }

    wrap.textContent = text;
    chatArea.appendChild(wrap);
    chatArea.scrollTop = chatArea.scrollHeight;
    return wrap;
  }

  // thinking bubble
  function showThinking() {
    const el = document.createElement('div');
    el.className = 'chat-msg bot thinking';
    el.innerHTML = '<span class="dot">●</span><span class="dot">●</span><span class="dot">●</span>';

    // ❗ Đồng bộ màu chữ trắng cho thinking (bot bubble)
    el.style.color = "#fff";
    el.style.background = "rgba(255,255,255,0.15)";
    el.style.backdropFilter = "blur(4px)";
    el.style.fontSize = "18px";

    chatArea.appendChild(el);
    chatArea.scrollTop = chatArea.scrollHeight;
    return el;
  }

  // typewrite effect
  function typeWrite(text, cb) {
    const el = document.createElement('div');
    el.className = 'chat-msg bot';
    el.style.whiteSpace = 'pre-wrap';

    // ❗ Đồng bộ màu chữ bot + size
    el.style.color = "#fff";
    el.style.fontSize = "18px";
    el.style.background = "rgba(255,255,255,0.15)";
    el.style.backdropFilter = "blur(4px)";

    chatArea.appendChild(el);
    chatArea.scrollTop = chatArea.scrollHeight;

    let i = 0;
    const delay = 14;
    function step() {
      i++;
      el.textContent = text.slice(0,i);
      chatArea.scrollTop = chatArea.scrollHeight;
      if (i < text.length) setTimeout(step, delay);
      else if (cb) cb(el);
    }
    step();
    return el;
  }

  // submit handler
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = (userInput.value || "");
    const text = raw.trim();
    if (!text) return;

    // user bubble giữ nguyên
    appendBubble(text, 'user');

    userInput.value = "";
    autoResize(userInput);

    // thinking + reply
    const thinking = showThinking();
    const reply = (window.chatCore && window.chatCore.createReply)
      ? window.chatCore.createReply(text)
      : "Hệ thống chưa sẵn sàng.";

    const thinkMs = 300 + Math.min(1400, reply.length * 6);

    setTimeout(()=> {
      if (thinking && thinking.parentNode) thinking.parentNode.removeChild(thinking);
      typeWrite(reply);
    }, thinkMs);
  });

  window._chatUI = { appendBubble, typeWrite };
})();
