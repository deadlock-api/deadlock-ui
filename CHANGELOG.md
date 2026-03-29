# Changelog

## [1.0.2](https://github.com/deadlockprobr/deadlock-ui/compare/deadlock-ui-v1.0.1...deadlock-ui-v1.0.2) (2026-03-29)


### Bug Fixes

* include repo.config.mjs in Docker build context ([4d43f0b](https://github.com/deadlockprobr/deadlock-ui/commit/4d43f0b7b2d81e28abbe395e9954a842025e06d8))
* resolve parent items and text alignment for standalone usage ([a6491fe](https://github.com/deadlockprobr/deadlock-ui/commit/a6491fe63ab4b5f72018388252a28400c35d1ed1))

## [1.0.1](https://github.com/deadlockprobr/deadlock-ui/compare/deadlock-ui-v1.0.0...deadlock-ui-v1.0.1) (2026-03-29)


### Bug Fixes

* export DlItemCardCustomEvent type from core package ([8e78825](https://github.com/deadlockprobr/deadlock-ui/commit/8e7882507d4f276ae2d22ee465b135f31816ffbe))

## [1.0.0](https://github.com/deadlockprobr/deadlock-ui/compare/deadlock-ui-v0.3.0...deadlock-ui-v1.0.0) (2026-03-29)


### ⚠ BREAKING CHANGES

* `tooltip-behavior` is now `tooltip-trigger` with values `"hover"` | `"click"` | `"none"` (previously `"tooltip"` | `"popover"` | `"none"`).

### Features

* add item-name-language prop for independent name localization ([347dc68](https://github.com/deadlockprobr/deadlock-ui/commit/347dc682dbebea7a56640ba857f39a389e634c95))
* add upgrade chain highlight and component info in tooltips ([1231090](https://github.com/deadlockprobr/deadlock-ui/commit/12310909300856fa18831b77e919b74aabbf151a))
* display cooldown in ability section header of item tooltip ([2682a33](https://github.com/deadlockprobr/deadlock-ui/commit/2682a3374c62934861689307d977b74d82dbb9a4))
* highlight upgrade chain on item hover in shop panel ([31bdb18](https://github.com/deadlockprobr/deadlock-ui/commit/31bdb1899b372b1f3af4702e79b67a3adb3bad51))
* show parent items in tooltip and improve component items layout ([9277790](https://github.com/deadlockprobr/deadlock-ui/commit/9277790be7208ab48f8d98f31328f5d77726678c))


### Bug Fixes

* ensure open tooltip renders above related highlighted cards ([5ccfe99](https://github.com/deadlockprobr/deadlock-ui/commit/5ccfe997450d4a2720a53698d3a96be724acb613))
* group regular properties inside important stats block in tooltip ([12f7562](https://github.com/deadlockprobr/deadlock-ui/commit/12f756232d0a0c6c76be4f73a5d967c4bd1d1abb))
* prevent tier-price text from flashing over item tooltips ([ab031bb](https://github.com/deadlockprobr/deadlock-ui/commit/ab031bb2b056940a1361c3b294a1a3c7589cd851))
* render status effects and conditional flags in tooltip important stats ([a7e2aaf](https://github.com/deadlockprobr/deadlock-ui/commit/a7e2aaf8a73bbc22a601328fe285b973648de56b))
* sort items by display name to match in-game ordering ([25a8658](https://github.com/deadlockprobr/deadlock-ui/commit/25a8658e43b93e96ccad44c0c8123cc2c2cf83ac))
* use 2-column grid for important stats to match in-game layout ([6187c9b](https://github.com/deadlockprobr/deadlock-ui/commit/6187c9b8ec889ad781b1ba3f48b8c3199f843b72))


### Code Refactoring

* rename tooltip-behavior to tooltip-trigger and add tooltip-follow-cursor ([57be002](https://github.com/deadlockprobr/deadlock-ui/commit/57be00235b40c0a0338d4b43a043fae09b199fd5))

## [0.3.0](https://github.com/deadlockprobr/deadlock-ui/compare/deadlock-ui-v0.2.1...deadlock-ui-v0.3.0) (2026-03-29)


### Features

* add ItemClassName type with codegen and class names catalog page ([d9e61db](https://github.com/deadlockprobr/deadlock-ui/commit/d9e61db7c8ea32bfaf46422e60d52bad5411be45))
* add tier price labels and runtime font injection for Shadow DOM ([d7b6c0e](https://github.com/deadlockprobr/deadlock-ui/commit/d7b6c0e1a937173c281be23bbc947f162f5d865f))


### Bug Fixes

* add repository field to package.json for npm publish ([2d34843](https://github.com/deadlockprobr/deadlock-ui/commit/2d348434276896bc281c9c67cfcc639bb9ac681d))
* inject fonts from dl-item-card so fonts load without dl-provider ([10d58d5](https://github.com/deadlockprobr/deadlock-ui/commit/10d58d5054dd8fccd4238392c1839515a819a0cd))
* match tier price font sizes to prevent shop layout overflow ([021f32f](https://github.com/deadlockprobr/deadlock-ui/commit/021f32f4d5ecaecbe2284da86f5f736297c3e1fd))
* react to language changes instantly in shop panel and item grid ([3affcd5](https://github.com/deadlockprobr/deadlock-ui/commit/3affcd5ead648c17ee9ff794e9753b4edacb4756))
* remove stale assets copy from docs build after CDN migration ([919033b](https://github.com/deadlockprobr/deadlock-ui/commit/919033b6c06ce6725976672909b3b4039930eba1))
