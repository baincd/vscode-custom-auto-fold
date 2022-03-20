# Custom Auto Fold

Automatically fold specific sections when files are opened.

## Features

When opening a file, automatically fold sections of the file that match the configured regex.

Auto fold rules can also be run on an already opened file with the command `Run Auto Fold`

## Extension Settings

```jsonc
    "custom-auto-fold.rules": [
        {
            "fileGlob": "**/*.java", // Only auto fold files that match this file glob
            "linePattern": "^import\\s", // Regex pattern for line to fold (can match any line within folding section)
            "firstMatchOnly": true // Only fold the first matching line
        },
        // Can create multiple auto-fold rules
    ],
    "custom-auto-fold.betweenCommandsDelay": 10, // ms delay between commands
    "custom-auto-fold.delay": 250, // ms delay before starting auto fold when files are opened
```

Note that there are no default rules - you must configure `custom-auto-fold.rules` for this extension to do anything interesting.

[Click here](./Examples.md) to see some example rule configurations.

## How It Works

For files that match the `fileGlob` pattern, each line is tested against the `linePattern` regex pattern.  For each line (or the first line if `firstMatchOnly` is true) that matches the pattern, the cursor is moved to the line and the "Fold" command is run.

Once all the rules have been run, the cursor/selections and vertical scrolling are reset to what they were before.

## Known Issues

This extension depends on VS Code or other extensions to define folding regions in the editor before running.  You may want to adjust the `custom-auto-fold.delay` setting based on your VS Code performance for an optimal experience.

