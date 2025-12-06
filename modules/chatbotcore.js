// modules/chatbotcore.js
// core processing: normalize, match, handlers

function normalize(s) {
  if (!s) return "";
  try {
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch(e){}
  return s.replace(/[^a-zA-Z0-9\s]/g, " ").toLowerCase().trim();
}

// ⭐ ƯU TIÊN: MATCH CÂU GIAO TIẾP TỰ NHIÊN TRƯỚC
function checkNaturalTalk(t) {
  const patterns = [
    { keys:["hi","hello","xin chao","chao"], ans:"Chào bạn! Mình ở đây sẵn sàng hỗ trợ bạn học sử nè :>" },
    { keys:["ban khoe khong","khoe khong","ổn không","sao rồi","how are you"], ans:"Mình ổn nè! Cảm ơn bạn đã hỏi. Bạn học tới phần nào rồi?" },
    { keys:["met","mệt","đuối","oải"], ans:"Nghe có vẻ bạn hơi mệt đó… nghỉ xíu rồi mình học tiếp nha, mình ở đây hỗ trợ bạn." },
    { keys:["ten gi","ban ten gi","your name"], ans:"Mình là HistoBot — trợ lý AI lịch sử của bạn! Rất vui được đồng hành với bạn luôn :3" },
    { keys:["cam on","cảm ơn","thank"], ans:"Không có chi nè! Học sử cùng bạn vui mà :>" },
    { keys:["sorry","xin loi","xin lỗi"], ans:"Không sao đâu, bạn không cần xin lỗi đâu nè :3" },
    { keys:["bro","ủa","hả","ơ"], ans:"Có vẻ bạn đang thắc mắc gì đúng không? Bạn thử nói rõ hơn để mình giúp nhanh hơn nha!" },
    { keys:["ok","oke","uk","được rồi"], ans:"Okii luôn! Bạn muốn tìm hiểu tiếp phần nào nè?" },
    { keys:["buon","vui","haha","lol"], ans:"Nghe dễ thương á, nhưng mà nhớ mình vẫn đang đồng hành học sử với bạn nhen :>" }
  ];

  for (const p of patterns) {
    for (const k of p.keys) {
      if (t.includes(k)) return p.ans;
    }
  }
  return null;
}

function findBestMatch(userText) {
  const t = normalize(userText);
  const tok = t.split(/\s+/).filter(Boolean);
  let best = null, bestScore = 0;

  for (const item of (window.CHATBOT_DB || [])) {

    // ⭐ FIX QUAN TRỌNG: tránh lỗi undefined khi item.keywords không tồn tại
    if (!item || !Array.isArray(item.keywords)) continue;

    let score = 0;

    for (const k of item.keywords) {
      const nk = normalize(k);
      if (!nk) continue;
      if (t.includes(nk)) score += 3;

      for (const tk of tok) {
        if (nk.includes(tk) || tk.includes(nk)) score += 0.5;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return { item: best, score: bestScore };
}


// summary handler
function getSummary(topic, mode) {
  const { item } = findBestMatch(topic);
  if (!item) return "Không tìm thấy chủ đề để tóm tắt. Ví dụ: 'tóm tắt: liên xô'.";
  if (mode === "short") {
    const short = item.answer.split(".").slice(0,2).join(".") + ".";
    return `Tóm tắt ngắn (${item.title}): ${short}`;
  } else {
    return `Tóm tắt chi tiết (${item.title}): ${item.answer}`;
  }
}

// quiz generator
function generateQuiz(count) {
  const pool = window.QUIZ_DB || [];
  if (!pool.length) return [];
  const shuffled = pool.slice().sort(()=>0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, pool.length));
  window._LAST_QUIZ = selected;
  return selected;
}

// timeline lookup
function getTimeline(year) {
  const map = {
    "1917": "1917 — Cách mạng Tháng Mười ở Nga: Bôn-sê-vích nắm chính quyền, đặt nền móng cho Nhà nước Xô viết.",
    "1922": "1922 — Liên Xô chính thức thành lập, hợp nhất các nước cộng hòa Xô viết.",
    "1945": "1945 — Kết thúc Chiến tranh thế giới thứ hai; Đông Âu bắt đầu quá trình xây dựng CNXH.",
    "1959": "1959 — Cách mạng Cuba thắng lợi, Cuba đi theo con đường xã hội chủ nghĩa."
  };
  return map[year] || `Mốc ${year}: chưa có dữ liệu chi tiết trong kho.`;
}

// ⭐ CHATBOT REPLY: tự nhiên hơn, ưu tiên giao tiếp
function createReply(userText) {
  const t = normalize(userText);

  // (1) ⭐ Ưu tiên câu giao tiếp tự nhiên
  const natural = checkNaturalTalk(t);
  if (natural) return natural;

  // (2) Summary
  if (t.includes("tom tat") || t.includes("tomtat") || t.includes("tóm tắt")) {
    const parts = userText.split(":");
    if (parts.length > 1) {
      const topic = parts.slice(1).join(":").trim();
      const shortLong = topic.match(/\b([12])\b/);
      if (shortLong) {
        return getSummary(topic.replace(/\b[12]\b/,""), shortLong[1] === "1" ? "short":"long");
      }
      return getSummary(topic, "short");
    } else {
      return "Bạn muốn tóm tắt phần nào? Ví dụ: 'tóm tắt: liên xô'.";
    }
  }

  // (3) Quiz
  if (t.includes("tao quiz") || t.includes("tạo quiz") || t === "quiz") {
    const numMatch = userText.match(/(\d{1,2})/);
    const n = numMatch ? Math.max(5, Math.min(30, parseInt(numMatch[1],10))) : 10;
    const q = generateQuiz(n);
    if (!q.length) return "Ngân hàng câu hỏi trống.";
    let out = `Tạo ${q.length} câu trắc nghiệm:\n\n`;
    q.forEach((qq,i)=>{
      out += `${i+1}. ${qq.q}\nA) ${qq.choices[0]}  B) ${qq.choices[1]}  C) ${qq.choices[2]}  D) ${qq.choices[3]}\n\n`;
    });
    return out;
  }

  // (4) Timeline
  if (t.match(/\b(17|18|19|20)\d{2}\b/) || t.includes("moc") || t.includes("mốc")) {
    const yearMatch = userText.match(/(17|18|19|20)\d{2}/);
    const y = yearMatch ? yearMatch[0] : null;
    if (y) return getTimeline(y);
    return "Gõ 'mốc <năm>' ví dụ 'mốc 1917'.";
  }

  // (5) Kiến thức lịch sử trong CHATBOT_DB
  const { item, score } = findBestMatch(userText);
  if (item && score >= 1) {
    return `${item.answer}\n\nBạn muốn tạo quiz không?->Nếu bạn muốn có thể ghé thăm những người bạn AI trong ngôi nhà Menu nhé:3`;
  }

  // (6) Default
  return "Hmmm… mình chưa có dữ liệu chính xác cho câu này. Bạn thử nói rõ hơn hoặc dùng từ khóa lịch sử nhé!";
}

// exports
window.chatCore = {
  createReply, getSummary, generateQuiz, getTimeline, findBestMatch
};
