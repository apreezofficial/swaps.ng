<?php
declare(strict_types=1);

final class Mailer
{
    public static function send(string $to, string $subject, string $text): void
    {
        $from = Env::get('MAIL_FROM', 'SwapS.ng <no-reply@swaps.ng>');
        if (Env::get('MAIL_DRIVER', 'log') === 'mail') {
            mail($to, $subject, $text, "From: $from\r\nContent-Type: text/plain; charset=utf-8");
            return;
        }
        $entry = sprintf("[%s] To: %s\nSubject: %s\n\n%s\n%s\n", gmdate('c'), $to, $subject, $text, str_repeat('-', 60));
        file_put_contents(__DIR__ . '/../storage/mail.log', $entry, FILE_APPEND | LOCK_EX);
    }
}
