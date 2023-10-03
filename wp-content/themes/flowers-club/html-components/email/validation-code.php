<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schema-microsoft-com:vml"
    xmlns:c="urn:schema-microsoft-com:office:office" lang="ru">

<head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>

<body
    style="margin: 0px; padding: 0; background-color:#5c2018; -webkit-text-size-adjust:none; -moz-text-size-adjust:none; -ms-text-size-adjust:none; text-size-adjust:none;">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 20px; font-family: sans-serif;   color: #ebebeb; background-color:#5c2018;" role="presentation">
        <tr>
            <td>
                <table width="100%" cellpadding="0" cellspacing="0"
                    style="background-color:#5c2018; padding: 10px 10px 10px 10px; text-align: center;" role="presentation">
                    <?php if (is_array($options) && array_key_exists('texts', $options) && $options['texts']):
                        foreach ($options['texts'] as $key => $text_or_array):
                            if (is_array($text_or_array)): ?>

                                <tr>
                                    <td
                                        style="<?= array_key_exists('style', $text_or_array) && !empty($text_or_array['style']) ? $text_or_array['style'] : '' ?>">
                                        <?= $text_or_array['text'] ?? '' ?>
                                    </td>
                                </tr>

                            <?php elseif (!empty($text_or_array)): ?>

                                <tr>
                                    <td>
                                        <?= $text_or_array ?>
                                    </td>
                                </tr>

                            <?php endif; ?>
                        <?php endforeach; ?>
                    <?php endif ?>
                    <tr>
                        <td style="width: 100%;">
                            <p
                                style="color: #fff; font-weight: 600; font-size: 30px; text-align: center; padding: 25px 0 0 0; margin: 0 0 0 0;">
                                <?= $code ?>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</html>