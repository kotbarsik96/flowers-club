/*  ======================================== forms.js ================================ */

TextInput: 
    1. Верстка:
    <div class="text-input--standard" data-required data-params="completionMask:\+7 \(...\) ...\-..\-..; numbersOnly:true; typeOnly:\s\(\)\-\+; isStrictCompletionMask:true">
        <div class="text-input__wrapper">
            <input class="auth-modal__input text-input__input" name="signup" type="text" placeholder="+7 ___ ___-__-__">
        </div>
    </div>
    2. data-params:
        1) completionMask:fakeRegExp - где fakeRegExp - это подобная регулярному выражению строка. В ней также как и в регулярном выражении нужно экранировать спецсимволы через "/", но вместо символьных классов (вроде "\d") используются точки, а ограничение на вводимые символы вводится через typeOnly/numbersOnly. Пробел остается пробелом (" ");
            1) isStrictCompletionMask:true - без этой опции completionMask нужен для валидации. С этой опцией completionMask становится шаблоном для ввода, т.е. все символы, кроме "." подставляются автоматически при вводе пользователем значения
        2) numbersOnly:true - можно вводить только числа (/0-9/). Является "синтаксическим сахаром" для typeOnly:0-9;
        3) typeOnly:regExp - настоящее regExp символов, которые разрешено вводить в input. Можно комбинировать с numbersOnly, все работает корректно
        4) isDate:true - указать, что вводится дата. Будет автоматически проверяться корректность ввода дня, месяца и года (если указано maxYear и/или minYear). При некорректных данных произойдет автоисправление
            СЛЕДУЮЩИЕ ПАРАМЕТРЫ БУДУТ ПЕРЕЗАПИСАНЫ ТАКИМ ОБРАЗОМ:
            1) completionMask = "../../....";
            2) isStrictCompletionMask = true;
            3) typeOnly = "/";
            4) numbersOnly = true;
        5) minYear:year или maxYear:year (ТОЛЬКО В СВЯЗКЕ С isDate) - указать минимальный год. Если указать число, будет выставлено оно; если указать знак "-" и число (-20), будет отсчитано 20 лет назад (2023 - 20 = 2003). Аналогично со знаком "+": 2023 + 20 = 2043. Если указать currentYear, будет выставлен текущий год.