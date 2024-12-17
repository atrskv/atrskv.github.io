---
title: SBTM и TBTM
date: 2023-06-24 21:01:31
tags: [exploratory, testing, sbtm, tbtm]
---

Придерживаясь ISTQB, 

> **Исследовательское тестирование** — это неформальный метод проектирования тестов, при котором тестировщик активно контролирует проектирование тестов в то время, как эти тесты выполняются, и использует полученную во время тестирования информацию для проектирования новых и улучшенных тестов

Подчеркну и, возможно, скажу проще, что исследовательское тестирование — это **непрерывный контроль проектирования проверок** какой-либо функциональности **в момент их выполнения**. При этом каждая следующая проверка определяется результатом предыдущей

Думаю, что самый распространенный способ осуществлять такой контроль — это исследовательские туры. Дж. Уиттакер предложил рассматривать тестируемую систему, как набор направлений, по которым мы можем путешествовать, ограничивая маршрут выбранным туром

Только туры далеко не единственный способ контроля, который мы можем применять в работе! Рассмотрим менее популярные, но не менее крутые:

> **Session-Based Test Management (SBTM) или тестирование на основе сеансов (сессий)** — метод контроля исследовательского тестирования, при котором процесс разбивается на периоды определенной длины (например, 90 минут)

Ставим цель, включаем таймер и тестируем

> **Thread-Based Test Management (TBTM) или тестирование на основе цепочек** — метод контроля исследовательского тестирования, при котором возможности системы разбиваются на цепочки активностей, существующие для решения какой-либо задачи пользователя
 
Ограничений по времени нет, в этом случае цепочка — и есть само ограничение

**В общем, если кратко, то просто рисуем таблицу. В ней:**

* цель тура/сессии/цепочки
* наблюдения в виде:
  * Здесь плохо. Возможно, дефект — "При таких-то действиях что-то не работает"
  * Тут тоже не очень. Предложение — "Убрать модальное окно с еще одним подтверждением действия"
- время _(в случае сессии)_
- другая дополнительная информация _(например, окружение)_

Подробнее см. _"[Переводы туров для исследовательского тестирования](https://software-testing.ru/library/testing/testing-for-beginners/2965-exploratory-software-testing)", "[SBTM (session-based test management)](https://tmguru.ru/baza-znanij/protsess-testirovaniya/issledovatelskoe-testirovanie/sbtm-sessionnoe-testirovanie/)" и "[TBTM (thread-based test management)](https://tmguru.ru/baza-znanij/protsess-testirovaniya/issledovatelskoe-testirovanie/tbtm-thread-based-test-management/)"_