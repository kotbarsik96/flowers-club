<?php

/*
    Plugin Name: AJAX запросы
*/
// создает NONCE для пользователя, который затем отправляется на фронтенд. При запросе этот NONCE проверяется через ajax_check_user_nonce, чтобы продолжить действие
function ajax_get_user_nonce()
{
    return strval(get_current_user_id()) . USER_NONCE_SALT;
}

function ajax_check_user_nonce($nonce = null)
{
    if (empty($nonce)) {
        $nonce = $_POST['userNonce'] ?? null;
        if (empty($nonce))
            return false;
    }
    $nonce_action = ajax_get_user_nonce();
    return wp_verify_nonce($nonce, $nonce_action);
}

function gen_pass()
{
    $chars = '-#$!%^&*;.qazxswedcvfrtgbnhyujmkiolp1234567890QAZXSWEDCVFRTGBNHYUJMKIOLP';
    $chars_split = mb_str_split($chars);
    $count = count($chars_split);
    $length = random_int(10, 20);

    $pass = '';
    for ($i = 0; $i < $length; $i++) {
        $j = random_int(0, $count - 1);
        $char = $chars_split[$j];
        $pass .= $char;
    }
    while (!preg_match('/[-#$!%^&*;.]/', $pass)) {
        $pass = gen_pass();
    }
    return $pass;
}

// ожидается, что в $file будет массив, у которого есть ключ 'size', в котором лежит значение размера файла в байтах
function check_load_file_size($maxsize_mb = 10, $file = [])
{
    if (empty($file['size']))
        return false;

    $file_size = (int) $file['size'];
    $file_size_mb = $file_size / 1024 / 1024;
    if ($maxsize_mb < $file_size)
        return true;
    return false;
}

