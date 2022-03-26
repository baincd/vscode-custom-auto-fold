import * as minimatch from 'minimatch'
import * as vscode from 'vscode';
import {AutoFoldRule, AutoFoldConfig} from './types'

export function activate(context: vscode.ExtensionContext) {
	
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('custom-auto-fold.autoFold', (textEditor) => {
			new AutoFoldCommand(textEditor).autoFold();
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
	await new AutoFoldCommand(vscode.window.activeTextEditor).autoFold();
}

class AutoFoldCommand {
	private readonly textEditor: vscode.TextEditor;
	private readonly config: AutoFoldConfig;

	constructor(aTextEditor: vscode.TextEditor) {
		this.textEditor = aTextEditor;
		this.config = vscode.workspace.getConfiguration().get("custom-auto-fold") as AutoFoldConfig;
	}

	public async autoFold() {
		if (!this.config.rules) {
			return;
		}
	
		let didFold = false;
		const origSelections = this.textEditor.selections;
		const origVisibleRanges = this.textEditor.visibleRanges;
	
		for (var i = 0; i < this.config.rules?.length; i++) {
			const rule = this.config.rules[i]
			if (fileNameMatchesGlob(this.textEditor.document.fileName, rule.fileGlob)) {
				didFold = await this.applyAutoFoldRule(rule) || didFold;
			}
		}
	
		if (didFold) {
			this.textEditor.selections = origSelections;
			this.textEditor.revealRange(origVisibleRanges[0],vscode.TextEditorRevealType.AtTop);
		}
	}

	private async applyAutoFoldRule(rule: AutoFoldRule): Promise<boolean> {
		let didFold = false;
	
		const foldPattern = new RegExp(rule.linePattern);
		const maxLineIdx = this.textEditor.document.lineCount - 1;
		for (var lineIdx = 0; lineIdx <= maxLineIdx; lineIdx++) {
			if (foldPattern.test(this.textEditor.document.lineAt(lineIdx).text)) {
				didFold = true;
				const origSelectionLineIdx = this.textEditor.selection.start.line;
				await this.fold(lineIdx);
				await this.resetNavigationHistory(origSelectionLineIdx, lineIdx, this.textEditor.selection.start.line);
				if (rule.firstMatchOnly) {
					break;
				}
			}
		}
	
		return didFold;
	}

	private async resetNavigationHistory(origLineIdx: number, foldLineIdx: number, lineIdxAfterFold: number) {
		await this.navigateBack(lineIdxAfterFold, foldLineIdx);
		await this.navigateBack(foldLineIdx, origLineIdx);
	}

	/** Navigate backwards, removing cursor moved from navigation history (technically the moves may still be in the forward history, but thats ok...) */
	private async navigateBack(fromLineIdx: number, toLineIdx: number) {
		// There must be at least 10 lines of difference for a cursor move to be added to the navigation history.  Refs:
		//     https://github.com/microsoft/vscode/issues/34763
		//     https://github.com/microsoft/vscode/issues/89699#issuecomment-581808250
		// Use "Go Back" command to navigate back in history, so when the user does "Go Back" it does not cycle through these moves
		if (Math.abs(fromLineIdx - toLineIdx) >= 10) {
			await vscode.commands.executeCommand("workbench.action.navigateBack");
		} else {
			await this.gotoLine(toLineIdx);
		}
	}

	private async fold(lineIdx: number) {
		await this.gotoLine(lineIdx);
		await vscode.commands.executeCommand("editor.fold");
	}

	private async gotoLine(lineIdx: number) {
		this.textEditor.selections = [new vscode.Selection(lineIdx, 0, lineIdx, 0)];
		await timeout(this.config.betweenCommandsDelay);
	}
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


