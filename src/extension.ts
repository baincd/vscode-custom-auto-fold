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
		// console.log("auto-fold: activeTextEditor != TextDocument that was opened - aborting auto fold");
		return;
	}
	await autoFold(vscode.window.activeTextEditor);
}

async function autoFold(textEditor: vscode.TextEditor) {
	const autoFoldConfig = vscode.workspace.getConfiguration().get("custom-auto-fold") as AutoFoldConfig;
	if (!autoFoldConfig.rules) {
		return;
	}

	let didFold = false;
	const origSelections = textEditor.selections;
	const origVisibleRanges = textEditor.visibleRanges;

	for (var i = 0; i < autoFoldConfig.rules?.length; i++) {
		const rule = autoFoldConfig.rules[i]
		if (fileNameMatchesGlob(textEditor.document.fileName, rule.fileGlob)) {
			didFold = await applyAutoFoldRule(textEditor, rule, autoFoldConfig.betweenCommandsDelay) || didFold;
		}
	}

	if (didFold) {
		textEditor.selections = origSelections;
		textEditor.revealRange(origVisibleRanges[0],vscode.TextEditorRevealType.AtTop);
	}
}

async function applyAutoFoldRule(textEditor: vscode.TextEditor, rule: AutoFoldRule, delayBetweenCommands: number): Promise<boolean> {
	let didFold = false;

	const foldPattern = new RegExp(rule.linePattern);
	const maxLineIdx = textEditor.document.lineCount - 1;
	for (var lineIdx = 0; lineIdx <= maxLineIdx; lineIdx++) {
		if (foldPattern.test(textEditor.document.lineAt(lineIdx).text)) {
			didFold = true;
			const origSelectionLineIdx = textEditor.selection.start.line;
			await fold(textEditor, lineIdx, delayBetweenCommands);
			await resetNavigationHistory(textEditor, origSelectionLineIdx, lineIdx, textEditor.selection.start.line, delayBetweenCommands);
			if (rule.firstMatchOnly) {
				break;
			}
		}
	}

	return didFold;
}

async function resetNavigationHistory(textEditor: vscode.TextEditor, origLineIdx: number, foldLineIdx: number, lineIdxAfterFold: number, delayBetweenCommands: number) {
	// There must be at least 10 lines of difference for a cursor move to be added to the navigation history.  Refs:
	//     https://github.com/microsoft/vscode/issues/34763
	//     https://github.com/microsoft/vscode/issues/89699#issuecomment-581808250
	// Use "Go Back" command to navigate back in history, so when the user does "Go Back" it does not cycle through these moves
	if (foldLineIdx - lineIdxAfterFold >= 10) {
		await vscode.commands.executeCommand("workbench.action.navigateBack");
	} else {
		textEditor.selections = [new vscode.Selection(foldLineIdx, 0, foldLineIdx, 0)];
		await timeout(delayBetweenCommands);
	}
	if (Math.abs(foldLineIdx - origLineIdx) >= 10) {
		await vscode.commands.executeCommand("workbench.action.navigateBack");
	} else {
		textEditor.selections = [new vscode.Selection(origLineIdx, 0, origLineIdx, 0)];
		await timeout(delayBetweenCommands);
	}
}

async function fold(textEditor: vscode.TextEditor, lineIdx: number, delayBetweenCommands: number) {
	textEditor.selections = [new vscode.Selection(lineIdx, 0, lineIdx, 0)];
	await timeout(delayBetweenCommands);
	await vscode.commands.executeCommand("editor.fold");
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


