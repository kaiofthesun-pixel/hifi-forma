/**
 * Global Text Editor Tool
 * Select any text on the page, click the edit button, modify it, and save.
 * Edits persist across page reloads using localStorage.
 *
 * To clear all edits, run in console: window.clearTextEdits()
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'portfolio-text-edits';
    const WIDTH_STORAGE_KEY = 'portfolio-width-edits';

    // Load saved edits from localStorage
    function loadEdits() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    // Save edits to localStorage
    function saveEdits(edits) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
        console.log('[TextEditor] Saved edits:', edits);
    }

    // Load saved width edits from localStorage
    function loadWidthEdits() {
        try {
            return JSON.parse(localStorage.getItem(WIDTH_STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    // Save width edits to localStorage
    function saveWidthEdits(edits) {
        localStorage.setItem(WIDTH_STORAGE_KEY, JSON.stringify(edits));
        console.log('[TextEditor] Saved width edits:', edits);
    }

    // Clear all edits (exposed globally for debugging)
    window.clearTextEdits = function() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(WIDTH_STORAGE_KEY);
        console.log('[TextEditor] All edits cleared. Refresh to see original text.');
        location.reload();
    };

    // Show current edits (exposed globally for debugging)
    window.showTextEdits = function() {
        console.log('[TextEditor] Current text edits:', loadEdits());
        console.log('[TextEditor] Current width edits:', loadWidthEdits());
        return { text: loadEdits(), width: loadWidthEdits() };
    };

    // Convert text with newlines to HTML with <br> tags
    function textToHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }

    // Convert HTML with <br> tags back to text with newlines
    function htmlToText(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        // Replace <br> with newlines
        temp.querySelectorAll('br').forEach(br => {
            br.replaceWith('\n');
        });
        return temp.textContent;
    }

    // Generate a unique path for an element
    function getElementPath(el) {
        const parts = [];
        while (el && el !== document.body) {
            let selector = el.tagName.toLowerCase();
            if (el.id) {
                selector += '#' + el.id;
                parts.unshift(selector);
                break;
            } else {
                const parent = el.parentElement;
                if (parent) {
                    const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
                    if (siblings.length > 1) {
                        const index = siblings.indexOf(el);
                        selector += ':nth-of-type(' + (index + 1) + ')';
                    }
                }
                parts.unshift(selector);
            }
            el = el.parentElement;
        }
        return parts.join(' > ');
    }

    // Apply saved edits on page load
    function applyEdits() {
        const edits = loadEdits();
        const pageKey = window.location.pathname;
        const pageEdits = edits[pageKey] || {};

        console.log('[TextEditor] Applying edits for', pageKey, Object.keys(pageEdits).length, 'edits found');

        Object.keys(pageEdits).forEach(path => {
            try {
                const el = document.querySelector(path);
                if (el) {
                    console.log('[TextEditor] Applying edit to', path);
                    el.innerHTML = textToHtml(pageEdits[path].edited);
                } else {
                    console.warn('[TextEditor] Element not found for path:', path);
                }
            } catch (e) {
                console.warn('[TextEditor] Could not apply edit for path:', path, e);
            }
        });

        // Apply width edits
        const widthEdits = loadWidthEdits();
        const pageWidthEdits = widthEdits[pageKey] || {};

        console.log('[TextEditor] Applying width edits for', pageKey, Object.keys(pageWidthEdits).length, 'width edits found');

        Object.keys(pageWidthEdits).forEach(path => {
            try {
                const el = document.querySelector(path);
                if (el) {
                    console.log('[TextEditor] Applying width to', path, pageWidthEdits[path].width);
                    el.style.maxWidth = pageWidthEdits[path].width + 'px';
                } else {
                    console.warn('[TextEditor] Element not found for width path:', path);
                }
            } catch (e) {
                console.warn('[TextEditor] Could not apply width for path:', path, e);
            }
        });
    }

    // Create the flyout UI
    const flyout = document.createElement('div');
    flyout.id = 'text-editor-flyout';
    flyout.innerHTML = `
        <button id="te-edit-btn" title="Edit text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
        </button>
        <button id="te-width-btn" title="Edit max width">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12H3"/>
                <path d="M21 12l-4-4"/>
                <path d="M21 12l-4 4"/>
                <path d="M3 12l4-4"/>
                <path d="M3 12l4 4"/>
            </svg>
        </button>
        <button id="te-undo-btn" title="Undo edit" style="display: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7v6h6"/>
                <path d="M3 13c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9a9 9 0 0 1-7.5-4"/>
            </svg>
        </button>
    `;

    const editorModal = document.createElement('div');
    editorModal.id = 'text-editor-modal';
    editorModal.innerHTML = `
        <div id="te-modal-content">
            <textarea id="te-textarea"></textarea>
            <div id="te-actions">
                <button id="te-cancel">Cancel</button>
                <button id="te-save">Save</button>
            </div>
        </div>
    `;

    const widthModal = document.createElement('div');
    widthModal.id = 'text-width-modal';
    widthModal.innerHTML = `
        <div id="tw-modal-content">
            <label for="tw-input" style="font-family: 'Inter', sans-serif; font-size: 13px; color: #333; margin-bottom: 8px; display: block;">Max Width (px)</label>
            <input type="number" id="tw-input" min="100" max="2000" step="10">
            <div id="tw-actions">
                <button id="tw-cancel">Cancel</button>
                <button id="tw-save">Save</button>
            </div>
        </div>
    `;

    const styles = document.createElement('style');
    styles.textContent = `
        #text-editor-flyout {
            position: fixed;
            z-index: 10000;
            display: none;
            background: #1c1c1c;
            border-radius: 6px;
            padding: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            gap: 2px;
        }
        #text-editor-flyout button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border: none;
            background: transparent;
            color: #fff;
            cursor: pointer;
            border-radius: 4px;
            transition: background 0.15s;
        }
        #text-editor-flyout button:hover {
            background: rgba(255,255,255,0.15);
        }

        #text-editor-modal,
        #text-width-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 10001;
            display: none;
            align-items: center;
            justify-content: center;
        }
        #text-editor-modal.visible,
        #text-width-modal.visible {
            display: flex;
        }
        #te-modal-content,
        #tw-modal-content {
            background: #fff;
            border-radius: 12px;
            padding: 20px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        #te-textarea {
            width: 100%;
            min-height: 120px;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            line-height: 1.5;
            resize: vertical;
            outline: none;
            box-sizing: border-box;
        }
        #te-textarea:focus {
            border-color: #c0392b;
        }
        #tw-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
        }
        #tw-input:focus {
            border-color: #c0392b;
        }
        #te-actions,
        #tw-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 14px;
        }
        #te-actions button,
        #tw-actions button {
            padding: 8px 16px;
            border-radius: 6px;
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.15s;
        }
        #te-cancel,
        #tw-cancel {
            background: #f0f0f0;
            border: none;
            color: #333;
        }
        #te-cancel:hover,
        #tw-cancel:hover {
            background: #e0e0e0;
        }
        #te-save,
        #tw-save {
            background: #c0392b;
            border: none;
            color: #fff;
        }
        #te-save:hover,
        #tw-save:hover {
            background: #a93226;
        }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(flyout);
    document.body.appendChild(editorModal);
    document.body.appendChild(widthModal);

    let selectedElement = null;
    let originalText = '';
    let selectedElementPath = null;

    // Check if element has saved edits
    function hasTextEdit(el) {
        if (!el) return false;
        const path = getElementPath(el);
        const edits = loadEdits();
        const pageKey = window.location.pathname;
        return edits[pageKey] && edits[pageKey][path];
    }

    function hasWidthEdit(el) {
        if (!el) return false;
        const path = getElementPath(el);
        const edits = loadWidthEdits();
        const pageKey = window.location.pathname;
        return edits[pageKey] && edits[pageKey][path];
    }

    // Show flyout near selection, ensuring it stays on screen
    function showFlyout(x, y) {
        flyout.style.display = 'flex';
        const flyoutRect = flyout.getBoundingClientRect();
        const padding = 10;

        // Adjust x to stay on screen
        if (x + flyoutRect.width > window.innerWidth - padding) {
            x = window.innerWidth - flyoutRect.width - padding;
        }
        if (x < padding) {
            x = padding;
        }

        // Adjust y to stay on screen
        if (y + flyoutRect.height > window.innerHeight - padding) {
            y = window.innerHeight - flyoutRect.height - padding;
        }
        if (y < padding) {
            y = padding;
        }

        flyout.style.left = x + 'px';
        flyout.style.top = y + 'px';
    }

    function hideFlyout() {
        flyout.style.display = 'none';
    }

    // Check if element is editable (has mostly text content)
    function isEditableElement(el) {
        if (!el) return false;
        // Skip script, style, and other non-content elements
        const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH', 'IMG', 'VIDEO', 'AUDIO', 'CANVAS', 'IFRAME'];
        if (skipTags.includes(el.tagName)) return false;
        // Skip our own UI elements
        if (el.closest('#text-editor-flyout') || el.closest('#text-editor-modal') || el.closest('#text-width-modal')) return false;
        // Must have some text content
        if (el.textContent.trim().length === 0) return false;
        return true;
    }

    // Find the best editable element for a selection
    function findEditableElement(container) {
        // Walk up to find a suitable element
        let el = container;
        while (el && el !== document.body) {
            // Check if this is a good text container (p, span, div, li, h1-h6, etc.)
            const goodTags = ['P', 'SPAN', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'STRONG', 'EM', 'B', 'I', 'LABEL', 'TD', 'TH'];
            if (goodTags.includes(el.tagName) && isEditableElement(el)) {
                // Prefer elements that don't have too many child elements
                const childElements = el.querySelectorAll('*').length;
                if (childElements <= 10) {
                    return el;
                }
            }
            el = el.parentElement;
        }
        return null;
    }

    // Handle text selection
    document.addEventListener('mouseup', (e) => {
        // Ignore if clicking on flyout or modal
        if (flyout.contains(e.target) || editorModal.contains(e.target) || widthModal.contains(e.target)) return;

        // Small delay to let selection finalize
        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString().trim();

            if (text.length > 0 && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                let container = range.commonAncestorContainer;

                // Get the actual element (not text node)
                if (container.nodeType === Node.TEXT_NODE) {
                    container = container.parentElement;
                }

                // Find best editable element
                const editableEl = findEditableElement(container);

                if (editableEl) {
                    selectedElement = editableEl;
                    selectedElementPath = getElementPath(editableEl);
                    originalText = htmlToText(editableEl.innerHTML);

                    // Show/hide undo button based on whether this element has edits
                    const undoBtn = document.getElementById('te-undo-btn');
                    if (hasTextEdit(editableEl) || hasWidthEdit(editableEl)) {
                        undoBtn.style.display = 'flex';
                    } else {
                        undoBtn.style.display = 'none';
                    }

                    const rect = range.getBoundingClientRect();
                    showFlyout(rect.right + 8, rect.top - 4);
                } else {
                    hideFlyout();
                    selectedElement = null;
                    selectedElementPath = null;
                }
            } else {
                hideFlyout();
                selectedElement = null;
                selectedElementPath = null;
            }
        }, 10);
    });

    // Edit button click
    document.getElementById('te-edit-btn').addEventListener('click', () => {
        if (!selectedElement) return;

        hideFlyout();
        document.getElementById('te-textarea').value = htmlToText(selectedElement.innerHTML);
        editorModal.classList.add('visible');
        document.getElementById('te-textarea').focus();
    });

    // Width button click
    document.getElementById('te-width-btn').addEventListener('click', () => {
        if (!selectedElement) return;

        hideFlyout();
        // Get current max-width or computed width
        const currentMaxWidth = selectedElement.style.maxWidth || window.getComputedStyle(selectedElement).maxWidth;
        const numericWidth = parseInt(currentMaxWidth) || selectedElement.offsetWidth;
        document.getElementById('tw-input').value = numericWidth;
        widthModal.classList.add('visible');
        document.getElementById('tw-input').focus();
        document.getElementById('tw-input').select();
    });

    // Undo button click
    document.getElementById('te-undo-btn').addEventListener('click', () => {
        if (!selectedElement || !selectedElementPath) return;

        const pageKey = window.location.pathname;

        // Remove text edit if exists
        const textEdits = loadEdits();
        if (textEdits[pageKey] && textEdits[pageKey][selectedElementPath]) {
            delete textEdits[pageKey][selectedElementPath];
            if (Object.keys(textEdits[pageKey]).length === 0) {
                delete textEdits[pageKey];
            }
            saveEdits(textEdits);
        }

        // Remove width edit if exists
        const widthEdits = loadWidthEdits();
        if (widthEdits[pageKey] && widthEdits[pageKey][selectedElementPath]) {
            delete widthEdits[pageKey][selectedElementPath];
            if (Object.keys(widthEdits[pageKey]).length === 0) {
                delete widthEdits[pageKey];
            }
            saveWidthEdits(widthEdits);
        }

        hideFlyout();
        selectedElement = null;
        selectedElementPath = null;
        window.getSelection().removeAllRanges();

        // Reload page to restore original content
        location.reload();
    });

    // Cancel button (text)
    document.getElementById('te-cancel').addEventListener('click', () => {
        editorModal.classList.remove('visible');
        selectedElement = null;
        window.getSelection().removeAllRanges();
    });

    // Cancel button (width)
    document.getElementById('tw-cancel').addEventListener('click', () => {
        widthModal.classList.remove('visible');
        selectedElement = null;
        window.getSelection().removeAllRanges();
    });

    // Save button (text)
    document.getElementById('te-save').addEventListener('click', () => {
        if (!selectedElement) return;

        const newText = document.getElementById('te-textarea').value;
        selectedElement.innerHTML = textToHtml(newText);

        // Save to localStorage
        const edits = loadEdits();
        const pageKey = window.location.pathname;
        if (!edits[pageKey]) edits[pageKey] = {};

        const path = getElementPath(selectedElement);
        edits[pageKey][path] = {
            original: originalText.trim().substring(0, 50),
            edited: newText
        };
        saveEdits(edits);

        editorModal.classList.remove('visible');
        selectedElement = null;
        window.getSelection().removeAllRanges();
    });

    // Save button (width)
    document.getElementById('tw-save').addEventListener('click', () => {
        if (!selectedElement) return;

        const newWidth = parseInt(document.getElementById('tw-input').value);
        if (isNaN(newWidth) || newWidth < 100) return;

        selectedElement.style.maxWidth = newWidth + 'px';

        // Save to localStorage
        const edits = loadWidthEdits();
        const pageKey = window.location.pathname;
        if (!edits[pageKey]) edits[pageKey] = {};

        const path = getElementPath(selectedElement);
        edits[pageKey][path] = {
            width: newWidth
        };
        saveWidthEdits(edits);

        widthModal.classList.remove('visible');
        selectedElement = null;
        window.getSelection().removeAllRanges();
    });

    // Close modal on backdrop click
    editorModal.addEventListener('click', (e) => {
        if (e.target === editorModal) {
            editorModal.classList.remove('visible');
            selectedElement = null;
        }
    });

    widthModal.addEventListener('click', (e) => {
        if (e.target === widthModal) {
            widthModal.classList.remove('visible');
            selectedElement = null;
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideFlyout();
            editorModal.classList.remove('visible');
            widthModal.classList.remove('visible');
            selectedElement = null;
        }
    });

    // Apply edits when DOM is ready (with small delay to ensure page is fully rendered)
    function initApplyEdits() {
        // Use requestAnimationFrame + setTimeout to ensure DOM is fully painted
        requestAnimationFrame(() => {
            setTimeout(applyEdits, 50);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApplyEdits);
    } else {
        initApplyEdits();
    }
})();
