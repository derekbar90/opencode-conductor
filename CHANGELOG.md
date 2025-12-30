## [1.1.2](https://github.com/derekbar90/opencode-conductor/compare/v1.1.1...v1.1.2) (2025-12-30)


### Bug Fixes

* use postinstall script for global setup to avoid OpenCode launch stalls ([536ee59](https://github.com/derekbar90/opencode-conductor/commit/536ee59541bcba895b0a1df791066d88f48507d2))

## [1.1.1](https://github.com/derekbar90/opencode-conductor/compare/v1.1.0...v1.1.1) (2025-12-30)


### Bug Fixes

* prevent plugin initialization from hanging on async toasts and bootstrap ([5d71844](https://github.com/derekbar90/opencode-conductor/commit/5d718441adb7abcc26cec0855952886b37f94869))

# [1.1.0](https://github.com/derekbar90/opencode-conductor/compare/v1.0.0...v1.1.0) (2025-12-30)


### Features

* add Julia style template to trigger release ([4e12120](https://github.com/derekbar90/opencode-conductor/commit/4e121200e4b4f4f0fe40f90436e5acb4594930bd))

# 1.0.0 (2025-12-30)


### Bug Fixes

* cleanup repository metadata and add npm auth diagnostic ([9fb5669](https://github.com/derekbar90/opencode-conductor/commit/9fb56691fcf0879fd0bf0dd1e68947f24270d017))
* Correct typos, step numbering, and documentation errors ([d825c32](https://github.com/derekbar90/opencode-conductor/commit/d825c326061ab63a4d3b8928cbf32bc3f6a9c797))
* Correct typos, trailing whitespace and grammar ([94edcbb](https://github.com/derekbar90/opencode-conductor/commit/94edcbbd0102eb6f9d5977eebf0cc3511aff6f64))
* explicit repository metadata and workflow cleanup for semantic-release ([b564486](https://github.com/derekbar90/opencode-conductor/commit/b564486989c9050ef7578d0451720f2127136fda))
* improve plugin initialization stability and add debug logging ([9ab52a4](https://github.com/derekbar90/opencode-conductor/commit/9ab52a4f25aa6e07a038de45ae093bf64a8d2335))
* Replace manual text input with interactive options ([746b2e5](https://github.com/derekbar90/opencode-conductor/commit/746b2e5f0a5ee9fc49edf8480dad3b8afffe8064))
* resolve hardcoded legacy paths in setup prompt and bundle templates ([fd5fad8](https://github.com/derekbar90/opencode-conductor/commit/fd5fad8c4ee1e2b4ceef85b996fbaa96794fb5a6))
* revert package name to opencode-conductor ([79ad7bd](https://github.com/derekbar90/opencode-conductor/commit/79ad7bd5e41b34e03f734f6132ee4959fdbb9cc3))
* **setup:** clarify definition of 'track' in setup flow ([819dcc9](https://github.com/derekbar90/opencode-conductor/commit/819dcc989d70d572d81655e0ac0314ede987f8b4))
* **setup:** Enhance project analysis protocol to avoid excessive token consumption. ([#6](https://github.com/derekbar90/opencode-conductor/issues/6)) ([1e60e8a](https://github.com/derekbar90/opencode-conductor/commit/1e60e8a96e5abeab966ff8d5bd95e14e3e331cfa))
* **styleguide:** Clarify usage of 'var' in C# guidelines for better readability ([a67b6c0](https://github.com/derekbar90/opencode-conductor/commit/a67b6c08cac15de54f01cd1e64fff3f99bc55462))
* **styleguide:** Enhance C# guidelines with additional rules for constants, collections, and argument clarity ([eea7495](https://github.com/derekbar90/opencode-conductor/commit/eea7495194edb01f6cfa86774cf2981ed012bf73))
* **styleguide:** Update C# formatting rules and guidelines for consistency ([50f39ab](https://github.com/derekbar90/opencode-conductor/commit/50f39abf9941ff4786e3b995d4c077bfdf07b9c9))
* **styleguide:** Update C# guidelines by removing async method suffix rule and adding best practices for structs, collection types, file organization, and namespaces ([8bfc888](https://github.com/derekbar90/opencode-conductor/commit/8bfc888b1b1a4191228f0d85e3ac89fe25fb9541))
* **styleguide:** Update C# guidelines for member ordering and enhance clarity on  string interpolation ([0e0991b](https://github.com/derekbar90/opencode-conductor/commit/0e0991b73210f83b2b26007e813603d3cd2f0d48))
* use shorthand repository and scoped package name to fix CI ([6457363](https://github.com/derekbar90/opencode-conductor/commit/6457363d7dc211af141edcad54c5f1034df1e6bf))
* yaml syntax error in publish workflow ([87da6c9](https://github.com/derekbar90/opencode-conductor/commit/87da6c9e01a406dc1460e9f9b4f30df273cbe784))


### Features

* add 10 new code style templates ([24b9a86](https://github.com/derekbar90/opencode-conductor/commit/24b9a8653d59f5c14246c79fef237fd3551aae6a))
* add C code style template ([29aa5e0](https://github.com/derekbar90/opencode-conductor/commit/29aa5e05bf3357dd2e10c6d09999a7e01cb5d173))
* add C++ code style template ([2629b28](https://github.com/derekbar90/opencode-conductor/commit/2629b28bed786c2dc810fc78a594aa881661933c))
* add CI for NPM publishing and auto-bootstrapping ([c29b653](https://github.com/derekbar90/opencode-conductor/commit/c29b653d49e71f4693a9c87d2bb72d05c259d1cf))
* Add GitHub Actions workflow to package and upload release assets. ([20858c9](https://github.com/derekbar90/opencode-conductor/commit/20858c90b48eabb5fe77aefab5a216269cc77c09))
* add Java style guide and fix CI release auth ([d69e7d2](https://github.com/derekbar90/opencode-conductor/commit/d69e7d288686d2adb9b2979b765418a8e457647f))
* add Solidity code style template ([4aaf01e](https://github.com/derekbar90/opencode-conductor/commit/4aaf01e366b4bbae75bc4ef2943186d709104c3e))
* add specialized 'conductor' agent for improved granularity ([9a44233](https://github.com/derekbar90/opencode-conductor/commit/9a44233a8955c6922aca531b653956afe541cba6))
* add Zig style template and fix YAML syntax in CI ([2480c38](https://github.com/derekbar90/opencode-conductor/commit/2480c380a188f50a8661a01c3f5d19d1d653be99))
* convert Gemini extension to OpenCode plugin ([6b208f7](https://github.com/derekbar90/opencode-conductor/commit/6b208f791abe6eaa3946a2c29e96743a7974c679))
* implement automated versioning with semantic-release ([4b7d0c4](https://github.com/derekbar90/opencode-conductor/commit/4b7d0c46824e09de957414b9d52c220dee08e09f))
* **styleguide:** Add comprehensive Google C# Style Guide summary ([e222aca](https://github.com/derekbar90/opencode-conductor/commit/e222aca7eb7475c07e618b410444f14090d62715))