if (wp_doing_ajax()) {
    // проверяет, что в $_POST выставлены все нужные ключи из $req_keys
    function ajax_check_required_data($req_keys = [])
    {
        foreach ($req_keys as $key) {
            if (empty($_POST[$key]))
                return false;
        }
        return true;
    }

    // загрузить посты по переданной категории
    add_action('wp_ajax_load_posts_by_category', 'load_posts_by_category');
    add_action('wp_ajax_nopriv_load_posts_by_category', 'load_posts_by_category');
    function load_posts_by_category()
    {
        function get_total_posts_number($category)
        {
            $args = [
                'nopaging' => true
            ];
            if ($category !== "all")
                $args['category_name'] = $category;

            $query = new WP_Query($args);
            return (int) $query->found_posts;
        }

        // получить переданные POST методом данные. Некоторые переменные будут использованы в posts-template.php
        $category = $_POST['category'];
        $ajaxQueryType = $_POST['ajaxQueryType'];
        $postsPerPage = $_POST['postsPerPage'];
        // константа нужна, т.к. postsPerPage будет изменена на значение, которое необходимо будет вставить в запрос WP_Query. CYCLE_POSTS_PER_PAGE отображает требуемое количество постов лишь за один запрос
        define('CYCLE_POSTS_PER_PAGE', $_POST['postsPerPage']);
        $postsTotalNumber = isset($_POST['postsTotalNumber'])
            ? (int) $_POST['postsTotalNumber'] : get_total_posts_number($category);
        $loadedPostsNumber = isset($_POST['loadedPostsNumber'])
            ? (int) $_POST['loadedPostsNumber'] : 0;
        $noMorePosts = false;

        if ($ajaxQueryType === "initial") {
            $pageNumber = 1;
        }
        if ($ajaxQueryType === "concat") {
            $pageNumber = ceil($loadedPostsNumber / $postsPerPage) + 1;
        }
        if ($ajaxQueryType === "pastInitial") {
            $pageNumber = 1;
            $postsPerPage = $loadedPostsNumber;
        }

        $diff = $postsTotalNumber - ($loadedPostsNumber + $postsPerPage);
        if ($diff <= 0)
            $noMorePosts = true;

        // получить html постов в переменную $content
        $do_comment_animation = true;
        ob_start();
        include get_stylesheet_directory() . '/html-components/posts-template.php';
        $content = ob_get_clean();

        // сформировать json, отправляемый в ответ на запрос
        $json = [
            'content' => $content,
            'queryLoadedPostsNumber' => $i
        ];
        if ($ajaxQueryType === 'initial') {
            $json['postsTotalNumber'] = $postsTotalNumber;
        }
        if ($noMorePosts)
            $json['noMorePosts'] = true;

        // отправить json
        wp_send_json_success($json);
    }

    class Ajax_Checks
    {
        public function __construct()
        {
            add_action('wp_ajax_is_in_cart', [$this, 'is_in_cart']);
            add_action('wp_ajax_nopriv_is_in_cart', [$this, 'is_in_cart']);

            add_action('wp_ajax_get_cart', [$this, 'get_cart']);
            add_action('wp_ajax_nopriv_get_cart', [$this, 'get_cart']);
        }

        public function is_in_cart()
        {
            if (!is_user_logged_in())
                wp_send_json_error();

            $product_id = array_key_exists('productId', $_POST) ? $_POST['productId'] : null;
            if (!$product_id)
                wp_send_json_error();

            if (find_in_cart($product_id))
                wp_send_json_success();
            else
                wp_send_json_error();
        }

        public function get_cart()
        {
            if (!is_user_logged_in())
                wp_send_json_error();

            if (!ajax_check_user_nonce())
                wp_send_json_error();

            $cart = wc()->cart->get_cart();
            ob_start();
            include get_template_directory() . '/html-components/shop/cart/empty.php';
            $empty_layout = ob_get_clean();
            $json = [
                'cart' => array_values($cart),
                'empty_layout' => $empty_layout
            ];

            wp_send_json_success($json);
        }
    }
    new Ajax_Checks();

    // отвечает за действия по отправке почты
    class Ajax_Email
    {
        public $headers = [
            'From: Flowers Club Mail Service <flcltestmail432@yandex.ru>',
            'content-type: text/html'
        ];

        // генерирует и отправляет код подтверждения. Возвращает значение в виде отправленного кода
        public function send_validation_code($email, $options = [])
        {
            $code = random_int(1000, 9999);
            ob_start();
            include get_template_directory() . '/html-components/email/validation-code.php';
            $code_html = ob_get_clean();

            $subject = array_key_exists('subject', $options) && $options['subject']
                ? $options['subject'] : '';
            wp_mail($email, $subject, $code_html, $this->headers);

            return $code;
        }

        // отправляет пароль на почту
        public function send_password($email, $pass)
        {
            ob_start();
            include get_template_directory() . '/html-components/email/password-recovery.php';
            $pass_html = ob_get_clean();
            wp_mail($email, 'Ваш новый пароль', $pass_html, $this->headers);

            return $pass_html;
        }
    }
    $ajax_email = new Ajax_Email();

    // отвечает за подтверждение по почте: выслать код подтверждения, проверить полученный код и др.
    class Ajax_Validation_Code
    {
        public function __construct()
        {
            add_action('wp_ajax_get_validation_code_layout', [$this, 'get_validation_code_layout']);
            add_action('wp_ajax_nopriv_get_validation_code_layout', [$this, 'get_validation_code_layout']);
        }

        // создает верстку ввода кода подтверждения и отсылает ее на фронтенд; помимо этого создаст сам код и отправит nonce этого кода на фронтенд
        public function get_validation_code_layout()
        {
            global $ajax_email;
            $email = array_key_exists('email', $_POST) ? $_POST['email'] : null; // !possible problem!
            if (empty($email)) // !possible problem!
                wp_send_json_error(); // !possible problem!

            // создать верстку для ввода кода
            $layout = $this->create_validation_code_layout($_POST);
            // создать текст для письма, отправляемого с кодом
            $options = [];
            switch ($_POST['validationType']) {
                case 'signup':
                    $options = [
                        'subject' => 'Ваш код подтверждения',
                        'texts' => [
                            'Вы получили это письмо, так как ваш Email был указан при регистрации на сайте Flowers Club',
                            [
                                'text' => 'Если это были не вы, пожалуйста, удалите это письмо',
                                'style' => 'text-decoration: underline;'
                            ],
                            'Ваш код подтверждения:'
                        ]
                    ];
                    break;
                case 'password-recovery':
                    $options = [
                        'subject' => 'Ваш код подтверждения',
                        'texts' => [
                            [
                                'text' => 'Вы получили это письмо, так как был запрошен сброс пароля для доступа к  вашему профилю на сайте Flowers Club.'
                            ],
                            [
                                'text' => 'Если это были не вы, пожалуйста, удалите это письмо.',
                                'style' => 'text-decoration: underline;'
                            ],
                            [
                                'text' => 'Ваш код подтверждения:'
                            ],
                        ]
                    ];
                    break;
            }
            // создать и отправить код
            $email = sanitize_email($email);
            $code = $ajax_email->send_validation_code($email, $options);
            wp_send_json([
                'layout' => $layout,
                'nonce' => wp_create_nonce($code) // nonce кода (нужен при проверке в $this->verify_code())
            ]);
        }

        // создает верстку ввода кода подтверждения
        public function create_validation_code_layout($options = [])
        {
            if (!array_key_exists('authType', $options))
                $options['authType'] = '';

            ob_start(); ?>

            <div class="auth-code">
                <div class="auth-modal__text">
                    <?php if (preg_match('/auth|signup/', $options['authType'])): ?>
                        На Ваш email отправили код подтверждения, введите его ниже
                        <?php if ($options['authType'] === 'signup'): ?>
                            , чтобы закончить регистрацию
                        <?php elseif ($options['authType'] === "login"): ?>
                            , чтобы войти
                        <?php endif ?>
                    <?php elseif (array_key_exists('text', $options) && $options['text']):
                        echo $options['text']; ?>
                    <?php else: ?>
                        На ваш email отправили код подтверждения, введите его ниже
                    <?php endif ?>
                </div>
                <div class="auth-modal__auth-code auth-code__inputs">
                    <div class="error">Неверно указан код подтверждения</div>
                </div>
                <button class="auth-modal__button auth-code__confirm button" id="apply-code" type="button">
                    Подтвердить
                </button>
                <div class="auth-modal__offer">
                    <button class="link auth-modal__offer-back" type="button">
                        Вернуться назад
                    </button>
                </div>
            </div>

            <?php return ob_get_clean();
        }

        // проверяет код
        public function verify_code($data = null)
        {
            if (empty($data))
                $data = $_POST;
            if (!is_array($data))
                $data = $_POST;

            $nonce = array_key_exists('nonce', $data) ? $data['nonce'] : null;
            $code = array_key_exists('code', $data) ? (int) $data['code'] : null;
            if (empty($nonce) || empty($code))
                return false;

            return wp_verify_nonce($nonce, $code);
        }
    }
    $ajax_validation_code = new Ajax_Validation_Code();

    // отвечает за запросы авторизации пользователя: вход/регистрация/выход, проверка введенных данных
    class Ajax_User_Auth_Actions
    {
        public function __construct()
        {
            add_action('wp_ajax_validate_signup', [$this, 'validate_signup']);
            add_action('wp_ajax_nopriv_validate_signup', [$this, 'validate_signup']);

            add_action('wp_ajax_validate_login', [$this, 'validate_login']);
            add_action('wp_ajax_nopriv_validate_login', [$this, 'validate_login']);

            add_action('wp_ajax_confirm_signup_code', [$this, 'confirm_signup_code']);
            add_action('wp_ajax_nopriv_confirm_signup_code', [$this, 'confirm_signup_code']);

            add_action('wp_ajax_user_logout', [$this, 'user_logout']);

            add_action('wp_ajax_check_password', [$this, 'check_password']);

            add_action('wp_ajax_check_email_exists', [$this, 'check_email_exists']);
            add_action('wp_ajax_nopriv_check_email_exists', [$this, 'check_email_exists']);

            add_action('wp_ajax_nopriv_recovery_password', [$this, 'recovery_password']);
        }

        // проверить, насколько корректен пароль с точки зрения необходимых символов и длины
        function validate_password($pass = null)
        {
            if (empty($pass))
                return false;

            $regexps = [
                '/[a-z]/',
                '/[A-Z]/',
                '/[0-9]/',
                '/[-#$!%^&*;.@]/'
            ];
            $minlength = 8;
            $maxlength = 50;
            $length = strlen($pass);
            if ($length < $minlength || $length > $maxlength)
                return false;

            foreach ($regexps as $regexp) {
                if (!preg_match($regexp, $pass))
                    return false;
            }
            return true;
        }

        // создать разметку успешного действия по авторизации/регистрации
        public function create_success_auth_html($type = '')
        {
            ob_start(); ?>

            <div class="auth-modal__info">
                Отлично,
                <?php if ($type === "signup"): ?>
                    регистрация прошла
                <?php elseif ($type === 'login'): ?>
                    авторизация прошла
                <?php else: ?>
                    действие прошло
                <?php endif ?>
                успешно. Сейчас страница будет перезагружена
            </div>

            <?php return ob_get_clean();
        }

        // обработать данные регистрации нового пользователя (имя, почта, пароль)
        public function validate_signup()
        {
            $name = $_POST['user_name'];
            $email = $_POST['email']; // !possible problem!
            $pass = $_POST['password'];
            if (empty($name) || empty($pass) || empty($pass))
                wp_send_json_error();
            $incorrects = [];

            if (strlen($name) < 1)
                $incorrects['user_name'] = true;
            if (!sanitize_email($email))
                $incorrects['email'] = true;
            if (!$this->validate_password($pass))
                $incorrects['password'] = true;
            if (email_exists($email)) // !possible problem!
                $incorrects['email_exists'] = true; // !possible problem!
            if (email_exists($_POST['email']))
                $incorrects['email_exists'] = true;

            if (count($incorrects) > 0)
                wp_send_json($incorrects);
            else {
                global $ajax_validation_code, $ajax_email;

                $json = [
                    'isValid' => true,
                ];
                wp_send_json($json);
            }
        }

        // обработать вход пользователя в аккаунт
        public function validate_login()
        {
            $login = $_POST['login'];
            $pass = $_POST['password'];
            if (empty($login) || empty($pass))
                wp_send_json_error();

            $user = wp_signon([
                'user_login' => $login,
                'user_password' => $pass,
                'remember' => true
            ]);

            if (is_wp_error($user)) {
                wp_send_json_error([
                    'error' => $user->get_error_message()
                ]);
            }

            wp_send_json_success([
                'content' => $this->create_success_auth_html('login')
            ]);
        }

        // обработать подтверждение кода
        public function confirm_signup_code()
        {
            global $ajax_validation_code;
            $authType = $_POST['authType'];
            $is_confirmed = $ajax_validation_code->verify_code();

            if ($is_confirmed) {
                $user_name = array_key_exists('user_name', $_POST) ? $_POST['user_name'] : null;
                $email = array_key_exists('email', $_POST) ? $_POST['email'] : null;
                $pass = array_key_exists('password', $_POST) ? $_POST['password'] : null;
                if (empty($user_name) || empty($email) || empty($pass))
                    wp_send_json_error();

                $user_id = wp_insert_user([
                    'user_login' => $email,
                    'user_email' => $email,
                    'user_pass' => $pass,
                    'meta_input' => [
                        'first_name' => $user_name
                    ]
                ]);

                if (is_wp_error($user_id))
                    wp_send_json_error();

                $login = wp_signon([
                    'user_login' => $email,
                    'user_password' => $pass,
                    'remember' => true
                ]);
                wp_send_json_success([
                    'content' => $this->create_success_auth_html($authType),
                    'res' => $login,
                    'name' => $user_name
                ]);
            } else {
                wp_send_json_error();
            }
        }

        // выйти из аккаунта
        public function user_logout()
        {
            wp_logout();
        }

        // проверить, верно ли введен пароль
        public function check_password()
        {
            if (!ajax_check_user_nonce())
                wp_send_json_error();

            $pass = array_key_exists('password', $_POST) ? $_POST['password'] : null;
            if (empty($pass))
                wp_send_json_error();

            $user_data = get_userdata(get_current_user_id());
            if (!$user_data)
                wp_send_json_error();

            $current_password = $user_data->user_pass;
            $is_correct_pass = wp_check_password($pass, $current_password);

            if ($is_correct_pass)
                wp_send_json_success();

            wp_send_json_error();
        }

        // сбросить пароль и отправить на почту новый. Метод ожидает, что ранее был отправлен проверочный код на почту, поэтому она воспользуется проверкой этого кода
        public function recovery_password()
        {
            global $ajax_validation_code, $ajax_email;
            // проверить код
            if (!$ajax_validation_code->verify_code())
                wp_send_json_error(['error' => 'incorrect_code']);

            // проверить, что пользователь с указанным email существует
            $user = $this->get_user_by_email();
            if (!$user)
                wp_send_json_error(['error' => 'no_email']);

            // сгенерировать новый пароль и присвоить его пользователю
            $new_pass = gen_pass();
            wp_update_user([
                'ID' => $user->ID,
                'user_pass' => $new_pass
            ]);

            $email = $user->user_email; // !possible problem!
            // отослать новый пароль на почту
            $ajax_email->send_password($email, $new_pass);

            ob_start(); ?>
            <div class="auth-modal__info">
                <div>
                    Отлично, новый пароль отправлен на почту. Вы сможете поменять пароль, перейдя на страницу профиля
                </div>
                <div class="auth-modal__offer">
                    <a href="<?= get_permalink(FLCL_LOGIN_PAGE) ?>" class="link">
                        Войти
                    </a>
                </div>
            </div>
            <?php
            $innerhtml = ob_get_clean();

            wp_send_json_success([
                'innerhtml' => $innerhtml
            ]);
        }

        // проверяет, есть ли пользовтель с таким email и отсылает результат на фронтенд
        public function check_email_exists()
        {
            $email = array_key_exists('email', $_POST) ? $_POST['email'] : '';
            if (empty($email))
                wp_send_json_error();

            $email = sanitize_email($email);

            if ($this->get_user_by_email($email))
                wp_send_json_success();

            wp_send_json_error();
        }

        public function get_user_by_email($email = null)
        {
            if (empty($email))
                $email = array_key_exists('email', $_POST) ? $_POST['email'] : null;
            if (empty($email))
                return false;

            $user = get_user_by('email', $email);
            if ($user)
                return $user;

            return false;
        }
    }
    $ajax_user_auth_actions = new Ajax_User_Auth_Actions();

    /* используется для сохранения настроек в профиле. При вызове метода launch() методы данного класса вызываются по очереди; те, которые проводят валидацию, могут вызвать wp_send_json_error, что прекратит дальнейшее выполнение скрипта и вернет данные об ошибке на фронтенд.
    при вызове экземпляра нужно указать 
    $required_fields - обязательные поля, необязательно
    $additional_required_checks - дополнительные проверки по обязательным полям (подробнее описано над методом check_required_fields), необязательно
    $update_keys - ключи, по которым из $_POST будут получены данные и по ним же в базу данных в мета-таблицу пользователя или в саму таблицу пользователя будут записаны новые данные, обязателен
    */
    class Apply_Account_Settings
    {
        public $required_fields = [];
        public $additional_required_checks = [];
        public $update_keys = [];

        public function __construct($options = [])
        {
            $this->required_fields = $options['required_fields'] ?? [];
            $this->additional_required_checks = $options['additional_required_checks'] ?? [];
            $this->update_keys = $options['update_keys'] ?? [];

            if (count($this->update_keys) < 1)
                wp_send_json(0);
        }

        public function launch()
        {
            $this->check_auth_with_nonce();
            $this->check_required_fields();
            $this->update_db();
        }

        /* проверить авторизацию и nonce
         */
        public function check_auth_with_nonce()
        {

            if (!is_user_logged_in() || !ajax_check_user_nonce()) {
                wp_send_json_error(['error' => 'Неизвестная ошибка']);
            }
        }

        /* проверить, заполнены ли все обязательные поля 
        если есть хоть одно незаполненное обязательное поле, прекратить выполнение и отослать ответ, какие поля не заполнены
        в $additional указываются доп.проверк: для email, длины строки или regexp в таком формате:
            'user_phone' => [
                'check_type' => 'regexp',
                'regexp' => '/\+7 \(\d\d\d\) \d\d\d\-\d\d\-\d\d/'
            ]
        подробнее в блоке, помеченном как "проверка дополнительных параметров", там можно найти 'check_type' и второй аргумент (в данном случае это regexp) для каждого доступного варианта
    */
        public function check_required_fields()
        {
            $failed_validation = $this->get_invalid_fields();
            if (count($failed_validation) > 0) {
                wp_send_json_error([
                    'failed_validation' => $failed_validation
                ]);
                return;
            }
        }

        public function get_invalid_fields()
        {
            $failed_validation = [];
            $additional = $this->additional_required_checks;
            foreach ($this->required_fields as $field_name => $field_title) {
                if (!isset($_POST[$field_name])) {
                    $failed_validation[] = $field_title;
                    continue;
                }

                // проверка дополнительных параметров
                if (isset($additional[$field_name])) {
                    $val = $_POST[$field_name];
                    switch ($additional[$field_name]['check_type']) {
                        case 'email':
                            if (!sanitize_email($val))
                                $failed_validation[] = $field_title;
                            break;
                        case 'length':
                            $required_length = intval($additional[$field_name]['required_length']) ?? 2;
                            if (strlen($val) < $required_length)
                                $failed_validation[] = $field_title;
                            break;
                        case 'regexp':
                            $regexp = $additional[$field_name]['regexp'];
                            if (!preg_match($regexp, $val))
                                $failed_validation[] = $field_title;
                            break;
                    }
                }
            }
            return $failed_validation;
        }

        /* занести в базу данных
        в $update_keys указываются ключи, по которым нужно заносить в бд. Данные по этим ключам берутся из $_POST[]
        в основном все записывается в мета-таблицу, но такие записи, как email, записываются напрямую в таблицу пользователя и помечаются значением 'is_not_meta' => true. Допустимо указывать значения массива в следующих- форматах: 
        1. Когда нужно указать доп.параметры, указывается в виде массива. "key" здесь обязательно!
        [
            'key' => 'user_email',
            'is_not_meta' => true
        ],
        2. Когда нужно указать только то, откуда данные забирать:
        'first_name'
    */
        public function update_db()
        {
            $user_id = get_current_user_id();
            $update_keys = $this->update_keys;
            foreach ($update_keys as $key => $key_or_array) {
                if (is_array($key_or_array)) {
                    $key = isset($key_or_array['key']) ? $key_or_array['key'] : '';
                } else {
                    $key = $key_or_array;
                }

                if (!isset($_POST[$key])) {
                    delete_user_meta($user_id, $key);
                    continue;
                }

                $value_raw = $_POST[$key];

                if (is_array($key_or_array)) {
                    if (!empty($key_or_array['maxlength'])) {
                        $maxlength = (int) $key_or_array['maxlength'];
                        if (mb_strlen($value_raw) > $maxlength)
                            continue;
                    }
                    if (!empty($key_or_array['is_usda_zone'])) {
                        global $usda_zones;
                        $user_usda_zone = (int) $value_raw;
                        if ($user_usda_zone < 0 || $user_usda_zone > 12)
                            continue;
                    }
                    if (!empty($key_or_array['sanitize_email'])) {
                        $value_raw = sanitize_email($value_raw);
                    }
                }

                $value = sanitize_text_field($_POST[$key]);
                delete_user_meta($user_id, $key);
                if ($value)
                    update_user_meta($user_id, $key, $value);
            }
        }
    }
    // отвечает за запросы применения настроек профиля: смена аватара/адреса доставки/настроек пользователя. Этот класс работает в связке с Apply_Account_Settings
    class Ajax_User_Settings
    {
        public function __construct()
        {
            add_action('wp_ajax_load_avatar', [$this, 'load_avatar']);

            add_action('wp_ajax_apply_profile_settings', [$this, 'apply_profile_settings']);

            add_action('wp_ajax_apply_user_shipment_address', [$this, 'apply_user_shipment_address']);

            add_action('wp_ajax_change_password', [$this, 'change_password']);
        }

        // загрузить аватар
        public function load_avatar()
        {
            // require_once ABSPATH . 'wp-admin/includes/image.php';
            // require_once ABSPATH . 'wp-admin/includes/file.php';
            // require_once ABSPATH . 'wp-admin/includes/media.php';

            // проверить NONCE
            if (!ajax_check_user_nonce()) {
                wp_send_json_error([
                    'error_text' => 'Произошла ошибка при загрузке изображения профиля'
                ]);
                return false;
            }

            $img_name = $_FILES['img']['name'];
            $extension = pathinfo($img_name, PATHINFO_EXTENSION);

            // проверить, что у изображения допустимое расширение
            if ($img_name && preg_match('/png|jpe{0,1}g/', $extension)) {
                // загрузить изображение и получить id
                $attachment_id = media_handle_upload('img', 0);
                if (is_wp_error($attachment_id)) {
                    wp_send_json_error($attachment_id);
                    return false;
                }
                // если изображение загружено успешно, обновить мета запись у пользователя
                else {
                    // SUA_USER_META_KEY
                    $attachment_url = wp_get_attachment_url($attachment_id);
                    $user_id = get_current_user_id();
                    delete_user_meta($user_id, SUA_USER_META_KEY);
                    add_user_meta($user_id, SUA_USER_META_KEY, $attachment_id);

                    wp_send_json_success([
                        'attachmentId' => $attachment_id,
                        'attachmentUrl' => $attachment_url
                    ]);
                    return true;
                }
            } else {
                wp_send_json_error([
                    'error_text' => 'Загружено недопустимое расширение изображения. Допустимы следующие: .png, .jpg'
                ]);
                return false;
            }
        }

        // изменить настройки профиля
        public function apply_profile_settings()
        {
            $required_fields = [
                'first_name' => "имя",
                'user_email' => "email",
                'user_phone' => 'телефон'
            ];
            $apply_account_settings = new Apply_Account_Settings([
                'required_fields' => $required_fields,
                'additional_required_checks' => [
                    'user_email' => [
                        'check_type' => 'email'
                    ],
                    'user_phone' => [
                        'check_type' => 'regexp',
                        'regexp' => '/\+7 \(\d\d\d\) \d\d\d\-\d\d\-\d\d/'
                    ],
                    'user_name' => [
                        'check_type' => 'length',
                        'required_length' => 2
                    ]
                ],
                'update_keys' => [
                    [
                        'key' => 'user_email',
                        'is_not_meta' => true,
                        'sanitize_email' => true
                    ],
                    [
                        'key' => 'user_about',
                        'maxlength' => 200
                    ],
                    [
                        'key' => 'user_usda_zone',
                        'is_usda_zone' => true
                    ],
                    'first_name',
                    'last_name',
                    'patronymic_name',
                    'user_gender',
                    'user_birthdate',
                    'user_phone',
                    'user_city',
                    'user_gardening_experience_since',
                    'user_gender',
                    'user_personal_data_proccessing_agreed',
                    'user_mailing_agreed',
                    'user_gardening_conditions',
                    'user_soil',
                    'user_show_last_name',
                    'user_favorite_plants'
                ]
            ]);

            $apply_account_settings->launch();
            // отправить ответ, что все было выполнено успешно
            wp_send_json_success();
        }

        // изменить адрес доставки
        function apply_user_shipment_address()
        {
            $required_fields = [
                'user_shipment_location' => 'населенный пункт',
                'user_shipment_street' => 'улица',
                'user_shipment_house' => 'дом',
                'user_shipment_flat' => 'квартира',
                'user_shipment_mail_index' => 'индекс',
            ];
            $apply_account_settings = new Apply_Account_Settings([
                'required_fields' => $required_fields,
                'update_keys' => [
                    'user_shipment_location',
                    'user_shipment_street',
                    'user_shipment_house',
                    'user_shipment_flat',
                    'user_shipment_frame',
                    'user_shipment_mail_index'
                ]
            ]);

            $apply_account_settings->launch();
            // отправить ответ, что все было выполнено успешно
            wp_send_json_success();
        }

        // изменить пароль
        public function change_password()
        {
            if (!ajax_check_user_nonce())
                wp_send_json_error();

            $new_password = array_key_exists('password', $_POST) ? $_POST['password'] : '';
            $new_password_repeat = array_key_exists('passwordRepeat', $_POST)
                ? $_POST['passwordRepeat'] : '';

            $new_password = sanitize_text_field($new_password);
            $new_password_repeat = sanitize_text_field($new_password_repeat);

            global $ajax_user_auth_actions;
            $is_valid_password = $ajax_user_auth_actions->validate_password($new_password);
            if (!$is_valid_password || empty($new_password) || empty($new_password_repeat))
                wp_send_json_error(['error' => 'invalid_password']);

            $no_repeat = $new_password !== $new_password_repeat;
            if ($no_repeat)
                wp_send_json_error(['error' => 'no_repeat_passwords']);

            $user_data = get_userdata(get_current_user_id());
            $current_password_hash = $user_data->user_pass;
            $repeats_current = wp_check_password($new_password, $current_password_hash);

            if ($repeats_current)
                wp_send_json_error(['error' => 'repeats_current']);

            $result = wp_update_user([
                'ID' => $user_data->ID,
                'user_pass' => $new_password
            ]);
            if (is_wp_error($result))
                wp_send_json_error();

            wp_send_json_success();
        }
    }
    $ajax_user_settings = new Ajax_User_Settings();

    /*  используется для обработки действий пользователя, вроде "добавить в избранное"
     */
    class Ajax_User_Actions
    {
        public function __construct()
        {
            add_action('wp_ajax_article_to_favorites', [$this, 'article_to_favorites']);
            add_action('wp_ajax_nopriv_article_to_favorites', [$this, 'article_to_favorites']);

            add_action('wp_ajax_toggle_article_like', [$this, 'toggle_article_like']);

            add_action('wp_ajax_product_to_favorites', [$this, 'product_to_favorites']);
            add_action('wp_ajax_nopriv_product_to_favorites', [$this, 'product_to_favorites']);

            add_action('wp_ajax_product_to_cart', [$this, 'product_to_cart']);
            add_action('wp_ajax_nopriv_product_to_cart', [$this, 'product_to_cart']);

            add_action('wp_ajax_remove_from_cart', [$this, 'remove_from_cart']);

            add_action('wp_ajax_sync_cart', [$this, 'sync_cart']);

            add_action('wp_ajax_update_product_rating', [$this, 'update_product_rating']);
            add_action('wp_ajax_nopriv_update_product_rating', [$this, 'update_product_rating']);

            add_action('wp_ajax_update_product_rating', [$this, 'update_product_rating']);
            add_action('wp_ajax_nopriv_update_product_rating', [$this, 'update_product_rating']);

            add_action('wp_ajax_remove_user_product_rating', [$this, 'remove_user_product_rating']);
        }

        // добавить/убрать что-либо из избранного
        public function toggle_favorites($item_id, $meta_key)
        {
            if (!is_user_logged_in())
                wp_send_json_error(['error' => 'not_logged_in']);

            if (!ajax_check_user_nonce())
                wp_send_json_error();

            $user_id = get_current_user_id();
            $favorite_items = get_userdata($user_id)->$meta_key ?? '';
            $favorite_items = $favorite_items
                ? explode(',', $favorite_items)
                : [];
            $action = '';

            // убрать из избранного
            if (in_array($item_id, $favorite_items)) {
                $key = array_search($item_id, $favorite_items);
                unset($favorite_items[$key]);
                $action = 'removed';
            }
            // добавить в избранное
            else {
                $favorite_items[] = $item_id;
                $action = 'added';
            }
            $res = update_user_meta($user_id, $meta_key, implode(",", $favorite_items));

            if ($res && !is_wp_error($res)) {
                wp_send_json_success([
                    'action' => $action
                ]);
            } else {
                wp_send_json_error();
            }
        }

        // добавить в избранное статью
        public function article_to_favorites()
        {
            $article_id = $_POST['articleId'];
            $this->toggle_favorites($article_id, FAVORITE_ARTICLES_KEY);
        }

        // удалить/поставить лайк статье
        public function toggle_article_like()
        {
            if (!ajax_check_user_nonce())
                wp_send_json_error();

            global $posts_likes;
            $post_id = $_POST['postId'];
            $user_id = get_current_user_id();
            $has_like = $posts_likes->has_like($post_id, $user_id);

            $result = false;
            if ($has_like) {
                $result = $posts_likes->remove_like($post_id, $user_id);
            } else {
                $result = $posts_likes->add_like($post_id, $user_id);
            }

            if ($result) {
                wp_send_json_success([
                    'has_like' => !$has_like
                ]);
            } else
                wp_send_json_error();
        }

        // добавить в избранное товар
        public function product_to_favorites()
        {
            $product_id = $_POST['productId'];
            $this->toggle_favorites($product_id, FAVORITE_PRODUCTS_KEY);
        }

        // добавить/убрать в/из корзину(ы) товар (через кнопку в товаре)
        public function product_to_cart()
        {
            if (!is_user_logged_in())
                wp_send_json_error(['error' => 'not_logged_in']);

            if (!ajax_check_user_nonce())
                wp_send_json_error();

            $product_id = array_key_exists('productId', $_POST) ? $_POST['productId'] : null;

            $in_cart = find_in_cart($product_id);
            // убрать из корзины
            if ($in_cart) {
                wc()->cart->remove_cart_item($in_cart['key']);
                wp_send_json_success(['action' => 'removed']);
            }
            // добавить в корзину
            else {
                $product = wc_get_product($product_id);
                $quantity = array_key_exists('quantity', $_POST) ? (int) $_POST['quantity'] : null;
                if (empty($product_id) || empty($quantity) || !$product)
                    wp_send_json_error();


                $stock_quantity = (int) $product->get_stock_quantity();
                $is_more_than_in_stock = $stock_quantity < $quantity;
                if ($is_more_than_in_stock) {
                    wp_send_json_error([
                        'error' => 'more_than_in_stock',
                        'quantity' => $stock_quantity
                    ]);
                }

                wc()->cart->add_to_cart($product_id, $quantity);
                $in_cart = find_in_cart($product_id);

                wp_send_json_success([
                    'action' => 'added',
                    'quantity' => $in_cart['quantity']
                ]);
            }
        }

        // удалить из корзины товар (через страницу корзины)
        public function remove_from_cart()
        {
            if (!ajax_check_user_nonce())
                wp_send_json_error();

            $cart_item_key = array_key_exists('cartItemKey', $_POST) ? $_POST['cartItemKey'] : null;
            if (!$cart_item_key)
                wp_send_json_error();

            $res = wc()->cart->remove_cart_item($cart_item_key);
            if ($res) {
                wp_send_json_success();
            } else
                wp_send_json_error();
        }

        // синхронизировать состояние корзины с фронтенда с бэкендом (вызывается при изменении количества товара в корзине)
        public function sync_cart()
        {
            if (!ajax_check_user_nonce())
                wp_send_json_error();

            $items_data = array_key_exists('data', $_POST) ? $_POST['data'] : null;
            if (empty($items_data))
                wp_send_json_error();

            // текущие данные в корзине
            $cart_methods = wc()->cart;
            $cart = $cart_methods->get_cart();
            // обновленные данные (с фронтенда)
            $items_data = json_decode(stripslashes($items_data), true);

            $errors = [];

            foreach ($cart as $cart_item) {
                // найти обновленный элемент
                $updated_data = flcl_array_find(
                    $items_data,
                    fn($u_d) => $u_d['key'] === $cart_item['key']
                );
                if (empty($updated_data))
                    continue;

                // если не совпадают количества,
                if ($updated_data['quantity'] !== $cart_item['quantity']) {
                    // посмотреть, есть ли в наличии выставленное новое количество
                    $product = wc_get_product($cart_item['product_id']);
                    $stock_quantity = $product->get_stock_quantity();

                    // если в наличии нет,
                    if ((int) $updated_data['quantity'] > (int) $stock_quantity) {
                        // записать ошибку и доступное количество (будет отправлено в ответ)
                        $errors[] = [
                            'cart_item_key' => $updated_data['key'],
                            'error' => 'more_than_in_stock',
                            'stock_quantity' => $stock_quantity
                        ];

                        $cart_methods->set_quantity($updated_data['key'], $stock_quantity);
                    }
                    // если в наличии есть
                    else
                        $cart_methods->set_quantity($updated_data['key'], $updated_data['quantity']);
                }
            }

            if (count($errors) > 0)
                wp_send_json_error(['errors' => $errors]);

            wp_send_json_success();
        }

        // изменить оценку товара 
        public function update_product_rating()
        {
            if (!is_user_logged_in())
                wp_send_json_error(['error' => 'not_logged_in']);
            if (!ajax_check_user_nonce())
                wp_send_json_error();

            $product_id = array_key_exists('productId', $_POST) ? $_POST['productId'] : null;
            $user_id = get_current_user_id();
            $rating_value = array_key_exists('ratingValue', $_POST) ? (int) $_POST['ratingValue'] : null;
            if (empty($product_id) || empty($user_id) || empty($rating_value))
                wp_send_json_error();

            $product = wc_get_product($product_id);
            if (!$product)
                wp_send_json_error();

            global $product_user_ratings;
            $product_user_ratings->update_rating($product_id, $user_id, $rating_value);
            wp_send_json_success();
        }

        // убрать оценку товара
        public function remove_user_product_rating()
        {
            if (!is_user_logged_in())
                wp_send_json_error(['error' => 'not_logged_in']);
            if (!ajax_check_user_nonce())
                wp_send_json_error();

            $product_id = array_key_exists('productId', $_POST) ? $_POST['productId'] : null;
            $user_id = get_current_user_id();
            if (empty($product_id) || empty($user_id))
                wp_send_json_error();

            global $product_user_ratings;
            $res = $product_user_ratings->remove_rating($product_id, $user_id);
            if ($res)
                wp_send_json_success();
            else
                wp_send_json_error();
        }
    }
    $ajax_user_actions = new Ajax_User_Actions();

    // отвечает за работу с комментариями
    class Ajax_Comments
    {
        // максимально допустимый размер изображения в мегабайтах
        public $maxsize_mb = 5;

        static $required_keys_to_add = [
            'comment_post_id',
            'comment_content'
        ];

        public function __construct()
        {
            add_action('wp_ajax_add_comment', [$this, 'add_comment']);

            add_action('wp_ajax_delete_comment', [$this, 'delete_comment']);

            add_action('wp_ajax_edit_comment', [$this, 'edit_comment']);
        }

        /* загрузит изображения и вернет массив id загруженных изображений 
         */
        public function upload_attached_images()
        {
            // очистит $_FILES от изображений, превышающих лимит, а также от файлов, кроме изображений (type: image/). Поместит все в новый массив
            $attached_images_POST = array_filter($_FILES, function ($data) {
                if (!preg_match('/^image\//', $data['type']))
                    return false;
                if (!check_load_file_size($this->maxsize_mb, $data))
                    return false;
                return true;
            });

            $attached_images_ids = [];
            foreach ($attached_images_POST as $key => $image_data) {
                $id = media_handle_sideload($image_data, 0);
                if ($id && !is_wp_error($id))
                    $attached_images_ids[] = $id;
            }
            return $attached_images_ids;
        }

        /* добавить комментарий
         */
        public function add_comment()
        {
            if (
                !ajax_check_user_nonce()
                || !ajax_check_required_data(self::$required_keys_to_add)
            ) {
                wp_send_json_error();
            }

            $author_id = get_current_user_id();
            $user_data = get_userdata($author_id);
            $author_name = $user_data->user_login;

            $post_id = sanitize_text_field($_POST['comment_post_id']);
            $comment_content = sanitize_text_field($_POST['comment_content']);
            if (empty($comment_content))
                wp_send_json_error();

            $data = [
                'comment_author' => $author_name,
                'comment_author_email' => $user_data->user_email ?? '',
                'comment_author_url' => $user_data->user_url ?? '',
                'comment_post_ID' => $post_id,
                'comment_content' => $comment_content,
                'comment_type' => 'comment',
                'user_id' => $author_id,
                'comment_author_IP' => $_SERVER['REMOTE_ADDR'],
                'comment_agent' => $_SERVER['HTTP_USER_AGENT'],
                'comment_date' => current_time('mysql'),
                // 'comment_date' => '2023-05-11 14:50:44',
                'comment_approved' => 1
            ];

            $attached_images_ids = $this->upload_attached_images();

            $comm_id = wp_insert_comment($data);
            if (count($attached_images_ids) > 0) {
                $attached_images_ids = implode(',', $attached_images_ids);
                update_comment_meta($comm_id, 'attached_images', $attached_images_ids);
            }

            $comm = get_comment($comm_id);
            ob_start();
            include get_stylesheet_directory() . '/html-components/comment.php';
            $comment_layout = ob_get_clean();

            wp_send_json_success([
                'comment_layout' => $comment_layout
            ]);
        }

        // удалить комментарий
        public function delete_comment()
        {
            if (!ajax_check_user_nonce())
                wp_send_json_error();

            $comment_id = $_POST['commentId'];
            $comm = get_comment($comment_id);
            if ((int) $comm->user_id !== get_current_user_id())
                wp_send_json_error();

            $can_delete_this_comment = (int) $comm->user_id === get_current_user_id();
            if (!$can_delete_this_comment)
                wp_send_json_error();

            wp_delete_comment($comment_id);

            wp_send_json_success();
        }

        // редактировать комментарий
        public function edit_comment()
        {
            if (!ajax_check_user_nonce())
                wp_send_json_error();

            $comment_id = $_POST['commentId'];
            $comm = get_comment($comment_id);
            $author_id = (int) $comm->user_id;
            if ($author_id !== get_current_user_id())
                wp_send_json_error();

            // получить id текущих прикрепленных изображений
            $attached_images = get_comment_meta($comment_id, 'attached_images', true);
            $attached_images = explode(',', $attached_images);

            $new_comment_content = array_key_exists('comment_content', $_POST)
                ? sanitize_text_field($_POST['comment_content'])
                : null;
            if (!$new_comment_content)
                wp_send_json_error();

            // данные для обновления комментария
            $comment_update_data = [
                'comment_ID' => $comment_id,
                'comment_content' => $new_comment_content
            ];
            wp_update_comment($comment_update_data);

            // если есть новые изображения, загрузить их и вернуть в массиве $attached_images_ids
            $attached_images_ids = $this->upload_attached_images();

            // если у комментария уже есть прикрепленные изображения, посмотреть и сравнить, какие id пришли в запросе POST. Те изображения, id которых не пришли с запросом, удалить от комментария
            if ($attached_images && array_key_exists('editingAttachments', $_POST)) {
                // получить id изображений, отправленные в запросе
                $attached_images_POST = $_POST['editingAttachments'];
                // получить id текущих прикрепленных изображений
                $attached_images_data = array_map(function ($attachment_id) {
                    $url = wp_get_attachment_url($attachment_id);
                    return [
                        'attachment_id' => $attachment_id,
                        'attachment_url' => $url
                    ];
                }, $attached_images);

                // оставить только те изображения, которые пришли при запросе
                $attachment_images_after_edit = array_filter($attached_images_data, function ($data) {
                    if (in_array($data['attachment_id'], $_POST['editingAttachments']))
                        return true;
                    return false;
                });
                $attachment_images_after_edit = array_map(function ($data) {
                    return $data['attachment_id'];
                }, $attachment_images_after_edit);

                // совместить старые изображения с новыми
                $attached_images_ids = array_merge(
                    $attachment_images_after_edit,
                    $attached_images_ids
                );
            }

            // обновить данные о прикрепленных к комментарию изображениях
            if (count($attached_images_ids) > 0) {
                $attached_images_ids = implode(',', $attached_images_ids);
                update_comment_meta($comment_id, 'attached_images', $attached_images_ids);
            } else {
                update_comment_meta($comment_id, 'attached_images', '');
            }

            // обновить информацию о том, когда был отредактирован комментарий
            update_comment_meta($comment_id, 'last_edited', current_time('mysql'));

            // получить обновленную информацию о комментарии
            $comm = get_comment($comment_id);

            $comm_meta = get_comment_meta($comment_id);

            // получить новые изображения
            ob_start();
            include get_stylesheet_directory() . '/html-components/comment-thumb.php';
            $attached_images_layout = ob_get_clean();

            // отправить в ответ обновленную информацию о комментарии
            wp_send_json_success([
                'comment_content' => $comm->comment_content,
                'comment_last_edited' => get_comment_meta($comment_id, 'last_edited', true),
                'comment_attached_images_layout' => $attached_images_layout
            ]);
        }
    }
    $ajax_comments = new Ajax_Comments();

    // отвечает за поиск по сайту
    class Ajax_Search
    {
        public function __construct()
        {
            add_action('wp_ajax_search', [$this, 'search']);
            add_action('wp_ajax_nopriv_search', [$this, 'search']);
        }

        // поиск по строке. Ищет среди пользователей, товаров, статей и страниц сайта
        public function search()
        {
            $search_query = array_key_exists('searchQuery', $_POST) ? $_POST['searchQuery'] : '';
            if (!$search_query)
                wp_send_json([]);

            global $wpdb;
            $tables_prefix = $wpdb->prefix;
            $search_query = sanitize_text_field($search_query);
            $words = explode(" ", $search_query);
            $words_length = count($words);

            // составить экранированные запросы в БД
            $users_query = "SELECT * FROM {$tables_prefix}usermeta
            WHERE";
            $articles_and_pages_query = "SELECT * FROM {$tables_prefix}posts
            WHERE (post_type = 'post' OR post_type = 'page')
            AND";
            $products_query = "SELECT * FROM ${tables_prefix}posts
            WHERE (post_type = 'product')
            AND";
            $users_params = [];
            $articles_and_pages_params = [];
            $products_params = [];

            // подготовить запросы в БД
            for ($i = 0; $i < $words_length; $i++) {
                $word = $words[$i];
                $users_query .= " (meta_key = 'first_name' AND meta_value LIKE %s) OR (meta_key = 'last_name' AND meta_value LIKE %s) OR (meta_key = 'patronymic_name' AND meta_value LIKE %s)";
                $articles_and_pages_query .= " (post_status = 'publish' AND (post_title LIKE %s OR post_content LIKE %s))";
                $products_query .= " (post_title LIKE %s)";

                for ($j = 0; $j < 3; $j++)
                    $users_params[] = "%{$word}%";
                for ($j = 0; $j < 2; $j++)
                    $articles_and_pages_params[] = "%{$word}%";
                for ($j = 0; $j < 1; $j++)
                    $products_params[] = "%{$word}%";

                if ($i < $words_length - 1) {
                    $users_query .= ' OR';
                    $articles_and_pages_query .= ' OR';
                } elseif ($i === $words_length - 1) {
                    $users_query .= ' LIMIT 10';
                    $articles_and_pages_query .= ' LIMIT 20';
                }
            }

            global $wpdb;
            $users_result = $wpdb->get_results(
                $wpdb->prepare($users_query, $users_params)
            );
            $articles_and_pages_result = $wpdb->get_results(
                $wpdb->prepare($articles_and_pages_query, $articles_and_pages_params)
            );
            $products_result = $wpdb->get_results(
                $wpdb->prepare($products_query, $products_params)
            );

            // обработать массив пользователей
            $users_result = $this->map_users($users_result, $words);
            // "вытащить" из массива страниц и статей раздельно страницы и статьи
            $articles_and_pages_result = $this->map_articles_and_pages($articles_and_pages_result);
            $articles_result = $articles_and_pages_result['articles_result'];
            $pages_result = $articles_and_pages_result['pages_result'];
            // обработать массив товаров
            $products_result = $this->map_products_result($products_result);

            // отослать найденные данные
            wp_send_json([
                // пользователи
                'users' => $users_result,
                'articles' => $articles_result,
                'pages' => $pages_result,
                'products' => $products_result
            ]);
        }

        public function map_users($users_result, $words)
        {
            // функция вернет true, если найдено совпадение с именем, фамилией или отчеством. Учитывается, показывает ли пользователь фамилию на сайте
            function matchword($word, $userdata)
            {
                $preg = '/' . $word . '/ui';
                $match = preg_match($preg, $userdata->first_name)
                    || ($userdata->user_show_last_name && preg_match($preg, $userdata->last_name))
                    || preg_match($preg, $userdata->patronymic_name);

                if ($match)
                    return true;

                return false;
            }

            // отобрать пользователей так, чтобы было совпадение по всем введенным данным
            $users_result = array_map(function ($usermeta) use ($words) {
                $userdata = get_userdata($usermeta->user_id);
                // цикл проверит, чтобы каждое из введенных слов нашло совпадение или с именем, или с фамилией, или с отчеством пользователя
                foreach ($words as $key => $word) {
                    if (!matchword($word, $userdata)) {
                        // если не нашлось совпадения со словом, пользователь отпадает
                        return false;
                    }
                }
                $last_name = $userdata->user_show_last_name
                    ? $userdata->last_name : '';
                // если с каждым словом нашлось совпадение, значит пользователя оставить
                return [
                    'first_name' => $userdata->first_name,
                    'last_name' => $last_name,
                    'patronymic_name' => $userdata->patronymic_name,
                    'avatar_url' => get_avatar_url($usermeta->user_id),
                    'user_page_url' => get_user_page_url($usermeta->user_id)
                ];
            }, $users_result);
            // отфильтровать массив от false-значений
            $users_result = array_filter($users_result, fn($id) => $id);
            // отфильтровать массив от одинаковых пользователей
            return array_unique($users_result, SORT_REGULAR);
        }

        public function map_articles_and_pages($articles_and_pages_result)
        {
            $articles_result = [];
            $pages_result = [];
            $is_logged_user = is_user_logged_in();
            foreach ($articles_and_pages_result as $data) {
                if ($data->post_type === 'post') {
                    $articles_result[] = [
                        'avatar' => get_the_post_thumbnail_url($data->ID),
                        'title' => sanitize_text_field($data->post_title),
                        'content' => sanitize_text_field($data->post_content),
                        'url' => get_permalink($data->ID)
                    ];
                } elseif ($data->post_type === 'page') {
                    // не показывать страницы регистрации/авторизации зарегистрированным пользователям
                    if ($is_logged_user && preg_match('/signup|login/', $data->post_name))
                        continue;

                    $pages_result[] = [
                        'avatar' => get_the_post_thumbnail_url($data->ID),
                        'title' => sanitize_text_field($data->post_title),
                        'content' => sanitize_text_field($data->post_content),
                        'url' => get_permalink($data->ID)
                    ];
                }
            }

            return [
                'articles_result' => $articles_result,
                'pages_result' => $pages_result
            ];
        }

        public function map_products_result($products_result)
        {
            return array_map(function ($data) {
                $product = wc_get_product($data->ID);

                return [
                    'url' => get_permalink($data->ID),
                    'title' => $data->post_title,
                    'price' => $product->get_price(),
                    'price_with_symbol' => $product->get_price() . get_woocommerce_currency_symbol(),
                    'image' => flcl_get_product_thumb($product)
                ];
            }, $products_result);
        }
    }
    $ajax_search = new Ajax_Search();

    class Ajax_Catalog_Page
    {
        public function __construct()
        {
            add_action('wp_ajax_products_query', [$this, 'products_query']);
            add_action('wp_ajax_nopriv_products_query', [$this, 'products_query']);
        }

        public function products_query()
        {
            if (!array_key_exists('filterData', $_POST))
                wp_send_json_error();

            global $flcl_product_attrs;
            $prod_attrs = $flcl_product_attrs->get_only_filtering();

            $filter_data = array_map(
                fn($obj) => (array) $obj,
                json_decode(stripslashes($_POST['filterData']))
            );

            $range_double_queries = array_filter($filter_data, function ($item) use ($prod_attrs) {
                if (!array_key_exists($item['name'], $prod_attrs))
                    return false;

                return $prod_attrs[$item['name']]['filter_type'] === 'range_double';
            });
            $checkboxes_queries = array_filter($filter_data, function ($item) use ($prod_attrs) {
                if (!array_key_exists($item['name'], $prod_attrs))
                    return false;

                return $prod_attrs[$item['name']]['filter_type'] === 'checkboxes';
            });
            $products = wc_get_products([
                'category' => $_POST['category']
            ]);

            $products = array_filter($products, function ($product) use ($range_double_queries, $checkboxes_queries, $prod_attrs) {
                foreach ($range_double_queries as $query) {
                    $option = null;

                    if ($query['name'] === 'price')
                        $option = (int) $product->get_price();
                    else
                        $option = $product->get_attribute($query['name']);

                    if (!$option)
                        return false;

                    $option = (float) $option;
                    if (
                        array_key_exists('multiple', $prod_attrs[$query['name']])
                        && $prod_attrs[$query['name']]['multiple']
                    )
                        $option = $option * $prod_attrs[$query['name']]['multiple'];

                    if ($option < (int) $query['values']->min || $option > (int) $query['values']->max)
                        return false;
                }
                foreach ($checkboxes_queries as $query) {
                    $values = (array) $query['values'];
                    if (count($values) < 1)
                        continue;

                    $options_string = $product->get_attribute($query['name']);
                    if (!$options_string)
                        return false;

                    $options = explode('|', preg_replace('/\s*\|\s*/', '|', $options_string));

                    $has_matches = false;
                    foreach ($options as $option) {
                        if (is_numeric(array_search($option, $values))) {
                            $has_matches = true;
                            break;
                        }
                    }

                    if (!$has_matches)
                        return false;
                }

                return true;
            });

            global $flcl_product_attrs;
            $products = $flcl_product_attrs->map_products($products);

            wp_send_json_success([
                'products' => $products
            ]);
        }
    }
    new Ajax_Catalog_Page();
}

add_action('wp_enqueue_scripts', 'enqueue_ajax_data_to_frontend', 99);
function enqueue_ajax_data_to_frontend()
{
    $data = [
        'url' => admin_url('admin-ajax.php'),
        'currentUrl' => get_page_uri()
    ];
    if (is_user_logged_in()) {
        $nonce_action = ajax_get_user_nonce();
        $data['userNonce'] = wp_create_nonce($nonce_action);
    }

    wp_localize_script('scripts', 'wpAjaxData', $data);
}