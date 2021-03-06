---
layout: post
title:  "Несколько полезных настроек Eclipse для пересевших с IntelliJ IDEA"
date:   2015-05-06 18:33:00
categories: idea eclipse migration pain
---
### Если
у вас случилась такая беда, заказчик оказался специфическим и теперь вам надо срочно освоить Eclipse, то давайте попробуем минимизировать моральный ущерб который вы при этом получите. Заметка основана на моём личном опыте и наверняка не содержит каких-либо аналогов интересных вам фич IntelliJ IDEA. Однако вы можете прислать мне интересные вам настройки в почту <a href="mailto:a.kravets84@gmail.com">*a.kravets84@gmail.com*</a>.


### VCS
и интеграция с ней - важнейший инструмент. Как минимум, он отмечает цветной полоской область измененного, добавленного или удаленного текста. Эта функциональность есть в Eclipse для JEE разработки из коробки, но нуждается в настройке под нужды программиста. Зайдём в *Preferences->General->Editors->Text Editors->Quick Diff*. Если функция отключена - включаем, а также отмечаем галочку **Show differences in overview ruller**. Лично я также изменяю цвета на отдаленно напоминающие идеевские. Осталось ещё одно, но весьма важное: указать источник данных о версиях. В поле подписанном **Use this reference source** выбираем милую сердцу систему. В моём случае это GIT.

![Quick Diff Settings][qd]

*Примерно так должны выглядеть настройки Quick Diff*

![Quick Diff In Action][qds]

*А так выглядит результат*


### Оптимизация импортов
это одна из вещей которые я принимал как данность и никогда не делал в IDEA вручную. Оказалось эта фича тоже есть в Eclipse, но по умолчанию выключена. Кроме того отрабатывает она не при коммите, как в IDEA, а при сохранении файла. Что-же, мне всё равно, лишь бы делало своё дело. Итак, **Save Actions**! заходим в *Preferences->Java->Editor->Save actions*, включаем галочку **Perform the selected actions on save**, а также **Organize imports**. Надо упомянуть, что в этой секции настроек есть еще и опция форматирования исходника. Поскольку работаю не один, а в команде, я включаю ее только для измененных строк, иначе может получиться большой diff с бесполезными изменениями.

![Save actions dialog][sa1]

*Мои настройки Save actions*

### Множественные буферы обмена
это фича которую можно не сразу обнаружить. Однажды мне стало любопытно, не реализована ли эта функция в Идее. По своему обыкновению я попробовал нажать первую пришедшую в голову комбинацию клавиш и очень обрадовался, увидев, что угадал. *Ctrl+Shift+V* с тех пор для меня - комбинация без которой сложно жить. Решением проблемы отсутствия этой функции в Eclipse из коробки стал плагин **PDE Tools**. Из завершающей название буквы *s* можно сдеать вывод, что это не единственная функция, реализованная плагином. И это так. Особо стоит отметить  *Crazy Outline* - панель реализующую подобие *Minimap* в *Sublime Text*.

![PDE Tools multiple clipboards paste window][pde1]

*Так выглядит окно вставки* 

### Та полоска на 80 символе,
 ну которая для ориентации в длине вашего кода. Она полезна. Включается ... Print Margin.

На этом необходимые для комфорта при работе в Eclipse функции будем считать настроеными. Если кто-то думает иначе, приглашаю прислать мне ваше мнение по адресу в начале заметки. Спасибо за внимание!


[qd]:/img/quickdiff.png
[qds]:/img/quickdiff-sample.png
[sa1]:/img/saveactions.png
[pde1]:/img/pde.png
