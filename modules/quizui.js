// modules/quizui.js
(function () {
  const genBtn = document.getElementById("generateQuizBtn");
  const quizArea = document.getElementById("quizArea");
  const quizCount = document.getElementById("quizCount");

  function renderQuiz(questions) {
    quizArea.innerHTML = "";

    if (!questions.length) {
      quizArea.textContent = "Không có câu hỏi.";
      return;
    }

    const form = document.createElement("form");
    form.id = "quizForm";

    questions.forEach((q, i) => {
      const box = document.createElement("div");
      box.className = "quiz-item";

      const qTitle = document.createElement("div");
      qTitle.className = "quiz-q";
      qTitle.textContent = `${i + 1}. ${q.q}`;
      box.appendChild(qTitle);

      const opts = document.createElement("div");
      opts.className = "quiz-options";

      ["A", "B", "C", "D"].forEach((label, idx) => {
        const id = `q${i}_opt${idx}`;
        const r = document.createElement("label");
        r.className = "quiz-option";

        r.innerHTML = `
          <input type="radio" name="q${i}" value="\${idx}" id="${id}">
          <span>${label}) ${q.choices[idx]}</span>
        `;

        opts.appendChild(r);
      });

      box.appendChild(opts);
      form.appendChild(box);
    });

    const submit = document.createElement("button");
    submit.type = "button";
    submit.className = "quiz-submit-btn";

    // ⭐ CHỈ SỬA DUY NHẤT DÒNG NÀY ⭐
    submit.innerHTML = "📤 Nộp bài";

    submit.addEventListener("click", () => gradeQuiz(questions));

    form.appendChild(submit);
    quizArea.appendChild(form);
  }

  function gradeQuiz(selected) {
    const form = document.getElementById("quizForm");
    if (!form) return;

    let correct = 0;

    selected.forEach((q, i) => {
      const val = form[`q${i}`] ? form[`q${i}`].value : null;
      if (val !== null && parseInt(val, 10) === q.answer) correct++;
    });

    quizArea.innerHTML = `
      <div class="quiz-result">
        Bạn đúng ${correct}/${selected.length} câu.
      </div>
    `;

    const detail = document.createElement("div");
    detail.className = "quiz-detail";

    selected.forEach((q, i) => {
      const out = document.createElement("div");

      out.className = "quiz-answer-item";
      out.innerHTML = `
        <strong>${i + 1}.</strong> ${q.q}<br>
        Đáp án đúng: <em>${["A", "B", "C", "D"][q.answer]}</em> — ${q.choices[q.answer]}
      `;

      detail.appendChild(out);
    });

    quizArea.appendChild(detail);
  }

  genBtn.addEventListener("click", () => {
    const num = Math.max(5, Math.min(30, parseInt(quizCount.value || 10, 10)));

    const questions =
      window.chatCore && window.chatCore.generateQuiz
        ? window.chatCore.generateQuiz(num)
        : [];

    renderQuiz(questions);
  });

  window._quizUI = { renderQuiz };
})();
