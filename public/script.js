const form = document.getElementById('idea-form');
const input = document.getElementById('idea-input');
const submitBtn = document.getElementById('submit-btn');
const resultsSection = document.getElementById('results');
const bestMatch = document.getElementById('best-match');
const othersToggle = document.getElementById('others-toggle');
const othersContainer = document.getElementById('others');
const showOthersBtn = document.getElementById('show-others');
const loading = document.getElementById('loading');

showOthersBtn.addEventListener('click', () => {
  othersContainer.classList.toggle('hidden');
  showOthersBtn.textContent = othersContainer.classList.contains('hidden')
    ? 'See more voices'
    : 'Show less';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const idea = input.value.trim();
  if (!idea) return;

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

    if (!response.ok) throw new Error('Something went wrong. Please try again.');

    const data = await response.json();
    renderResults(data);
  } catch (err) {
    bestMatch.innerHTML = `<p style="color: var(--accent); text-align: center; padding: 2rem 0;">${err.message}</p>`;
    othersToggle.classList.add('hidden');
    othersContainer.classList.add('hidden');
    resultsSection.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Find who thought this before';
  }
});

function renderCard(concept, isBest) {
  const prefix = isBest ? 'best' : 'other';
  return `
    <div class="${prefix}-card">
      <p class="${prefix}-connection">${concept.connection_line}</p>
      <div class="${isBest ? 'best-concept' : ''}" style="${isBest ? '' : 'margin-bottom: 0.6rem'}">
        <span class="concept-name">${concept.name}</span>${concept.original_term ? `<span class="original-term">${concept.original_term}</span>` : ''}
        <span class="tradition">${concept.tradition}</span>
      </div>
      <p class="explanation">${concept.explanation}</p>
      <p class="source-line">${concept.source_text}</p>
      ${concept.source_url ? `<a class="source-link" href="${concept.source_url}" target="_blank" rel="noopener">Read the original text &rarr;</a>` : ''}
    </div>
  `;
}

function renderResults(data) {
  // Render best match
  if (data.best) {
    bestMatch.innerHTML = renderCard(data.best, true);
  }

  // Render others
  if (data.others && data.others.length > 0) {
    othersContainer.innerHTML = data.others.map(c => renderCard(c, false)).join('');
    othersToggle.classList.remove('hidden');
    othersContainer.classList.add('hidden');
    showOthersBtn.textContent = 'See more voices';
  } else {
    othersToggle.classList.add('hidden');
    othersContainer.classList.add('hidden');
  }

  resultsSection.classList.remove('hidden');
}
