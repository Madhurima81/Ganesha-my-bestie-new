/**
 * Separate entry point for the Layout Editor — NOT the main app.
 * Served by /layout-editor.html.
 *
 *   npm run dev  →  http://localhost:5173/layout-editor.html?set=bridge
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import LayoutEditor from './LayoutEditor.jsx';
import '../index.css';

ReactDOM.createRoot(document.getElementById('root')).render(<LayoutEditor />);
