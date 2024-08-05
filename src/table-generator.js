import csvToMarkdown from "csv-to-markdown-table";
import { json2csv } from 'json-2-csv';

export default function classificationTableGenerator() {
    const any = () => 'Not empty';

    const none = () => ('Empty');

    const notOrigin = () => {
        return `Not equal to`;
    };

    const notEmpty = () => 'Not empty';

    const RULES = [
        // PAID
        { type: 'paid', category: 'search', referrer: "search engine", utmSource: any, utmMedium: "related to search engine", tracking: none, priority: 1 },
        { type: 'paid', category: 'search', referrer: "search engine", utmSource: any, utmMedium: any, tracking: "paid_tracking_param value", priority: 2 },
        { type: 'paid', category: 'social', referrer: "social media", utmSource: any, utmMedium: "related to social media", tracking: none, priority: 10 },
        { type: 'paid', category: 'social', referrer: "social media", utmSource: any, utmMedium: any, tracking: "about traffic", priority: 11 },
        { type: 'paid', category: 'video', referrer: "video streaming platform", utmSource: any, utmMedium: "about cost per click", tracking: any, priority: 20 },
        { type: 'paid', category: 'video', referrer: "video streaming platform", utmSource: any, utmMedium: any, tracking: "paid_tracking_param value", priority: 21 },
        { type: 'paid', category: 'display', referrer: notEmpty, utmSource: any, utmMedium: "related to cost-per-click", tracking: any, priority: 20 },
        { type: 'paid', category: 'display', referrer: 'it is an advertisment network', utmSource: any, utmMedium: any, tracking: any, priority: 21 },
        { type: 'paid', category: 'display', referrer: notEmpty, utmSource: "related to Google Display Network", utmMedium: any, tracking: any, priority: 22 },
        { type: 'paid', category: 'affiliate', referrer: notEmpty, utmSource: any, utmMedium: "about affiliate marketing", tracking: any, priority: 50 },
        { type: 'paid', category: 'uncategorized', referrer: notOrigin, utmSource: any, utmMedium: any, tracking: "paid_tracking_param value", priority: 91 },

        // EARNED
        { type: 'earned', category: 'search', referrer: "search engine", utmSource: none, utmMedium: none, tracking: none, priority: 100 },
        { type: 'earned', category: 'search', referrer: "search engine", utmSource: any, utmMedium: "related to cost-per-click", tracking: "paid_tracking_param does not have a value", priority: 101 },
        { type: 'earned', category: 'social', referrer: "social media", utmSource: none, utmMedium: none, tracking: none, priority: 110 },
        { type: 'earned', category: 'social', referrer: notOrigin, utmSource: any, utmMedium: "about organic", tracking: none, priority: 111 },
        { type: 'earned', category: 'video', referrer: "video streaming platform", utmSource: none, utmMedium: none, tracking: none, priority: 120 },
        { type: 'earned', category: 'video', referrer: "video streaming platform", utmSource: any, utmMedium: "related to cost-per-click", tracking: none, priority: 121 },
        { type: 'earned', category: 'referral', referrer: notOrigin, utmSource: none, utmMedium: none, tracking: none, priority: 191 },

        // OWNED
        { type: 'owned', category: 'direct', referrer: none, utmSource: none, utmMedium: none, tracking: none, priority: 290 },
        { type: 'owned', category: 'internal', referrer: 'Equals', utmSource: none, utmMedium: none, tracking: none, priority: 0 },
        { type: 'owned', category: 'email', referrer: any, utmSource: any, utmMedium: any, tracking: "about email", priority: 210 },
        { type: 'owned', category: 'email', referrer: any, utmSource: any, utmMedium: "about email", tracking: any, priority: 2101 },
        { type: 'owned', category: 'sms', referrer: none, utmSource: any, utmMedium: "about SMS", tracking: none, priority: 220 },
        { type: 'owned', category: 'qr', referrer: none, utmSource: any, utmMedium: "about QR code", tracking: none, priority: 230 },
        { type: 'owned', category: 'push', referrer: none, utmSource: any, utmMedium: "about push notifications", tracking: none, priority: 221 },

        // FALLBACK
        { type: 'owned', category: 'uncategorized', referrer: any, utmSource: any, utmMedium: any, tracking: any, priority: 0 },
    ];

    const csv = json2csv(
        [
            ['type', 'category', 'referrer', 'utm_source', 'utm_medium', 'paid_tracking_param', 'email_tracking_param', 'priority'],
            ...RULES.map(rule =>
                Object
                    .entries(rule)
                    .map(
                        ([key, val]) => {
                            if (key === 'tracking') {
                                if (typeof val === 'function') {
                                    return [val(), val()];
                                } else if (val.includes('Is one of: ')) {
                                    return ['Any not empty', 'Any not empty'];
                                } else {
                                    return ['None', 'None'];
                                }
                            }
                            return typeof val === 'function' ? val() : val
                        }
                    )
                    .flat()
            )
        ],
        { prependHeader: false }
    );

    return csvToMarkdown(csv, ',', true);
}