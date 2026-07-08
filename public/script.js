const form = document.getElementById('idea-form');
const input = document.getElementById('idea-input');
const submitBtn = document.getElementById('submit-btn');
const resultsSection = document.getElementById('results');
const bestMatch = document.getElementById('best-match');
const resultActions = document.getElementById('result-actions');
const saveBtn = document.getElementById('save-btn');
const shareBtn = document.getElementById('share-btn');
const othersToggle = document.getElementById('others-toggle');
const othersContainer = document.getElementById('others');
const showOthersBtn = document.getElementById('show-others');
const loading = document.getElementById('loading');
const savedSection = document.getElementById('saved-section');
const savedList = document.getElementById('saved-list');
const clearSavedBtn = document.getElementById('clear-saved');

let currentIdea = '';
let currentData = null;

// Toggle others
showOthersBtn.addEventListener('click', () => {
  othersContainer.classList.toggle('hidden');
  showOthersBtn.textContent = othersContainer.classList.contains('hidden')
    ? 'See more voices'
    : 'Show less';
});

// Search
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const idea = input.value.trim();
  if (!idea) return;

  currentIdea = idea;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Searching...';
  resultsSection.classList.add('hidden');
  resultActions.classList.add('hidden');
  loading.classList.remove('hidden');

  try {
    const response = await fetch('/api/roots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea }),
    });

    if (!response.ok) throw new Error('Something went wrong. Please try again.');

    const data = await response.json();
    currentData = data;
    renderResults(data);
    resultActions.classList.remove('hidden');
    saveBtn.textContent = 'Save this idea';
    saveBtn.disabled = false;
  } catch (err) {
    bestMatch.innerHTML = `<p style="color: var(--accent); text-align: center; padding: 2rem 0;">${err.message}</p>`;
    othersToggle.classList.add('hidden');
    othersContainer.classList.add('hidden');
    resultActions.classList.add('hidden');
    resultsSection.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Find who thought this before';
  }
});

// Save
saveBtn.addEventListener('click', () => {
  if (!currentData || !currentIdea) return;

  const saved = JSON.parse(localStorage.getItem('idearoots_saved') || '[]');
  saved.unshift({
    idea: currentIdea,
    best: currentData.best,
    others: currentData.others,
    savedAt: new Date().toISOString(),
  });
  // Keep max 50 saved ideas
  if (saved.length > 50) saved.pop();
  localStorage.setItem('idearoots_saved', JSON.stringify(saved));

  saveBtn.textContent = 'Saved!';
  saveBtn.disabled = true;
  renderSaved();
});

// Share (copy to clipboard)
shareBtn.addEventListener('click', () => {
  if (!currentData?.best) return;

  const b = currentData.best;
  const text = [
    `"${currentIdea}"`,
    '',
    b.connection_line,
    '',
    `${b.name}${b.original_term ? ' (' + b.original_term + ')' : ''} — ${b.tradition}`,
    '',
    b.explanation,
    '',
    `Source: ${b.source_text}`,
    b.source_url ? b.source_url : '',
    '',
    'Found on IdeaRoots — idearoots.vercel.app',
  ].filter(Boolean).join('\n');

  navigator.clipboard.writeText(text).then(() => {
    shareBtn.textContent = 'Copied!';
    setTimeout(() => { shareBtn.textContent = 'Copy to share'; }, 2000);
  });
});

// Clear saved
clearSavedBtn.addEventListener('click', () => {
  if (!confirm('Clear all saved ideas?')) return;
  localStorage.removeItem('idearoots_saved');
  renderSaved();
});

// Render a result card
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

// Render search results
function renderResults(data) {
  if (data.best) {
    bestMatch.innerHTML = renderCard(data.best, true);
  }

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

// Render saved ideas
function renderSaved() {
  const saved = JSON.parse(localStorage.getItem('idearoots_saved') || '[]');

  if (saved.length === 0) {
    savedSection.classList.add('hidden');
    return;
  }

  savedSection.classList.remove('hidden');
  savedList.innerHTML = saved.map((item, i) => {
    const b = item.best;
    const date = new Date(item.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `
      <div class="saved-card">
        <div class="saved-header">
          <p class="saved-idea">"${item.idea}"</p>
          <button class="delete-saved" data-index="${i}" title="Remove">x</button>
        </div>
        <p class="saved-connection">${b.connection_line}</p>
        <div class="saved-meta">
          <span class="concept-name-sm">${b.name}</span>${b.original_term ? `<span class="original-term-sm">${b.original_term}</span>` : ''}
          <span class="tradition-sm">${b.tradition}</span>
          <span class="saved-date">${date}</span>
        </div>
      </div>
    `;
  }).join('');

  // Delete individual saved items
  savedList.querySelectorAll('.delete-saved').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      const saved = JSON.parse(localStorage.getItem('idearoots_saved') || '[]');
      saved.splice(index, 1);
      localStorage.setItem('idearoots_saved', JSON.stringify(saved));
      renderSaved();
    });
  });
}

// Load saved on page load
renderSaved();
