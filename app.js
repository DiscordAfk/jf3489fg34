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
      $('word-text').textContent = wordTranslations[word.toLowerCase().replaceAll("'", '’')] ?? 'Это слово отсутствует в словаре урока.';
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

function renderPicker(selected) {
  const picker = $('exercise-picker');
  picker.replaceChildren(element('p', 'hint', 'Выбери упражнение по номеру из PDF, чтобы пройти все его пункты по порядку.'));
  for (const topic of selected) {
    const group = element('fieldset', 'exercise-group');
    group.append(element('legend', '', topic.title));
    fullPractice[topic.id].forEach((exercise, index) => {
      const number = index + 1;
      const queue = exercise.items.map(task => ({
        topic, task, exercise, number, id: `${topic.id}:${task.reference}`,
      }));
      const completed = queue.filter(item => attempted.has(item.id)).length;
      const button = element('button', 'exercise-choice');
      button.type = 'button';
      const copy = element('span');
      copy.append(element('strong', '', `Упражнение ${number}. ${exercise.title}`));
      const total = exercise.passage ? exercise.items.reduce((count, task) => count + task.gaps.length, 0) : queue.length;
      copy.append(element('small', '', exercise.passage
        ? `Пропусков: ${total}${completed ? ` · Частей пройдено: ${completed} из ${queue.length}` : ''}`
        : `Пунктов: ${total}${completed ? ` · Пройдено: ${completed} из ${queue.length}` : ''}`));
      button.append(copy);
      button.addEventListener('click', () => startPractice(selected, queue));
      group.append(button);
    });
    picker.append(group);
  }
}

function exerciseText(prompt, substitute) {
  const parts = prompt.split(/\[[^\]]+\]/g);
  return parts.map((part, index) => index ? substitute(index - 1) + part : part).join('');
}

