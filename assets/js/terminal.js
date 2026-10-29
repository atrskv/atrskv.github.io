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
    'help', 'ls', 'pwd', 'cat HELP.md', 'cdt', 'zen', 'cat ZEN.md',
    'cat CONTEXT-DRIVEN-TESTING-PRINCIPLES.md',
    'pytest', 'pytest .', 'pytest . -v', 'python -m pytest',
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
    "ls                        содержимое каталога",
    "pwd                       текущий каталог",
    "cat <file>                чтение файла",
    "help                      справка по командам",
    "zen                       The Zen of Python",
    "cdt                       принципы Context-Driven Testing",
    "pytest [options] [path]   запуск тест-кейсов",
    "theme <light|dark>        смена темы",
    "bg <on|off|pause|resume>  управление фоном и его анимацией",
    "clear                     очистка терминала",
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
  const files = new Map([
    ['README.md', printReadme],
    ['HELP.md', help],
    ['ZEN.md', printZen],
    ['CONTEXT-DRIVEN-TESTING-PRINCIPLES.md', printPrinciples]
  ]);
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
    if (normalized === 'clear') { stop(); output.replaceChildren(); scroll(true); scheduleSuggestion(); return; }
    commandLine(command);
    scroll(true);
    if (normalized === 'ls' || normalized === 'ls .') line([...files.keys()].join('\n'), 'terminal-file');
    else if (normalized === 'pwd') line('Here!');
    else if (normalized === 'cat' || normalized.startsWith('cat ')) cat(command.replace(/^cat\s*/i, '').trim());
    else if (/^(?:pytest|py\.test|python(?:3)? -m pytest)(?: |$)/.test(normalized)) await runAnimation(pytest);
    else if (normalized === 'help') help();
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
  input.addEventListener('input', () => scheduleSuggestion());
  input.addEventListener('compositionstart', () => { composing = true; clearSuggestion(); });
  input.addEventListener('compositionend', () => { composing = false; scheduleSuggestion(); });
  document.addEventListener('visibilitychange', () => scheduleSuggestion());
  window.addEventListener('pagehide', clearSuggestion);
  window.addEventListener('pageshow', () => scheduleSuggestion());
  form.addEventListener('submit', event => {
    event.preventDefault();
    execute(input.value);
    if (!form.hidden) input.focus({ preventScroll: true });
  });
  terminal.addEventListener('keydown', event => {
    if (event.target !== input && event.target !== screen) return;
    scheduleSuggestion();
    if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
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
