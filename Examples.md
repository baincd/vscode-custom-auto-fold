# Custom Auto Fold Rules Examples

These are example configurations that can be used in the `custom-auto-fold.rules` setting.

<details>
<summary>Fold imports on Java files</summary>

```jsonc
{
    "fileGlob": "**/{*.java,*.class}",
    "linePattern": "^import\\s",
    "firstMatchOnly": true
},
```

ℹ️ - Due to limitations in the JDT, imports on \*.class files are not foldable.  See the extension [Java Class Imports Folding](https://marketplace.visualstudio.com/items?itemName=baincd.java-class-imports-folding) for a workaround.

</details>

<details>
<summary>Fold copyright header comments on Java files</summary>

```jsonc
{
    "fileGlob": "**/*.class",
    "linePattern": "^(/| )\\*.*[cC](opyright|OPYRIGHT)",
    "firstMatchOnly": true
},
```
</details>


