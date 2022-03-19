import * as minimatch from 'minimatch'
import * as vscode from 'vscode';
import {AutoFoldRule, AutoFoldConfig} from './types'

export function activate(context: vscode.ExtensionContext) {
	
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('custom-auto-fold.autoFold', (textEditor) => {
			autoFold(textEditor);
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(textDocument => {
			textDocumentOpened(textDocument);
		})
	);

}

export function deactivate() {} 

async function textDocumentOpened(textDocument: vscode.TextDocument) {
	await timeout(vscode.workspace.getConfiguration().get("custom-auto-fold.delay") as number);
	if (vscode.window.activeTextEditor?.document != textDocument) {
		console.log("auto-fold: activeTextEditor != TextDocument that was opened - aborting auto fold");
		return;
	}
	await autoFold(vscode.window.activeTextEditor);
}

async function autoFold(textEditor: vscode.TextEditor) {
	const autoFoldConfig = vscode.workspace.getConfiguration().get("custom-auto-fold") as AutoFoldConfig;
	if (!autoFoldConfig.rules) {
		return;
	}
	for (var i = 0; i < autoFoldConfig.rules?.length; i++) {
		const rule = autoFoldConfig.rules[i]
		if (fileNameMatchesGlob(textEditor.document.fileName, rule.fileGlob)) {
			await applyAutoFoldRule(textEditor, rule, autoFoldConfig.betweenCommandsDelay);
		}
	}
}

async function applyAutoFoldRule(textEditor: vscode.TextEditor, rule: AutoFoldRule, delayBetweenCommands: number) {
	const origSelections = textEditor.selections;

	const foldPattern = new RegExp(rule.linePattern);
	const maxLineIdx = textEditor.document.lineCount - 1;
	for (var lineIdx = 0; lineIdx <= maxLineIdx; lineIdx++) {
		if (foldPattern.test(textEditor.document.lineAt(lineIdx).text)) {
			textEditor.selections = [new vscode.Selection(lineIdx, 0, lineIdx, 0)];
			await timeout(delayBetweenCommands);
			await vscode.commands.executeCommand("editor.fold");
			if (rule.firstMatchOnly) {
				break;
			}
		}
	}

	textEditor.selections = origSelections;
}

async function timeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function fileNameMatchesGlob(fileName: string, globStr?: string): boolean {
	if (!globStr || minimatch(fileName, globStr)) {
		return true;
	} else {
		return false;
	}
}


