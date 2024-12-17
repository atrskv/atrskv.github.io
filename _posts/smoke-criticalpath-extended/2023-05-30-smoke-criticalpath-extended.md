---
title: Классификация тестирования по степени важности
date: 2023-05-30 18:33:31
tags: [fundamentals, testing]
---

Слышал у одного лектора мысль о том, что классификации нужны только для того, чтобы пройти собеседование. [У С. Куликова](https://svyatoslav.biz/software_testing_book/) этих классификаций наберется на целый [постер](http://svyatoslav.biz/wp-pics/software_testing_classification_ru.png). С другой стороны, если не заняться организацией тестов вовремя, совсем скоро в репозитории затеряется и сам их автор. Чтобы поддерживать порядок, я стараюсь использовать, как минимум, одну из самых известных — **по степени важности**

**Думаю, что проект с любой спецификой сочетает в себе:**

- **дымовое тестирование (smoke)** — тесты, которые направлены на проверку основной функциональности. Если они не прошли, то дальше тестировать нет смысла. _Возможно ли вообще купить товар?_
- **тестирование критического пути (critical path)** — ключевые последовательности действий пользователя. При изучении системы, например, с помощью [карты функциональных возможностей](http://okiseleva.blogspot.com/2020/01/mind-map.html), становятся видны самые длинные ветви — это и есть критические пути, которые, кстати, пришли к нам из [одноименного метода управления проектами](https://skillbox.ru/media/management/kak-zavershit-proekt-v-srok-s-pomoshchyu-metoda-kriticheskogo-puti-rasskazyvaem-na-primere/). _Возможно ли купить товар со скидкой, воспользовавшись промокодом?_
- **расширенное тестирование (extended)** — испытания с нестандартным использованием приложения, технологические границы и другие [шутки про тестировщиков](https://avva.livejournal.com/3170578.html). _Что будет, если добавить в корзину какой-нибудь товар в одной вкладке, в другой вкладке его удалить из корзины, а затем в первой вкладке приступить к оформлению заказа?_

Между дымовым и критического пути ещё иногда вклинивают **санитарное тестирование (sanity)**, но в его определении я встречал кучу разночтений. Из самого интересного — [вот эта статья](https://testitquickly.com/2018/06/25/mens-sanita-in-corpore-sanity/). Хороший момент, чтобы подчеркнуть, что понимание каждого из терминов крайне относительно, от команды к команде оно может сильно меняться