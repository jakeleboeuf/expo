import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';
import { deprecate } from '@unimodules/core';
import StoreReview from './ExpoStoreReview';
/*
 * Platform must be iOS
 * iOS 10.3 or greater
 * `SKStoreReviewController` class is available
 */
export async function isAvailableAsync() {
    return StoreReview.isAvailableAsync();
}
/*
 * Deprecated
 */
export function isSupported() {
    deprecate('expo-store-review', 'StoreReview.isSupported', {
        replacement: 'StoreReview.isAvailableAsync',
    });
}
/*
 * Use the iOS `SKStoreReviewController` API to prompt a user rating without leaving the app.
 */
export async function requestReview() {
    if (StoreReview && StoreReview.requestReview) {
        await StoreReview.requestReview();
    }
    else {
        // If StoreReview is unavailable then get the store URL from `app.json` and open the store
        const url = storeUrl();
        if (url) {
            const supported = await Linking.canOpenURL(url);
            if (!supported) {
                console.warn("Expo.StoreReview.requestReview(): Can't open store url: ", url);
            }
            else {
                await Linking.openURL(url);
            }
        }
        else {
            // If the store URL is missing, let the dev know.
            console.warn("Expo.StoreReview.requestReview(): Couldn't link to store, please make sure the `android.playStoreUrl` & `ios.appStoreUrl` fields are filled out in your `app.json`");
        }
    }
}
/*
 * Get your app's store URLs from the `app.json`
 * iOS: https://docs.expo.io/versions/latest/workflow/configuration#appstoreurlurl-to-your-app-on-the-apple-app-store-if-you-have-deployed-it-there-this-is-used-to-link-to-your-store-page-from-your-expo-project-page-if-your-app-is-public
 * Android: https://docs.expo.io/versions/latest/workflow/configuration#playstoreurlurl-to-your-app-on-the-google-play-store-if-you-have-deployed-it-there-this-is-used-to-link-to-your-store-page-from-your-expo-project-page-if-your-app-is-public
 */
export function storeUrl() {
    const { manifest } = Constants;
    if (Platform.OS === 'ios' && manifest.ios) {
        return manifest.ios.appStoreUrl;
    }
    else if (Platform.OS === 'android' && manifest.android) {
        return manifest.android.playStoreUrl;
    }
    else {
        return null;
    }
}
/*
 * A flag to detect if this module can do anything
 */
export async function hasAction() {
    return !!storeUrl() || (await isAvailableAsync());
}
//# sourceMappingURL=StoreReview.js.map