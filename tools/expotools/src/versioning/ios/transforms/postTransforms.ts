import chalk from 'chalk';

import { TransformPipeline } from '.';

export function postTransforms(versionName: string): TransformPipeline {
  return {
    logHeader(filePath: string) {
      console.log(`Post-transforming ${chalk.magenta(filePath)}:`);
    },
    transforms: [
      // react-native
      {
        paths: ['RCTRedBox.m', 'RCTLog.mm'],
        replace: /#if (ABI\d+_\d+_\d+)RCT_DEBUG/g,
        with: '#if $1RCT_DEV',
      },
      {
        paths: ['NSTextStorage+FontScaling.h', 'NSTextStorage+FontScaling.m'],
        replace: /NSTextStorage \(FontScaling\)/,
        with: `NSTextStorage (${versionName}FontScaling)`,
      },
      {
        paths: ['NSTextStorage+FontScaling.h', 'NSTextStorage+FontScaling.m', 'RCTTextShadowView.m'],
        replace: /\b(scaleFontSizeToFitSize|scaleFontSizeWithRatio|compareToSize)\b/g,
        with: `${versionName.toLowerCase()}_rct_$1`,
      },
      {
        paths: 'RCTWebView.m',
        replace: /@"ReactABI\d+_\d+_\d+-js-navigation"/,
        with: '@"react-js-navigation"',
      },

      // Universal modules
      {
        paths: `UniversalModules/${versionName}EXScoped`,
        replace: /(EXScopedReactABI\d+_\d+_\d+Native)/g,
        with: 'EXScopedReactNative',
      },

      // react-native-maps
      {
        paths: 'AIRMapWMSTile',
        replace: /\b(TileOverlay)\b/g,
        with: `${versionName}$1`,
      },
      {
        paths: 'AIRGoogleMapWMSTile',
        replace: /\b(WMSTileOverlay)\b/g,
        with: `${versionName}$1`,
      },

      // react-native-svg
      {
        paths: 'RNSVGRenderable.m',
        replace: /\b(saturate)\(/g,
        with: `${versionName}$1(`,
      },
      {
        paths: 'RNSVGPainter.m',
        replace: /\b(PatternFunction)\b/g,
        with: `${versionName}$1`,
      },
      {
        paths: 'RNSVGFontData.m',
        replace: /\b(AbsoluteFontWeight|bolder|lighter|nearestFontWeight)\(/gi,
        with: `${versionName}$1(`,
      },
      {
        paths: 'RNSVGTSpan.m',
        replace: /\b(TopAlignedLabel\s*\*\s*label)\b/gi,
        with: 'static $1',
      },
      {
        paths: 'RNSVGTSpan.m',
        replace: /\b(TopAlignedLabel)\b/gi,
        with: `${versionName}$1`,
      },

      // react-native-webview
      {
        paths: 'RNCWebView.m',
        replace: new RegExp(`#import "${versionName}objc/runtime\\.h"`, ''),
        with: '#import "objc/runtime.h"',
      },
      {
        paths: 'RNCWebView.m',
        replace: /\b(_SwizzleHelperWK)\b/g,
        with: `${versionName}$1`,
      },
      {
        // see issue: https://github.com/expo/expo/issues/4463
        paths: 'RNCWebView.m',
        replace: /MessageHandlerName = @"ReactABI\d+_\d+_\d+NativeWebView";/,
        with: `MessageHandlerName = @"ReactNativeWebView";`,
      },

      // react-native-reanimated
      {
        paths: 'REATransitionAnimation.m',
        replace: /(SimAnimationDragCoefficient)\(/g,
        with: `${versionName}$1(`
      },

      // react-native-shared-element
      {
        paths: 'RNSharedElementNode.m',
        replace: /\b(NSArray\s*\*\s*_imageResolvers)\b/,
        with: 'static $1',
      },
    ],
  };
}
