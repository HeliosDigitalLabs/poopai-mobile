/** ---------------- Core Events ---------------- */ //
export const APP_OPENED = "App Opened";
//logEvent(APP_OPENED);
export const APP_CLOSED = "App Closed";
// logEvent(APP_CLOSED, {
//   sessionDuration: seconds, // e.g. 47.5
// });

/** ---------------- Scanning ---------------- */ //
export const SCAN_STARTED = "Scan Started";
//logEvent(SCAN_STARTED);
export const PIC_TAKEN = "Pic Taken";
//logEvent(PIC_TAKEN);
export const SCAN_SUBMITTED = "Scan Submitted";
// logEvent(SCAN_SUBMITTED, {
//   poopScore: 89,
//   bristolType: 'Type 3',
//   bristolTypeNumber: 3,
//   maxScore: 100,
//   hydrationJudgement: 'Well hydrated',
//   fiberJudgement: 'Good fiber intake',
//   stoolDescription: 'Sausage-shaped with cracks on surface'
// });
export const SCAN_FAILED = "Scan Failed";
// logEvent(SCAN_FAILED, {
//   reason: 'no-image-detected' // or 'low-resolution', 'timeout', etc.
// });

/** ---------------- Sharing  ---------------- */ //
export const SHARE_CLICKED = "Share Clicked";
// logEvent(SHARE_CLICKED, {
//   method: 'Instagram' | 'Twitter' | 'Link' | 'TikTok' | 'Other',
//   hidePoop: boolean,
// });
export const SHARE_COMPLETED = "Share Completed";
// logEvent(SHARE_COMPLETED, {
//   method: 'Instagram' | 'Twitter' | 'Link' | 'TikTok' | 'Other',
//   success: boolean,
// });

/** ---------------- Learn More  ---------------- */ //
export const LEARN_MORE_OPENED = "Learn More Opened";
//logEvent(LEARN_MORE_OPENED);
export const LEARN_MORE_TIME_SPENT = "Learn More Time Spent";
//logEvent(LEARN_MORE_TIME_SPENT, {
//   duration: seconds,
//   scrolledToBottom: boolean,
// });

/** ---------------- Calendar  ---------------- */ //
export const CALENDAR_OPENED = "Calendar Opened";
//logEvent(CALENDAR_OPENED);
export const CALENDAR_DAY_CLICKED = "Calendar Day Clicked";
// logEvent(CALENDAR_DAY_CLICKED, {
//   date: 'YYYY-MM-DD',
// });
export const CALENDAR_TIME_SPENT = "Calendar Time Spent";
// logEvent(CALENDAR_TIME_SPENT, {
//   duration: seconds,
// });

/** ---------------- Payment  ---------------- */ //
export const PAYMENT_SCREEN_OPENED = "Payment Screen Opened";
// logEvent(PAYMENT_SCREEN_OPENED);
export const PAYMENT_BUTTON_CLICKED = "Payment Button Clicked";
// logEvent(PAYMENT_BUTTON_CLICKED, {
//   button: 'Start Trial' | 'Subscribe Now' | 'Restore Purchase',
// });
export const SUBSCRIBED = "Subscribed";
// logEvent(SUBSCRIBED, {
//   plan: 'monthly' | 'yearly',
//   method: 'Apple Pay' | 'Google Pay' | 'Card' | 'Promo Code',
// });
export const UNSUBSCRIBED = "Unsubscribed";
// logEvent(UNSUBSCRIBED);
export const RESUBSCRIBED = "Resubscribed";
// logEvent(RESUBSCRIBED, {
//   plan: 'monthly' | 'yearly',
//   method: 'Apple Pay' | 'Google Pay' | 'Card' | 'Promo Code',
// });

/** ---------------- Profile  ---------------- */ //
export const PROFILE_OPENED = "Profile Opened";
// logEvent(PROFILE_OPENED);
export const PROFILE_TIME_SPENT = "Profile Time Spent";
// logEvent(PROFILE_TIME_SPENT, {
//   duration: seconds,
// });
export const PROFILE_UPDATED = "Profile Updated";
// logEvent(PROFILE_UPDATED, {
//   field: 'poopGoals' | 'name' | 'email',
//   newValue: string | string[],
// });

/** ---------------- Optional User Properties  ---------------- */ //
export const USER_PROP_ACCOUNT_TYPE = "accountType";
export const USER_PROP_REFERRAL_SOURCE = "referralSource";
export const USER_PROP_SIGNED_UP = "signedUp";
export const USER_PROP_SUB_STATUS = "subscriptionStatus";
// setUserTraits({
//   accountType: 'email' | 'anon',
//   referralSource: 'tiktok' | 'qr_sticker' | 'friend' | 'web',
//   signedUp: true,
//   subscriptionStatus: 'free' | 'active' | 'cancelled',
//   poopGoals: ['Stay regular', 'Less bloating'],
// });