function normalizeAnswer(value) {
  return value.toLowerCase().normalize('NFKC')
    .replace(/[’‘]/g, "'")
    .replace(/\bwon't\b/g, 'will not')
    .replace(/n't\b/g, ' not')
    .replace(/'ll\b/g, ' will')
    .replace(/'m\b/g, ' am')
    .replace(/'re\b/g, ' are')
    .replace(/'ve\b/g, ' have')
    .replace(/'s(?= been\b)/g, ' has')
    .replace(/'s\b/g, ' is')
    .replace(/[.,!?;:]/g, '')
    .replace(/[–—-]/g, ' ')
    .trim().replace(/\s+/g, ' ');
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
  if (focus) $('exercise-picker').querySelector('button').focus();
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

  const {id, topic, task, exercise, number} = current;
  const {prompt, ru, reference, options, gaps} = task;
  const counter = element('p', 'eyebrow', `Упражнение ${number} · ${exercise.passage ? 'Часть' : 'Пункт'} ${session.index + 1} из ${session.queue.length}`);
  counter.tabIndex = -1;
  card.append(counter, element('h3', '', exercise.title));
  if (exercise.image) {
    const image = element('img', 'exercise-image');
    image.src = exercise.image;
    image.alt = 'Четыре пронумерованных рисунка с Питером из упражнения в PDF';
    card.append(image);
  }
  if (exercise.passage) {
    const context = element('details', 'full-translation');
    context.append(element('summary', '', 'Весь текст с пропусками'));
    let gapNumber = 0;
    for (const part of exercise.items) {
      context.append(english(exerciseText(part.prompt, () => ` [${++gapNumber}] ___ `)));
    }
    context.append(translation('Перевод всего текста', exercise.items.map(item => item.ru).join('\n\n')));
    card.append(context);
  }
  const gapOffset = exercise.passage ? exercise.items.slice(0, session.index).reduce((total, part) => total + part.gaps.length, 0) : 0;
  card.append(english(gaps ? exerciseText(prompt, index => `[${gapOffset + index + 1}] ___`) : prompt),
    translation(exercise.passage ? 'Перевод отрывка' : 'Перевод задания целиком', ru));

  const feedback = element('div');
  feedback.setAttribute('aria-live', 'polite');
  const footer = element('div', 'question-footer');
  const next = element('button', 'primary', session.index + 1 === session.queue.length ? 'Показать результат' : 'Следующий пункт');
  next.disabled = true;
  next.addEventListener('click', () => {
    session.index++;
    renderQuestion(true);
  });

  function complete(correct) {
    session.correct += Number(correct);
    attempted.add(id);
    try {
      localStorage.setItem(historyKey, JSON.stringify([...attempted]));
    } catch {
      // Keep attempts in memory for this visit.
    }
    feedback.append(element('p', '', correct ? 'Верно.' : 'Посмотри разбор ответа.'));
    footer.prepend(element('p', 'source', `${topic.source} · Practice ${reference}`));
    next.disabled = false;
  }

  function explain(text, explanation, correct) {
    const result = element('div', `answer ${correct ? 'correct' : 'incorrect'}`);
    result.append(english(text), element('p', '', explanation));
    feedback.append(result);
  }

  if (options) {
    const fieldset = element('fieldset');
    fieldset.append(element('legend', '', 'Варианты ответа'));
    options.forEach(([option, meaning, , correct], index) => {
      const row = element('div', 'option');
      const input = element('input');
      input.type = 'radio';
      input.name = 'answer';
      input.id = `answer-${index}`;
      const label = element('label', '', `Вариант ${index + 1}`);
      label.htmlFor = input.id;
      input.addEventListener('change', () => {
        for (const radio of fieldset.querySelectorAll('input')) radio.disabled = true;
        complete(Boolean(correct));
        for (const [text, , explanation, isCorrect] of options) {
          explain(text, exercise.image && !isCorrect
            ? `Это описание относится к другой ситуации. ${explanation}`
            : explanation, Boolean(isCorrect));
        }
        const solution = options.find(option => option[3]);
        if (exercise.image) feedback.append(translation('Перевод подходящего описания', solution[1]));
        else feedback.append(english(prompt.replace('___', solution[0])), translation('Перевод ответа целиком', ru));
      });
      row.append(input, label, english(option, 'span'));
      if (meaning) row.append(translation('Перевод варианта', meaning));
      fieldset.append(row);
    });
    card.append(fieldset);
  } else {
    const form = element('form', 'gap-form');
    const fields = gaps.map((gap, index) => {
      const row = element('div', 'gap-row');
      const input = element(gap.variants ? 'select' : 'input');
      input.required = true;
      input.id = `gap-${index}`;
      const label = element('label', '', `Пропуск ${gapOffset + index + 1}`);
      label.htmlFor = input.id;
      if (gap.variants) {
        input.append(element('option', '', 'Выбери форму'));
        input.options[0].value = '';
        for (const variant of gap.variants) input.append(element('option', '', variant));
      } else {
        input.type = 'text';
        input.lang = 'en';
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.addEventListener('input', () => input.setCustomValidity(''));
      }
      row.append(label, english(gap.cue, 'span'), input);
      form.append(row);
      return input;
    });
    const check = element('button', 'primary', 'Проверить');
    check.type = 'submit';
    form.append(check);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (check.disabled) return;
      const empty = fields.find(input => !input.value.trim());
      if (empty) {
        empty.setCustomValidity('Заполни этот пропуск.');
        empty.reportValidity();
        return;
      }
      const results = gaps.map((gap, index) =>
        gap.answers.some(answer => normalizeAnswer(answer) === normalizeAnswer(fields[index].value)));
      fields.forEach(input => { input.disabled = true; });
      check.disabled = true;
      complete(results.every(Boolean));
      gaps.forEach((gap, index) => {
        if (!results[index]) explain(fields[index].value, `Пропуск ${gapOffset + index + 1}. ${gap.rejected || 'Для этого контекста сравни свою форму с образцом ниже.'}`, false);
        explain(gap.answers.join(' / '), `Пропуск ${gapOffset + index + 1}. ${gap.explanation}`, true);
      });
      feedback.append(english(exerciseText(prompt, index => gaps[index].answers[0])), translation('Перевод ответа целиком', ru));
    });
    card.append(form);
  }

  footer.append(next, exercisePickerButton());
  card.append(feedback, footer);
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
