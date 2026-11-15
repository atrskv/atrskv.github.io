(() => {
  'use strict';
  function initializeTerminal() {
  const terminal = document.getElementById('terminal');
  if (!terminal) return;
  const screen = document.getElementById('terminal-screen');
  const output = document.getElementById('terminal-output');
  const form = document.getElementById('terminal-form');
  const input = document.getElementById('terminal-input');
  const suggestion = document.getElementById('terminal-suggestion');
  const prompt = terminal.dataset.prompt;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const history = [];
  let historyIndex = 0;
  let draft = '';
  let activeRun = null;
  let suggestionTimer = null;
  let helpDiscovered = false;
  let suggestionIndex = 0;
  const suggestionCommands = [
    'help', 'ls', 'pwd', 'cat HELP.md', 'leetcode', 'exp', 'cat WORK_EXPERIENCE.md', 'cdt', 'zen', 'cat ZEN.md',
    'cat CONTEXT_DRIVEN_TESTING_PRINCIPLES.md',
    'pytest', 'pytest .', 'pytest . -v',
    'theme light', 'theme dark', 'bg pause', 'bg resume',
    'bg off', 'bg on', 'clear'
  ];
  let composing = false;

  function clearSuggestion() {
    clearTimeout(suggestionTimer);
    suggestionTimer = null;
    suggestion.textContent = '';
  }
  function canSuggest() {
    return !form.hidden && !activeRun && !input.value && !composing && !document.hidden
      && !document.documentElement.classList.contains('stack-open') && followOutput;
  }
  function scheduleSuggestion(delay = 8000) {
    clearSuggestion();
    if (form.hidden || input.value || composing || document.hidden) return;
    suggestionTimer = setTimeout(() => {
      if (!canSuggest()) { scheduleSuggestion(); return; }
      const candidates = suggestionCommands.filter(command =>
        !helpDiscovered || (command !== 'help' && command !== 'cat HELP.md'));
      const hint = candidates[suggestionIndex % candidates.length];
      suggestionIndex += 1;
      if (reducedMotion.matches) { suggestion.textContent = hint; return; }
      let length = 0;
      let deleting = false;
      function step() {
        if (!canSuggest()) { scheduleSuggestion(); return; }
        length += deleting ? -1 : 1;
        suggestion.textContent = hint.slice(0, length);
        if (length === hint.length) {
          deleting = true;
          suggestionTimer = setTimeout(step, 1500);
        } else if (length === 0) {
          scheduleSuggestion();
        } else suggestionTimer = setTimeout(step, deleting ? 100 : 160);
      }
      step();
    }, delay);
  }

  let followOutput = true;
  screen.addEventListener('scroll', () => {
    followOutput = screen.scrollHeight - screen.scrollTop - screen.clientHeight < 36;
  }, { passive: true });
  function scroll(force = false) {
    if (force) followOutput = true;
    if (followOutput) screen.scrollTop = screen.scrollHeight;
  }
  function line(text = '', className = '', target = output) {
    const element = document.createElement('div');
    element.className = `terminal-line ${className}`.trim();
    if (className === 'terminal-test-line') {
      element.textContent = text.replace(/PASSED$/, '');
      const status = document.createElement('span');
      status.className = 'terminal-test-result';
      status.textContent = 'PASSED';
      element.append(status);
    } else element.textContent = text;
    target.append(element);
    scroll();
    return element;
  }
  function commandLine(command, target = output) {
    const element = line('', 'terminal-command', target);
    const label = document.createElement('span');
    label.className = 'terminal-prompt';
    label.textContent = prompt;
    const text = document.createElement('span');
    text.textContent = command;
    element.append(label, text);
    return text;
  }
  function abortError() { return new DOMException('Animation stopped', 'AbortError'); }
  function wait(ms, signal) {
    if (signal.aborted) return Promise.reject(abortError());
    if (reducedMotion.matches) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const onAbort = () => { clearTimeout(timer); reject(abortError()); };
      const timer = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve(); }, ms);
      signal.addEventListener('abort', onAbort, { once: true });
    });
  }
  async function typeCommand(command, signal, target) {
    const text = commandLine('', target);
    text.classList.add('terminal-typing');
    try {
      for (const char of command) {
        await wait(40, signal);
        text.textContent += char;
        scroll();
      }
      await wait(400, signal);
    } finally {
      text.classList.remove('terminal-typing');
    }
  }

  function stop() {
    if (activeRun) {
      activeRun.abort();
      activeRun = null;
      form.hidden = false;
      if (document.activeElement === screen) input.focus({ preventScroll: true });
    }
  }
  function printReadme(target = output) {
    const intro = line('Следую ', '', target);
    const link = document.createElement('a');
    link.href = 'https://context-driven-testing.com/';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'context driven testing';
    intro.append(link, ',');
    line('сосредоточен на повышении качества продукта с учетом его специфики — постоянно анализирую и совершенствую процессы, внедряя наиболее подходящие практики тестирования', '', target);
    line('Делюсь наблюдениями, поддерживаю начинающих', '', target);
  }
  function leetcodeCardUrl() {
    const theme = document.documentElement.classList.contains('dark') ? 'tokyonight' : 'github_light';
    return `https://www.readmecodegen.com/api/leetcode-stats?username=atrskv&theme=${theme}`;
  }
  function updateLeetcodeCards() {
    const src = leetcodeCardUrl();
    output.querySelectorAll('.terminal-leetcode-stats').forEach(image => {
      if (image.src !== src) image.src = src;
    });
  }
  new MutationObserver(updateLeetcodeCards).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  function printLeetcode() {
    const card = line('', 'terminal-card');
    const link = document.createElement('a');
    link.href = 'https://www.readmecodegen.com/leetcode-stats-generator/leetcode-stats-card-generator-for-github';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const image = document.createElement('img');
    image.className = 'terminal-leetcode-stats';
    image.alt = 'LeetCode Stats — atrskv';
    image.decoding = 'async';
    image.addEventListener('load', () => {
      requestAnimationFrame(() => {
        if (card.isConnected) scroll(true);
      });
    });
    image.addEventListener('error', () => {
      link.href = 'https://leetcode.com/u/atrskv/';
      link.textContent = 'leetcode: не удалось загрузить статистику. Открыть профиль atrskv';
      scroll();
    }, { once: true });
    link.append(image);
    card.append(link);
    image.src = leetcodeCardUrl();
    scroll();
  }
  async function pytest(signal, target) {
    const report = [
      ['test session starts', 'terminal-separator'],
      ['platform darwin -- Python 3.13.3, pytest-8.4.2, pluggy-1.6.0'],
      ['rootdir: /Users/atrskv/projects/project-tests'],
      ['configfile: pyproject.toml'],
      ['plugins: allure-pytest-2.15.0, Faker-37.6.0'],
      ['collected 1 item'],
      ['tests/test_example.py::test_example_case PASSED', 'terminal-test-line'],
      ['1 passed in 0.04s', 'terminal-separator']
    ];
    for (const [text, style] of report) {
      await wait(80, signal);
      line(text, style, target);
    }
  }
  async function about(signal, target) {
    await typeCommand('cat README.md', signal, target);
    printReadme(target);
    await wait(300, signal);
    await typeCommand('pytest . -v --alluredir=allure-results', signal, target);
    await pytest(signal, target);
  }
  async function runAnimation(task) {
    if (activeRun) return;
    clearSuggestion();
    const run = new AbortController();
    const hadInputFocus = document.activeElement === input;
    const group = document.createElement('div');
    group.className = 'terminal-run';
    group.setAttribute('aria-busy', 'true');
    output.append(group);
    activeRun = run;
    form.hidden = true;
    if (hadInputFocus) screen.focus({ preventScroll: true });
    scroll(true);
    try { await task(run.signal, group); }
    catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
        line('terminal: failed to complete output', '', group);
      }
    } finally {
      group.setAttribute('aria-busy', 'false');
      if (activeRun === run) {
        activeRun = null;
        form.hidden = false;
        if (hadInputFocus && document.activeElement === screen) input.focus({ preventScroll: true });
        scroll();
      }
    }
  }
  function background(mode) {
    if (!window.siteBackground) {
      line('bg: unavailable');
      return;
    }
    window.siteBackground.setMode(mode);
    line('successed');
  }
  const helpFile = [
    "ls                        Содержимое каталога",
    "pwd                       Текущий каталог",
    "cat <file>                Чтение файла",
    "help                      Справка по командам",
    "leetcode                  Статистика LeetCode",
    "exp                       Опыт работы",
    "zen                       The Zen of Python",
    "cdt                       Принципы Context-Driven Testing",
    "pytest [options] [path]   Запуск тест-кейсов",
    "theme <light|dark>        Смена темы",
    "bg <on|off|pause|resume>  Управление фоном и его анимацией",
    "clear                     Очистка терминала",
  ].join('\n');
  function help() {
    helpDiscovered = true;
    clearSuggestion();
    line(helpFile, 'terminal-file');
  }
  const zenFile = "Beautiful is better than ugly.\nExplicit is better than implicit.\nSimple is better than complex.\nComplex is better than complicated.\nFlat is better than nested.\nSparse is better than dense.\nReadability counts.\nSpecial cases aren't special enough to break the rules.\nAlthough practicality beats purity.\nErrors should never pass silently.\nUnless explicitly silenced.\nIn the face of ambiguity, refuse the temptation to guess.\nThere should be one-- and preferably only one --obvious way to do it.\nAlthough that way may not be obvious at first unless you're Dutch.\nNow is better than never.\nAlthough never is often better than *right* now.\nIf the implementation is hard to explain, it's a bad idea.\nIf the implementation is easy to explain, it may be a good idea.\nNamespaces are one honking great idea -- let's do more of those!\n\nКрасивое лучше, чем уродливое.\nЯвное лучше, чем неявное.\nПростое лучше, чем сложное.\nСложное лучше, чем запутанное.\nПлоское лучше, чем вложенное.\nРазреженное лучше, чем плотное.\nЧитаемость имеет значение.\nОсобые случаи не настолько особые, чтобы нарушать правила.\nПри этом практичность важнее безупречности.\nОшибки никогда не должны замалчиваться.\nЕсли они не замалчиваются явно.\nВстретив двусмысленность, отбрось искушение угадать.\nДолжен существовать один и, желательно, только один очевидный способ сделать это.\nХотя он поначалу может быть и не очевиден, если вы не голландец.\nСейчас лучше, чем никогда.\nХотя никогда зачастую лучше, чем прямо сейчас.\nЕсли реализацию сложно объяснить — идея плоха.\nЕсли реализацию легко объяснить — идея, возможно, хороша.\nПространства имён — отличная штука! Будем делать их больше!";
  const principlesFile = "1. The value of any practice depends on its context.\n2. There are good practices in context, but there are no best practices.\n3. People, working together, are the most important part of any project’s context.\n4. Projects unfold over time in ways that are often not predictable.\n5. The product is a solution. If the problem isn’t solved, the product doesn’t work.\n6. Good software testing is a challenging intellectual process.\n7. Only through judgment and skill, exercised cooperatively throughout the entire project, are we able to do the right things at the right times to effectively test our products.\n\n1. Ценность любой практики зависит от её контекста.\n2. Существуют хорошие практики, но лучших практик не существует.\n3. Люди, работающие вместе, — самая важная часть контекста любого проекта.\n4. Проекты развиваются со временем, зачастую непредсказуемым образом.\n5. Продукт — это решение. Если задача не решена, продукт не работает.\n6. Хорошее тестирование программного обеспечения — сложный интеллектуальный процесс.\n7. Только принимая взвешенные решения, применяя навыки и работая сообща на протяжении всего проекта, мы можем делать нужные вещи в нужное время, чтобы эффективно тестировать наши продукты.";
  function printSource(title, url) {
    const source = line('', 'terminal-source');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = title;
    source.append(link);
    scroll();
  }
  function printZen() {
    printSource('Zen of Python', 'https://peps.python.org/pep-0020/');
    line();
    line(zenFile, 'terminal-file');
  }
  function printPrinciples() {
    printSource('Context-Driven Testing — Principles', 'https://context-driven-testing.com/');
    line();
    line(principlesFile, 'terminal-file');
  }
  const experienceCalendar = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });
  function russianCount(count, forms) {
    const lastTwo = count % 100;
    const last = count % 10;
    const form = lastTwo >= 11 && lastTwo <= 14 ? 2 : last === 1 ? 0 : last >= 2 && last <= 4 ? 1 : 2;
    return `${count} ${forms[form]}`;
  }
  function formatExperienceMonths(months) {
    const years = Math.floor(months / 12);
    const remainder = months % 12;
    const parts = [];
    if (years) parts.push(russianCount(years, ['год', 'года', 'лет']));
    if (remainder || !years) parts.push(russianCount(remainder, ['месяц', 'месяца', 'месяцев']));
    return parts.join(' и ');
  }
  function formatCompanyTenure(start, end) {
    const parts = date => Object.fromEntries(experienceCalendar.formatToParts(date).map(part => [part.type, Number(part.value)]));
    const first = parts(start);
    const last = parts(end);
    // Resume tenure includes both the starting and ending calendar months.
    const months = Math.max(0, (last.year - first.year) * 12 + last.month - first.month + 1);
    return formatExperienceMonths(months);
  }
  function workExperienceSummary(now = new Date()) {
    const calendar = Object.fromEntries(experienceCalendar.formatToParts(now).map(part => [part.type, part.value]));
    return {
      period: `22.07.2026 — ${calendar.day}.${calendar.month}.${calendar.year}:${calendar.hour}:${calendar.minute}:${calendar.second}`,
      tenure: formatCompanyTenure(new Date('2026-07-22T00:00:00+03:00'), now),
      total: formatCompanyTenure(new Date('2022-02-14T00:00:00+03:00'), now)
    };
  }
  const experienceViews = new Set();
  let experienceTimer = null;
  function updateExperienceViews() {
    const summary = workExperienceSummary();
    for (const view of experienceViews) {
      if (!view.group.isConnected) {
        experienceViews.delete(view);
        continue;
      }
      for (const key of ['period', 'tenure', 'total']) {
        if (view[key].textContent !== summary[key]) view[key].textContent = summary[key];
      }
    }
    if (!experienceViews.size && experienceTimer !== null) {
      clearInterval(experienceTimer);
      experienceTimer = null;
    }
  }
  function startExperienceUpdates() {
    updateExperienceViews();
    if (experienceViews.size && experienceTimer === null) {
      experienceTimer = setInterval(updateExperienceViews, 1000);
    }
  }
  function printWorkExperience() {
    const group = document.createElement('div');
    group.className = 'terminal-file terminal-experience';
    output.append(group);
    function company(name, url, last = false) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const heading = document.createElement('strong');
      heading.textContent = name;
      link.append(heading);
      const row = experienceLine('', false, last ? '└─' : '├─');
      row.parentElement.classList.add('terminal-experience-company');
      row.append(link);
      const tenure = experienceLine('', false, last ? '' : '│');
      tenure.parentElement.classList.add('terminal-experience-tenure');
      tenure.setAttribute('aria-live', 'off');
      return tenure;
    }
    function experienceLine(text = '', bold = false, connector = '│') {
      const row = line('', 'terminal-experience-row', group);
      const branch = document.createElement('span');
      branch.textContent = connector;
      branch.setAttribute('aria-hidden', 'true');
      const content = document.createElement(bold ? 'strong' : 'span');
      content.textContent = text;
      row.append(branch, content);
      return content;
    }
    const tenure = company('Ozon {ech', 'http://ozon.tech/');
    experienceLine('', false, '│');
    experienceLine('Senior QA Automation / Старший инженер по автоматизации тестирования', true, '│  └─');
    const period = experienceLine('', false, '│');
    period.setAttribute('aria-live', 'off');
    experienceLine('', false, '│');
    const biocadTenure = company('BIOCAD', 'https://biocad.ru/', true);
    biocadTenure.textContent = formatCompanyTenure(new Date('2022-02-14T00:00:00+03:00'), new Date('2026-06-30T00:00:00+03:00'));
    experienceLine('', false, '   │');
    const jobs = [
      ['Senior QA Automation (LEAD) / Старший инженер по тестированию в группе автоматизации', '01.10.2025 — 30.06.2026'],
      ['Middle QA Automation / Инженер по тестированию в группе автоматизации', '01.04.2023 — 01.10.2025'],
      ['Junior QA Manual / Младший инженер по тестированию', '14.02.2022 — 01.04.2023']
    ];
    jobs.forEach(([title, dates], index) => {
      if (index) experienceLine('', false, '   │');
      const last = index === jobs.length - 1;
      experienceLine(title, true, last ? '   └─' : '   ├─');
      experienceLine(dates, false, last ? '' : '   │');
    });
    line('', '', group);
    const total = document.createElement('strong');
    line('Суммарный опыт — ', '', group).append(total);
    experienceViews.add({ group, period, tenure, total });
    startExperienceUpdates();
    scroll(true);
  }
  const files = new Map([
    ['README.md', printReadme],
    ['HELP.md', help],
    ['WORK_EXPERIENCE.md', printWorkExperience],
    ['ZEN.md', printZen],
    ['CONTEXT_DRIVEN_TESTING_PRINCIPLES.md', printPrinciples]
  ]);
  const completionCommands = [...new Set(suggestionCommands.map(command => command.split(' ')[0]))].sort();
  let completion = null;
  function resetCompletion() {
    completion?.menu.remove();
    completion = null;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-controls');
    input.removeAttribute('aria-activedescendant');
  }
  function selectCompletion(direction) {
    const state = completion;
    state.index = state.index < 0 ? (direction > 0 ? 0 : state.matches.length - 1)
      : (state.index + direction + state.matches.length) % state.matches.length;
    input.value = state.before + state.matches[state.index] + state.suffix;
    input.setSelectionRange(input.value.length, input.value.length);
    state.value = input.value;
    state.options.forEach((option, index) => option.setAttribute('aria-selected', String(index === state.index)));
    input.setAttribute('aria-activedescendant', state.options[state.index].id);
    clearSuggestion();
    scroll(true);
  }
  function completeInput(direction = 1) {
    if (input.selectionStart !== input.value.length || input.selectionEnd !== input.value.length) {
      resetCompletion();
      return false;
    }
    if (completion && completion.value === input.value) {
      selectCompletion(direction);
      return true;
    }
    resetCompletion();
    let candidates;
    let start;
    let prefix;
    let suffix = '';
    const command = input.value.match(/^(\s*)(\S*)$/);
    const filename = input.value.match(/^(\s*cat\s+)(\.\/)?(\S*)$/i);
    const argument = input.value.match(/^(\s*(theme|bg)\s+)(\S*)$/i);
    if (command) {
      candidates = completionCommands;
      start = command[1].length;
      prefix = command[2];
      suffix = ' ';
    } else if (filename) {
      candidates = [...files.keys()].sort();
      start = filename[1].length + (filename[2]?.length || 0);
      prefix = filename[3];
    } else if (argument) {
      candidates = argument[2].toLowerCase() === 'theme' ? ['dark', 'light'] : ['off', 'on', 'pause', 'resume'];
      start = argument[1].length;
      prefix = argument[3];
    } else return false;
    const matches = candidates.filter(candidate => candidate.toLowerCase().startsWith(prefix.toLowerCase()));
    if (!matches.length) return false;
    const before = input.value.slice(0, start);
    if (matches.length === 1) {
      input.value = before + matches[0] + suffix;
      input.setSelectionRange(input.value.length, input.value.length);
      clearSuggestion();
      scroll(true);
      return true;
    }
    let shared = matches[0];
    while (!matches.every(candidate => candidate.toLowerCase().startsWith(shared.toLowerCase()))) shared = shared.slice(0, -1);
    input.value = before + shared;
    input.setSelectionRange(input.value.length, input.value.length);
    const menu = document.createElement('div');
    menu.id = 'terminal-completions';
    menu.className = 'terminal-completions';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', 'Варианты автодополнения');
    const options = matches.map((candidate, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.id = `terminal-completion-${index}`;
      option.tabIndex = -1;
      option.textContent = candidate;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      option.addEventListener('click', () => {
        if (!completion || completion.menu !== menu) return;
        completion.index = index - 1;
        selectCompletion(1);
        resetCompletion();
        input.focus({ preventScroll: true });
      });
      menu.append(option);
      return option;
    });
    completion = { before, matches, suffix, value: input.value, index: -1, menu, options };
    form.before(menu);
    input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-controls', menu.id);
    clearSuggestion();
    scroll(true);
    return true;
  }
  function cat(filename) {
    const name = filename.replace(/^\.\//, '').toUpperCase();
    const file = [...files.keys()].find(key => key.toUpperCase() === name);
    if (file) files.get(file)();
    else if (!name) {
      const names = [...files.keys()];
      line(`${names.slice(0, -1).join(', ')} or ${names.at(-1)}?`);
    } else line(`cat: ${filename}: No such file or directory`);
  }
  function theme(mode) {
    if (mode !== 'light' && mode !== 'dark') {
      line('theme: usage: theme light | theme dark');
      return;
    }
    const checkbox = document.getElementById('theme-checkbox');
    if (checkbox) {
      checkbox.checked = mode === 'dark';
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
    line('successed');
  }
  async function execute(raw) {
    const command = raw.trim();
    resetCompletion();
    clearSuggestion();
    input.value = '';
    draft = '';
    if (command && history.at(-1) !== command) history.push(command);
    if (history.length > 100) history.shift();
    historyIndex = history.length;
    while (output.childElementCount > 180) output.firstElementChild.remove();
    if (!command) {
      const text = commandLine('');
      text.parentElement.classList.add('terminal-empty-command');
      scroll(true);
      scheduleSuggestion();
      return;
    }
    const normalized = command.toLowerCase().replace(/\s+/g, ' ');
    if (normalized === 'clear') { stop(); output.replaceChildren(); updateExperienceViews(); scroll(true); scheduleSuggestion(); return; }
    commandLine(command);
    scroll(true);
    if (normalized === 'ls' || normalized === 'ls .') line([...files.keys()].join('\n'), 'terminal-file');
    else if (normalized === 'pwd') line('Here!');
    else if (normalized === 'cat' || normalized.startsWith('cat ')) cat(command.replace(/^cat\s*/i, '').trim());
    else if (/^(?:pytest|py\.test|python(?:3)? -m pytest)(?: |$)/.test(normalized)) await runAnimation(pytest);
    else if (normalized === 'help') help();
    else if (normalized === 'leetcode') printLeetcode();
    else if (normalized === 'exp') printWorkExperience();
    else if (normalized === 'zen') printZen();
    else if (normalized === 'cdt') printPrinciples();
    else if (normalized === 'bg pause') background('paused');
    else if (normalized === 'bg resume') background('running');
    else if (normalized === 'bg off') background('off');
    else if (normalized === 'bg on') background('running');
    else if (normalized === 'theme' || normalized.startsWith('theme ')) theme(normalized.slice(6));
    else line(`command not found: ${command}`);
    scheduleSuggestion();
  }
  let pointerStart = null;
  terminal.addEventListener('pointerdown', event => {
    scheduleSuggestion();
    pointerStart = event.button === 0
      ? { x: event.clientX, y: event.clientY, scrollTop: screen.scrollTop }
      : null;
  });
  terminal.addEventListener('pointercancel', () => { pointerStart = null; });
  terminal.addEventListener('click', event => {
    const start = pointerStart;
    pointerStart = null;
    if (form.hidden || event.button !== 0 || event.detail > 1) return;
    if (event.target.closest('a, button, input, textarea, select, label, [contenteditable]')) return;
    if (window.getSelection()?.isCollapsed === false) return;
    if (start && (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5
      || Math.abs(screen.scrollTop - start.scrollTop) > 3)) return;
    input.focus({ preventScroll: true });
    scroll(true);
  });
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || form.hidden) return;
    if (event.ctrlKey || event.metaKey || event.altKey || [...event.key].length !== 1) return;
    if (document.activeElement === input || event.target === input) return;
    if (document.documentElement.classList.contains('stack-open')) return;
    if (document.querySelector('dialog[open], [aria-modal="true"]:not([hidden])')) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="menu"]')) return;
    if (event.key === ' ' && target?.closest('button, a[href], [role="button"], [role="checkbox"]')) return;
    if (window.getSelection()?.isCollapsed === false) return;
    event.preventDefault();
    input.focus({ preventScroll: true });
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    if (input.value.length - (end - start) + event.key.length <= input.maxLength) {
      input.setRangeText(event.key, start, end, 'end');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    scroll(true);
  });
  input.addEventListener('focus', () => { scroll(true); scheduleSuggestion(); });
  input.addEventListener('input', () => { resetCompletion(); scheduleSuggestion(); });
  input.addEventListener('pointerdown', resetCompletion);
  input.addEventListener('compositionstart', () => { composing = true; clearSuggestion(); });
  input.addEventListener('compositionend', () => { composing = false; scheduleSuggestion(); });
  document.addEventListener('visibilitychange', () => { scheduleSuggestion(); updateExperienceViews(); });
  window.addEventListener('pagehide', clearSuggestion);
  window.addEventListener('pagehide', () => { clearInterval(experienceTimer); experienceTimer = null; });
  window.addEventListener('pageshow', () => { scheduleSuggestion(); startExperienceUpdates(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    execute(input.value);
    if (!form.hidden) input.focus({ preventScroll: true });
  });
  terminal.addEventListener('keydown', event => {
    if (event.target !== input && event.target !== screen) return;
    scheduleSuggestion();
    if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Tab' && event.target === input && (!event.shiftKey || completion)
      && completeInput(event.shiftKey ? -1 : 1)) {
      event.preventDefault();
      return;
    }
    if (completion && event.target === input && ['ArrowUp', 'ArrowDown', 'Escape'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Escape') resetCompletion();
      else selectCompletion(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    resetCompletion();
    if (event.shiftKey) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (!history.length) return;
      if (historyIndex === history.length) draft = input.value;
      historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
      input.value = historyIndex === history.length ? draft : history[historyIndex];
      if (!form.hidden) input.focus({ preventScroll: true });
      input.setSelectionRange(input.value.length, input.value.length);
      scroll(true);
      scheduleSuggestion();
    }
  });
  terminal.closest('.visitor-terminal').addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeRun) {
      stop();
      line('terminal: output interrupted');
      scheduleSuggestion();
    }
  });
  runAnimation(about).finally(() => {
    form.hidden = false;
    scroll(true);
    scheduleSuggestion(3000);
  });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTerminal, { once: true });
  } else initializeTerminal();
})();
