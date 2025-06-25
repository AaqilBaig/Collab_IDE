import React, { useEffect, useRef, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { oneDarkTheme } from '@codemirror/theme-one-dark';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

// Define language support
const languageMap = {
  javascript: javascript(),
  html: html(),
  css: css(),
  python: python(),
  // Add fallback for unknown languages
  default: javascript()
};

const CodeEditor = ({ 
  content, 
  language, 
  readOnly = false, 
  onChange,
  onCursorChange,
  collaborators = []
}) => {  const editorRef = useRef(null);
  const editorViewRef = useRef(null);
  const theme = useTheme();
  const isUserTypingRef = useRef(false);
  
  // Create stable references for callbacks
  const onChangeRef = useRef(onChange);
  const onCursorChangeRef = useRef(onCursorChange);
  
  // Update refs when props change
  useEffect(() => {
    onChangeRef.current = onChange;
    onCursorChangeRef.current = onCursorChange;
  });
  // Initialize editor
  useEffect(() => {
    if (editorRef.current && !editorViewRef.current) {
      // Get language extension - default to javascript if not found
      const languageExtension = languageMap[language] || languageMap.default;
      
      const startState = EditorState.create({
        doc: content || '', // Use content from props for initial state
        extensions: [
          // Basic editor functionality
          lineNumbers(),
          highlightActiveLine(),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          syntaxHighlighting(defaultHighlightStyle),
          
          // Language support
          languageExtension,
          
          // Theme
          oneDarkTheme,            // Event listeners
          EditorView.updateListener.of(update => {
            if (update.docChanged && !readOnly) {
              // Mark that user is actively typing
              isUserTypingRef.current = true;
              
              const newContent = update.state.doc.toString();
              onChangeRef.current && onChangeRef.current(newContent);
              
              // Clear the typing flag after a short delay
              setTimeout(() => {
                isUserTypingRef.current = false;
              }, 100);
            }
              if (update.selectionSet && !readOnly) {
              const ranges = update.state.selection.ranges;
              const mainRange = ranges[0];
              
              // Get pixel coordinates for the cursor position
              const coords = editorViewRef.current.coordsAtPos(mainRange.head);
              const editorRect = editorViewRef.current.dom.getBoundingClientRect();
              
              // Calculate relative position within the editor
              const relativePos = {
                offset: mainRange.head,
                line: update.state.doc.lineAt(mainRange.head).number,
                ch: mainRange.head - update.state.doc.lineAt(mainRange.head).from,
                top: coords ? coords.top - editorRect.top : 0,
                left: coords ? coords.left - editorRect.left : 0
              };
              
              onCursorChangeRef.current && onCursorChangeRef.current(relativePos);
            }
          }),
          
          // Read-only state
          EditorState.readOnly.of(readOnly)
        ]
      });
      
      // Create editor view
      const view = new EditorView({
        state: startState,
        parent: editorRef.current
      });
      
      editorViewRef.current = view;
      
      return () => {
        if (editorViewRef.current) {
          editorViewRef.current.destroy();
          editorViewRef.current = null;
        }
      };
    }
  }, [language, readOnly, content]); // Include content in dependencies    // Update content when it changes externally (including initial load)
  useEffect(() => {
    if (editorViewRef.current && !isUserTypingRef.current) {
      const currentContent = editorViewRef.current.state.doc.toString();
      if (content !== currentContent) {
        // Store current selection to restore after update
        const selection = editorViewRef.current.state.selection;
        
        const transaction = editorViewRef.current.state.update({
          changes: {
            from: 0,
            to: editorViewRef.current.state.doc.length,
            insert: content || ''
          },
          selection: selection // Preserve selection
        });
        
        editorViewRef.current.dispatch(transaction);
      }
    }
  }, [content]);
  
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        '& .cm-editor': {
          height: '100%',
          fontSize: '14px',
        },
        '& .cm-scroller': {
          overflow: 'auto',
          fontFamily: 'monospace',
        },
        position: 'relative',
      }}
    >
      <div ref={editorRef} style={{ width: '100%', height: '100%' }} />
        {/* Render collaborator cursors */}
      {collaborators.map(collab => {
        // Convert position data to pixel coordinates if needed
        let cursorTop = 0;
        let cursorLeft = 0;
        
        if (collab.position && editorViewRef.current) {
          if (typeof collab.position.top === 'number' && typeof collab.position.left === 'number') {
            // Already pixel coordinates
            cursorTop = collab.position.top;
            cursorLeft = collab.position.left;
          } else if (typeof collab.position.offset === 'number') {
            // Convert offset to pixel coordinates
            try {
              const coords = editorViewRef.current.coordsAtPos(collab.position.offset);
              const editorRect = editorViewRef.current.dom.getBoundingClientRect();
              if (coords) {
                cursorTop = coords.top - editorRect.top;
                cursorLeft = coords.left - editorRect.left;
              }
            } catch (error) {
              console.warn('Error converting cursor position:', error);
            }
          } else if (typeof collab.position.line === 'number' && typeof collab.position.ch === 'number') {
            // Convert line/ch to offset, then to pixel coordinates
            try {
              const line = editorViewRef.current.state.doc.line(collab.position.line);
              const offset = line.from + Math.min(collab.position.ch, line.length);
              const coords = editorViewRef.current.coordsAtPos(offset);
              const editorRect = editorViewRef.current.dom.getBoundingClientRect();
              if (coords) {
                cursorTop = coords.top - editorRect.top;
                cursorLeft = coords.left - editorRect.left;
              }
            } catch (error) {
              console.warn('Error converting line/ch position:', error);
            }
          }
        }
        
        return (
          <Box
            key={collab.userId}
            sx={{
              position: 'absolute',
              width: '2px',
              height: '20px',
              backgroundColor: collab.color || theme.palette.secondary.main,
              top: cursorTop,
              left: cursorLeft,
              zIndex: 10,
              pointerEvents: 'none',
              transition: 'top 0.1s ease, left 0.1s ease', // Smooth cursor movement
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '-22px',
                left: '3px',
                backgroundColor: collab.color || theme.palette.secondary.main,
                color: '#fff',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {collab.username}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default CodeEditor;
