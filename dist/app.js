const $ = id => document.getElementById(id);
const tokenPattern = /[A-Za-z]+(?:[’'-][A-Za-z]+)*/g;
const dialog = $('translation');
let session;
const historyKey = 'tense-trainer-attempted';
const attempted = new Set();
try {
  const saved = JSON.parse(localStorage.getItem(historyKey));
  if (Array.isArray(saved)) saved.forEach(id => attempted.add(id));
} catch {
  // The current session can still track attempts without storage.
}

const theme = $('theme');
const themeKey = 'tense-trainer-theme';
try {
  const savedTheme = localStorage.getItem(themeKey);
  if ([...theme.options].some(option => option.value === savedTheme)) theme.value = savedTheme;
} catch {
  // Theme selection also works without persistent storage.
}
document.documentElement.dataset.theme = theme.value;
theme.addEventListener('change', () => {
  document.documentElement.dataset.theme = theme.value;
  try {
    localStorage.setItem(themeKey, theme.value);
  } catch {
    // Keep the selected theme on the current page.
  }
});

function element(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}

function english(value, tag = 'p') {
  const node = element(tag, 'phrase');
  node.lang = 'en';
  let end = 0;
  for (const match of value.matchAll(tokenPattern)) {
    const word = match[0];
    node.append(value.slice(end, match.index));
    const button = element('button', 'word', word);
    button.type = 'button';
    button.addEventListener('click', () => {
      $('word-title').textContent = word;
      $('word-title').lang = 'en';
      $('word-text').textContent = wordTranslations[word.toLowerCase().replaceAll("'", '’')];
      dialog.showModal();
    });
    node.append(button);
    end = match.index + word.length;
  }
  node.append(value.slice(end));
  return node;
}

function translation(label, value) {
  const details = element('details', 'full-translation');
  details.append(element('summary', '', label), element('p', '', value));
  return details;
}

for (const topic of topics) {
  const tile = element('label', 'tile');
  tile.style.setProperty('--topic', topic.color);
  const input = element('input');
  input.type = 'checkbox';
  input.value = topic.id;
  const title = element('strong', '', topic.title);
  title.lang = 'en';
  const copy = element('span');
  copy.append(title, element('small', '', topic.subtitle));
  tile.append(input, copy);
  $('topics').append(tile);
}

function selectedTopics() {
  const checked = [...$('topics').querySelectorAll(':checked')].map(input => input.value);
  return topics.filter(topic => checked.includes(topic.id));
}

function updateSelection() {
  const count = selectedTopics().length;
  $('start').disabled = count === 0;
  $('select-all').textContent = count === topics.length ? 'Снять выбор' : 'Выбрать все';
  $('selected').textContent = count ? `Выбрано ${count} из ${topics.length}` : '';
}

$('topics').addEventListener('change', updateSelection);
$('select-all').addEventListener('click', () => {
  const check = selectedTopics().length !== topics.length;
  for (const input of $('topics').querySelectorAll('input')) input.checked = check;
  updateSelection();
});

function renderTheory(selected) {
  $('theory').replaceChildren();
  for (const topic of selected) {
    const panel = element('article', 'topic-panel');
    panel.style.setProperty('--topic', topic.color);
    panel.append(element('h3', '', topic.title));
    for (const [title, formula, rule, example, ru] of topic.rules) {
      const details = element('details', 'rule');
      details.open = true;
      details.append(element('summary', '', title), element('code', 'formula', formula),
        element('p', '', rule), english(example), translation('Перевод примера', ru));
      panel.append(details);
    }
    panel.append(element('p', 'source', topic.source));
    $('theory').append(panel);
  }
}

function practiceQueue(selected) {
  const queue = [];
  const length = Math.max(...selected.map(topic => exercises[topic.id].length));
  for (let index = 0; index < length; index++) {
    for (const topic of selected) {
      const task = exercises[topic.id][index];
      if (task) queue.push({topic, task, id: `${topic.id}:${task[2]}`});
    }
  }
  return queue;
}

function renderPicker(selected) {
  const picker = $('exercise-picker');
  const queue = practiceQueue(selected);
  const choices = new Map();
  const start = element('button', 'primary', 'Начать выбранные');
  const status = element('span');
  status.setAttribute('role', 'status');

  function updateCount() {
    const count = [...choices.values()].filter(input => input.checked).length;
    start.disabled = count === 0;
    status.textContent = `Выбрано ${count} из ${queue.length}`;
  }

  picker.replaceChildren(element('p', 'hint', 'Отметь предложения, которые хочешь потренировать.'));
  for (const topic of selected) {
    const group = element('fieldset', 'exercise-group');
    group.append(element('legend', '', topic.title));
    for (const {task, id} of queue.filter(item => item.topic === topic)) {
      const label = element('label', 'exercise-choice');
      const input = element('input');
      input.type = 'checkbox';
      input.checked = !attempted.has(id);
      input.addEventListener('change', updateCount);
      choices.set(id, input);
      const copy = element('span');
      const sentence = element('span', '', task[0]);
      sentence.lang = 'en';
      copy.append(sentence);
      if (attempted.has(id)) copy.append(element('small', '', 'Уже было'));
      label.append(input, copy);
      group.append(label);
    }
    picker.append(group);
  }

  const actions = element('div', 'actions');
  const all = element('button', 'secondary', 'Выбрать все');
  const fresh = element('button', 'secondary', 'Только новые');
  const clear = element('button', 'secondary', 'Снять выбор');
  function setChoices(shouldCheck) {
    for (const [id, input] of choices) input.checked = shouldCheck(id);
    updateCount();
  }
  all.addEventListener('click', () => setChoices(() => true));
  fresh.addEventListener('click', () => setChoices(id => !attempted.has(id)));
  clear.addEventListener('click', () => setChoices(() => false));
  start.addEventListener('click', () => startPractice(selected, queue.filter(item => choices.get(item.id).checked)));
  actions.append(start, all, fresh, clear, status);
  picker.append(actions);
  updateCount();
}

function startPractice(selected, queue) {
  session = {selected, queue, index: 0, correct: 0};
  $('exercise-picker').hidden = true;
  $('practice').hidden = false;
  renderQuestion(true);
}

function showPicker(selected, focus = false) {
  $('practice').hidden = true;
  $('exercise-picker').hidden = false;
  renderPicker(selected);
  if (focus) $('exercise-picker').querySelector('input').focus();
}

function renderQuestion(focus = false) {
  const container = $('practice');
  const card = element('article', 'question');
  container.replaceChildren(card);
  const current = session.queue[session.index];
  if (!current) {
    const heading = element('h3', '', 'Серия завершена');
    heading.tabIndex = -1;
    const retry = element('button', 'primary', 'Пройти ещё раз');
    retry.addEventListener('click', () => startPractice(session.selected, session.queue));
    card.append(heading, element('p', '', `Подходящих ответов: ${session.correct} из ${session.queue.length}.`), retry);
    card.append(exercisePickerButton());
    heading.focus();
    return;
  }

  const {id, topic, task: [prompt, ru, reference, options]} = current;
  const counter = element('p', 'eyebrow', `Задание ${session.index + 1} из ${session.queue.length}`);
  counter.tabIndex = -1;
  card.append(counter, element('h3', '', 'Выбери наиболее подходящий вариант.'), english(prompt),
    translation('Перевод предложения целиком', ru));

  const fieldset = element('fieldset');
  fieldset.append(element('legend', '', 'Варианты ответа'));
  const feedback = element('div');
  feedback.setAttribute('aria-live', 'polite');
  const footer = element('div', 'question-footer');
  const next = element('button', 'primary', session.index + 1 === session.queue.length ? 'Показать результат' : 'Следующее задание');
  next.disabled = true;
  next.addEventListener('click', () => {
    session.index++;
    renderQuestion(true);
  });

  options.forEach(([option, meaning, , correct], index) => {
    const row = element('div', 'option');
    const input = element('input');
    input.type = 'radio';
    input.name = 'answer';
    input.id = `answer-${index}`;
    const label = element('label', '', `Вариант ${index + 1}`);
    label.htmlFor = input.id;
    input.addEventListener('change', () => {
      if (!input.checked || !next.disabled) return;
      for (const radio of fieldset.querySelectorAll('input')) radio.disabled = true;
      session.correct += Number(Boolean(correct));
      attempted.add(id);
      try {
        localStorage.setItem(historyKey, JSON.stringify([...attempted]));
      } catch {
        // Keep attempts in memory for this visit.
      }
      feedback.append(element('p', '', correct ? 'Верно.' : 'Есть более подходящий вариант.'));
      for (const [text, , explanation, isCorrect] of options) {
        const result = element('div', `answer ${isCorrect ? 'correct' : 'incorrect'}`);
        result.append(english(text), element('p', '', explanation));
        feedback.append(result);
      }
      const solution = options.find(option => option[3])[0];
      feedback.append(english(prompt.replace('___', solution)), translation('Перевод ответа целиком', ru));
      footer.prepend(element('p', 'source', `${topic.source} · Practice ${reference}`));
      next.disabled = false;
    });
    row.append(input, label, english(option, 'span'), translation('Перевод варианта', meaning));
    fieldset.append(row);
  });

  footer.append(next, exercisePickerButton());
  card.append(fieldset, feedback, footer);
  if (focus) counter.focus();
}

function exercisePickerButton() {
  const button = element('button', 'secondary', 'К выбору упражнений');
  button.addEventListener('click', () => showPicker(session.selected, true));
  return button;
}

function begin(selected) {
  $('lesson-title').textContent = selected.length === 1 ? selected[0].title : 'Урок по выбранным разделам';
  renderTheory(selected);
  $('home').hidden = true;
  $('lesson').hidden = false;
  showPicker(selected);
  $('lesson-title').focus();
}

$('start').addEventListener('click', () => begin(selectedTopics()));
$('back').addEventListener('click', () => {
  $('lesson').hidden = true;
  $('home').hidden = false;
  $('start').focus();
});
updateSelection();
