/* Simple SPA behavior + menu toggle + demo send */

const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuToggle = document.getElementById('menu-toggle');
const closeBtn = document.getElementById('sidebar-close');
const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
const sections = Array.from(document.querySelectorAll('.page-section'));
const appRoot = document.getElementById('app');

function openSidebar(){
  sidebar.classList.add('open'); 
  document.documentElement.classList.add('app-sidebar-open');
  overlay.style.opacity = '1';
}
function closeSidebar(){
  sidebar.classList.remove('open');
  document.documentElement.classList.remove('app-sidebar-open');
  overlay.style.opacity = '0';
}

menuToggle.addEventListener('click', () => {
  if (sidebar.classList.contains('open')) closeSidebar();
  else openSidebar();
});
closeBtn.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// navigation between sections (single-page)
navButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    navButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const page = btn.dataset.page;
    sections.forEach(s => {
      if (s.id === page) s.classList.add('active');
      else s.classList.remove('active');
    });
    closeSidebar();
  });
});

/* ===========================================
   CHAT SYSTEM — CHỈ HOẠT ĐỘNG Ở TRANG CÓ CHAT
   =========================================== */

const chatArea = document.querySelector('.chat-area');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');


       

function addMessage(text, sender) {
    if (!chatArea) return; // bảo vệ an toàn
    const msg = document.createElement('div');
    msg.classList.add('chat-msg', sender);
    msg.textContent = text;
    chatArea.appendChild(msg);

    chatArea.scrollTop = chatArea.scrollHeight;
}

// accessibility: close menu with Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

function autoResizeTextarea(textarea) {
    textarea.style.height = "auto"; 
    textarea.style.height = textarea.scrollHeight + "px";
}

document.querySelectorAll("textarea").forEach((ta) => {
    ta.addEventListener("input", () => autoResizeTextarea(ta));
    autoResizeTextarea(ta);
});
