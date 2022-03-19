import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	
	let disposable = vscode.commands.registerTextEditorCommand('custom-auto-fold.autoFold', (textEditor) => {
		autoFold(textEditor);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {} 

async function autoFold(textEditor: vscode.TextEditor) {
	const origSelections = textEditor.selections;

	textEditor.selections = [new vscode.Selection(2,0,2,0)];
	await timeout(10);
	await vscode.commands.executeCommand("editor.fold");

	textEditor.selections = origSelections;
}

async function timeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


