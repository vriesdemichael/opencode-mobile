# 1.0.0 (2026-02-23)


### Bug Fixes

* **ci:** fix type errors and add typecheck to pre-commit ([0c661b0](https://github.com/vriesdemichael/opencode-mobile/commit/0c661b0b34025d3e214dd2a02e6c2c7abb584953))
* **ci:** install task runner to fix workflow ([1e7ba9f](https://github.com/vriesdemichael/opencode-mobile/commit/1e7ba9feb00b16a3d7abaabc3cf64470be9f1452))
* **ci:** replace global with globalThis in tests to fix TS2304 ([921a2fd](https://github.com/vriesdemichael/opencode-mobile/commit/921a2fd9196f5d034bddbf09679d71d8774d3dd0))
* linting and formatting (bypass hook) ([a4e339a](https://github.com/vriesdemichael/opencode-mobile/commit/a4e339ad2c162352a60271993ea0ec685c5cf9b5))
* **pr:** remove test logs and flaky verification test ([41fe421](https://github.com/vriesdemichael/opencode-mobile/commit/41fe42174ff80cad7627fb587464762d61c428b7))
* remove test output files ([6337cf7](https://github.com/vriesdemichael/opencode-mobile/commit/6337cf75b4db4dbf6820e43d83e195fe10e1be33))
* replace broken react-native-syntax-highlighter with simple code block ([80d3744](https://github.com/vriesdemichael/opencode-mobile/commit/80d374475ebf3821103d86aa31d1a763d342ef59))
* replace process.env.EXPO_OS with Platform.OS for typecheck ([9343978](https://github.com/vriesdemichael/opencode-mobile/commit/9343978d2367f6759cb0313a35fd3ac13508523a))
* resolve failing Composer tests and upgrade GitHub Actions to Node 22 ([8aa0dea](https://github.com/vriesdemichael/opencode-mobile/commit/8aa0dea4b15772d50691ef30e39e512034ba17c1))
* resolve lint issues and merge main ([4c9c3f2](https://github.com/vriesdemichael/opencode-mobile/commit/4c9c3f287f453bea5a9355afcd8c91d10a806e50))
* **ui:** add accessibility props to IconSymbol ([6334d31](https://github.com/vriesdemichael/opencode-mobile/commit/6334d31859a5e4dd75b33eef78017af607176abb))


### Features

* add auto-reconnect, pull-to-refresh, app state handling, syntax highlighting, and theme system ([0b16be1](https://github.com/vriesdemichael/opencode-mobile/commit/0b16be1a81a00e86d7b3ab8a1ee6fe482aff5c19)), closes [#14](https://github.com/vriesdemichael/opencode-mobile/issues/14) [#14](https://github.com/vriesdemichael/opencode-mobile/issues/14) [#15](https://github.com/vriesdemichael/opencode-mobile/issues/15) [#16](https://github.com/vriesdemichael/opencode-mobile/issues/16) [#17](https://github.com/vriesdemichael/opencode-mobile/issues/17) [#18](https://github.com/vriesdemichael/opencode-mobile/issues/18) [#18](https://github.com/vriesdemichael/opencode-mobile/issues/18) [#19](https://github.com/vriesdemichael/opencode-mobile/issues/19) [#19](https://github.com/vriesdemichael/opencode-mobile/issues/19) [#19](https://github.com/vriesdemichael/opencode-mobile/issues/19) [#16](https://github.com/vriesdemichael/opencode-mobile/issues/16) [#17](https://github.com/vriesdemichael/opencode-mobile/issues/17) [#14](https://github.com/vriesdemichael/opencode-mobile/issues/14) [#14](https://github.com/vriesdemichael/opencode-mobile/issues/14) [#15](https://github.com/vriesdemichael/opencode-mobile/issues/15) [#16](https://github.com/vriesdemichael/opencode-mobile/issues/16) [#17](https://github.com/vriesdemichael/opencode-mobile/issues/17) [#18](https://github.com/vriesdemichael/opencode-mobile/issues/18) [#19](https://github.com/vriesdemichael/opencode-mobile/issues/19)
* **docs:** document OpenCode Server API and add types ([930c916](https://github.com/vriesdemichael/opencode-mobile/commit/930c9168d402729d230e6efc56505312e7adfd1f))
* implement connection settings screen ([6187dfc](https://github.com/vriesdemichael/opencode-mobile/commit/6187dfc25f16106ef0207aa2e938b1fe70e33dd2)), closes [#4](https://github.com/vriesdemichael/opencode-mobile/issues/4)
* implement session chat screen with tool call and patch display ([f98d2a7](https://github.com/vriesdemichael/opencode-mobile/commit/f98d2a720ea73a7e81f6b6ce5d0e4591d099dbad)), closes [#9](https://github.com/vriesdemichael/opencode-mobile/issues/9)
* implement session list screen ([#8](https://github.com/vriesdemichael/opencode-mobile/issues/8)) ([#31](https://github.com/vriesdemichael/opencode-mobile/issues/31)) ([781f499](https://github.com/vriesdemichael/opencode-mobile/commit/781f499710eb36e28582b116e8db9528d3e32e7d))
* implement session list screen (issue [#8](https://github.com/vriesdemichael/opencode-mobile/issues/8)) ([5d739cb](https://github.com/vriesdemichael/opencode-mobile/commit/5d739cb7282feeac7faa31f117e2ab35409c2572))
* implement session store ([5aad579](https://github.com/vriesdemichael/opencode-mobile/commit/5aad5795c0ae0f25840bd3add7a8bd354441daf7)), closes [#6](https://github.com/vriesdemichael/opencode-mobile/issues/6)
* implement SSE streaming, enhance composer, and define navigation structure ([7f1a97a](https://github.com/vriesdemichael/opencode-mobile/commit/7f1a97a6ac0ebe7f6af8df37486b018d1279eb6b)), closes [#10](https://github.com/vriesdemichael/opencode-mobile/issues/10) [#11](https://github.com/vriesdemichael/opencode-mobile/issues/11) [#13](https://github.com/vriesdemichael/opencode-mobile/issues/13)
* implement zustand stores for sessions and streams ([44e07ba](https://github.com/vriesdemichael/opencode-mobile/commit/44e07ba3169f6be67c52cc0c00dd95be21ec107c))
* setup test infrastructure and improve coverage to >85% ([a22f31d](https://github.com/vriesdemichael/opencode-mobile/commit/a22f31dabf7015c6c990ff9eca86cf307704c771))
