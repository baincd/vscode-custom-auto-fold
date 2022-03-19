import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	
	let disposable = vscode.commands.registerCommand('custom-auto-fold.autoFold', () => {
		vscode.window.showInformationMessage('Hello World from Custom Auto Fold!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {} 
