---
title: Об определении бага
date: 2023-05-21 14:45:50
tags: [bug, fundamentals, testing]
---

> **Баг** — это отклонение фактического результата от ожидаемого

К сожалению, неполные требования часто приводят к отсутствию ожидаемого результата, наличие только лишь самих требований при тестировании — к отсутствию фактического. Ну и если формально проблем нет, а пользователь в который раз недоволен, то разве система идеальна с точки зрения обеспечения качества?

**Парадигма ISTQB насчитывает несколько определений, схожих с багом:**

1. **Ошибка** — действие человека, которое приводит к неправильному результату _(например, то, что привело к дефекту)_
2. **Дефект** (или баг) — недостаток рабочего продукта, проявляющийся в несоответствии требованиям или спецификациям _(скрытый отказ)_
3. **Отказ** — событие, при котором компонент или система не выполняет требуемую функцию в соответствии со спецификацией _(проявление дефекта)_
4. **Аномалия** — любое состояние, отличающееся от ожидаемого _(вообще не встречал, чтобы этот термин хоть где-то использовался за рамками их глоссария)_

И, наконец, теперь мы можем говорить: "Вот ошибка, вот дефект, а вот отказ", путая всех непосвященных... 

Если же с адептами ISTQB не по пути, поделюсь еще одним определением, которое когда-то встретил у Ольги Назиной. Сама Ольга ссылается на Джеймса Баха, который, в свою очередь, ссылается на Джерри Вайнберга:

> **Баг** — это проблема для тех лиц, чье мнение имеет для нас значение

Оно не только учитывает замечания, перечисленные выше, но и подчеркивает значение конечного пользователя, о котором в процессе выполнения своих задач все могли забыть 😞