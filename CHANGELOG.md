# Change Log

All notable changes to the "custom-auto-fold" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.1] - 2022-08-20
### Fixed
- Do not stop folding on lines that match pattern but are unfoldable ([#1](https://github.com/baincd/vscode-custom-auto-fold/issues/1))

## [1.1.0] - 2021-03-26
### Fixed
- Improved implementation to remove auto-fold cursor moves from Go Back navigation history
- Do not check lines of just folded regions
- Refactored code to reduce duplication and improve readability

## [1.0.3] - 2021-03-26
### Fixed
- Fix navigation history when file is auto-folded

## [1.0.2] - 2021-03-21
### Fixed
- Corrected Changelog

## [1.0.1] - 2021-03-21
### Changed
- Reduce default delays based on real world testing
- Improve Go Back navigation when a file is auto-folded
- Improve settings examples

## [1.0.0] - 2021-03-20
- Initial Version
