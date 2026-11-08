import type { AuthSettings } from '@banovit/api-client';

export type AuthTexts = AuthSettings['texts'];

/**
 * Built-in copy of the /login/ page, used only while the CMS is unreachable.
 * The real values come from the CMS panel («ورود و پیامک کد سایت»,
 * GET /settings/auth) and must stay identical to AuthSettings::TEXT_DEFAULTS.
 */
export const AUTH_TEXT_DEFAULTS: AuthTexts = {
  page_title: 'ورود یا ثبت نام',
  phone_title: 'ورود یا ثبت نام در بانویت',
  phone_subtitle: 'لطفاً شماره موبایل خود را وارد کنید',
  phone_label: 'شماره موبایل',
  phone_placeholder: '۰۹۱۲۳۴۵۶۷۸۹',
  phone_submit: 'دریافت کد پیامکی',
  sending_title: 'درحال ارسال کد پیامکی ...',
  sending_subtitle: 'از صبر و شکیبایی شما سپاسگذاریم',
  code_title: 'کد پیامکی برای شما ارسال شد',
  code_subtitle: 'کد پیامکی برای شماره ({phone}) ارسال گردید',
  code_submit: 'ورود به بانُویت',
  checking_label: 'در حال بررسی…',
  resend_wait: '{time} تا دریافت مجدد',
  resend_label: 'دریافت مجدد کد پیامکی',
  welcome_title: 'به خانواده بانُویت خوش‌آمدید!',
  welcome_subtitle: 'امیدواریم بتوانیم برای شما تجربه خوبی بسازیم.',
  first_name_label: 'نام کوچک',
  last_name_label: 'نام خانوادگی',
  profile_submit: 'ورود به بانُویت',
  consent_prefix: 'ورود شما به معنای پذیرش',
  terms_label: 'شرایط بانُویت',
  terms_url: '/terms/',
  consent_middle: 'و',
  privacy_label: 'قوانین حریم‌خصوصی',
  privacy_url: '/privacy-policy/',
  consent_suffix: 'است',
  error_generic: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.',
  error_network: 'اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.',
};

export const AUTH_SETTINGS_FALLBACK: AuthSettings = { code_length: 4, resend_cooldown: 60, code_ttl: 300, texts: AUTH_TEXT_DEFAULTS };

/** Fills `{name}` placeholders. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);
}
