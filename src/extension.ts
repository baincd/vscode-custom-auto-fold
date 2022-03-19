import * as minimatch from 'minimatch'

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	
	let disposable = vscode.commands.registerTextEditorCommand('custom-auto-fold.autoFold', (textEditor) => {
		autoFold(textEditor);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {} 

async function autoFold(textEditor: vscode.TextEditor) {
	if (!minimatch(textEditor.document.fileName, "**/*.java")) {
		return;
	}

	const origSelections = textEditor.selections;

	const foldPattern = new RegExp("^import ")
	const maxLineIdx = textEditor.document.lineCount - 1;
	for (var lineIdx = 0; lineIdx <= maxLineIdx; lineIdx++) {
		if (foldPattern.test(textEditor.document.lineAt(lineIdx).text)) {
			textEditor.selections = [new vscode.Selection(lineIdx,0,lineIdx,0)];
			await timeout(10);
			await vscode.commands.executeCommand("editor.fold");
		}
	}

	textEditor.selections = origSelections;
}

async function timeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


