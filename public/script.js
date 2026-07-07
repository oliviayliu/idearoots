const form = document.getElementById('idea-form');
const input = document.getElementById('idea-input');
const charCount = document.getElementById('char-count');
const submitBtn = document.getElementById('submit-btn');
const resultsSection = document.getElementById('results');
const resultsContent = document.getElementById('results-content');
const loading = document.getElementById('loading');

// Character counter
input.addEventListener('input', () => {
  charCount.textContent = `${input.value.length} / 1000`;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const idea = input.value.trim();
  if (!idea) return;

  // Show loading, hide results
  submitBtn.disabled = true;
  submitBtn.textContent = 'Searching...';
  resultsSection.classList.add('hidden');
  loading.classList.remove('hidden');

  try {
    const response = await fetch('/api/roots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea }),
    });

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again.');
    }

    const data = await response.json();
    renderResults(data.concepts);
  } catch (err) {
    resultsContent.innerHTML = `<p style="color: var(--accent); text-align: center; padding: 2rem 0;">${err.message}</p>`;
    resultsSection.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Find the roots';
  }
});

function renderResults(concepts) {
  resultsContent.innerHTML = '';

  concepts.forEach((concept, index) => {
    const card = document.createElement('div');
    card.className = `result-card${concept.is_closest ? ' closest-match' : ''}`;

    const closenessPercent = concept.closeness * 100;

    card.innerHTML = `
      ${concept.is_closest ? '<span class="closest-label">Closest match</span>' : ''}
      <div class="result-header">
        <span class="concept-name">
          ${concept.name}${concept.original_term ? `<span class="original-term">${concept.original_term}</span>` : ''}
        </span>
        <span class="tradition-badge">${concept.tradition}</span>
      </div>
      <div class="closeness">
        <div class="closeness-bar">
          <div class="closeness-fill" style="width: ${closenessPercent}%"></div>
        </div>
        <span>${Math.round(closenessPercent)}% match</span>
      </div>
      <p class="result-description">${concept.explanation}</p>
      <p class="thinker">${concept.thinkers}</p>
      <p class="source-text">${concept.source_text}</p>
      ${concept.learn_more_url ? `<a class="learn-more" href="${concept.learn_more_url}" target="_blank" rel="noopener">Read more &rarr;</a>` : ''}
    `;

    card.style.animationDelay = `${index * 0.1}s`;
    resultsContent.appendChild(card);
  });

  resultsSection.classList.remove('hidden');
}
