---
title: Высокоуровневые документы в тестировании
date: 2024-12-05 18:41:00
tags: [documents, testing]
---

Сложилось впечатление, что, когда звучит вопрос о целях тестирования, говорят исключительно о тест-плане _(окей, иногда еще упоминают тестовую стратегию, но в отрыве от общей структуры)_. Так вот... *Соответствуют ли цели, закрепленные в тест-плане, целям более высокого уровня? Или мы сами придумали себе цели и теперь вынуждены доказывать их необходимость?* 🤔

**Попробуем представить картину целиком:**

> **Политика качества (quality policy)** — документ, определяющий общее видение, цели и обязательства организации в области качества. Он отвечает на вопрос: _"Что для нас качество?"_ и демонстрирует приверженность стандартам _(например, ISO 9001)_
>
> **Политика тестирования (test policy)** — документ, в котором описаны принципы и цели тестирования в организации. Отвечая на вопрос: _"Зачем мы тестируем?"_, она задает универсальные правила тестирования, которые служат ориентиром для всех участников
>
> **Стратегия тестирования (test strategy)** — документ, содержащий верхнеуровневое описание процесса тестирования продукта с точки зрения подходов и/или их сочетания _(аналитический, методический, на основе рисков/стандарта/модели, консультативный, реактивный, на основе минимизации регресса... )_,  в общем: _"Как мы будем тестировать в заданных условиях?"_
>
> **План тестирования (test plan)** — документ, описывающий цели тестирования, которые должны быть достигнуты и средства (приемы) их достижения: _"Какие задачи по тестированию нужно выполнить и как они будут организованы?"_. В отличие от стратегии, план тестирования имеет временные рамки и направлен уже непосредственно на практическую реализацию

Т.е. документы образуют иерархию, где каждый нижестоящий документ детализирует и адаптирует правила, описанные на более высоком уровне, позволяя тем самым сформировать наиболее полные ожидания от тестирования. Конечно же, в реальных условиях эта иерархия модифицируется: в небольших командах документы упрощаются или вовсе не нужны, в командах побольше они могут объединяться или называться как-то по-другому, поэтому не стоит сильно зацикливаться на шаблонах. Вопрос лишь в том, доносит ли документ ту мысль, ради которой он и был задуман или же от первоначальной задумки осталось одно только название
  
Например, если мы говорим про контекст agile, то сразу же могут возникнуть вопросы к тест-плану: _"Какие временные рамки? У нас итеративный процесс, какой тест-план?!"_. В таких условиях тест-план либо сокращается до [одной страницы](https://software-testing.ru/library/testing/test-analysis/2405-the-one-page-test-plan) и фиксирует какие-то общие договорённости _(см. [хороший пример](https://docs.google.com/document/d/153HulxECwK29lJkJmQCE25UTCMgI_gLt-RLxJddmYJc/edit?tab=t.0)_ у _[AGIMA](https://www.agima.ru/blog/analytics/chtoby-sdelat-produkt-kachestvennee-nuzhno-kazhdoe-utro-natoshchak-klikbeyta-ne-budet-optimiziruem-t/))_, либо становится излишней нагрузкой — документацией, которая никому не нужна, но её почему-то необходимо поддерживать. Быть может, тогда лучше сосредоточиться на тестовой стратегии, а для управления тестированием в итерациях использовать что-нибудь более подходящее?

**Квадранты тестирования** — модель, которая визуализирует управление тестами в гибких методологиях, где:

<figure>
<img src="/assets/img/posts/testing-quadrants.jpg" alt="Пример квадрантов тестирования">
<figcaption>Пример из "Agile Testing: A Practical Guide for Testers and Agile Teams"</figcaption>
</figure>

- **Q1** — технологии, поддержка команды _(неспосредственное качества кода: компонентное тестирование и тестирование интеграции компонентов)_
- **Q2** — бизнес, поддержка команды _(работа с требованиями, сценариями и прототипами, функциональное тестирование)_
- **Q3** — бизнес, критика продукта _(исследовательское тестирование, пользовательское приемочное тестирование, удобство использования)_
- **Q4** — технологии, критика продукта _(нефункциональное тестирование, за исключением удобства использования)_

Если какой-либо документ теряет смысл или начинает дублировать другой, возможно, пора пересмотреть его — это будет стоить явно дешевле, чем восстановление репутации команды тестирования спустя какое-то время 👌

На мой взгляд, стратегии, отражающей контекст тестирования продукта, и квадрантов с гиперссылками на ключевые узлы для большинства случаев будет более чем достаточно