# OpenCode Mobile: UI Patterns Translation

This document analyzes the UI patterns found in the OpenCode TUI and Desktop applications and outlines how they map to native mobile paradigms for the iOS/Android app built with React Native.

## 1. Top-Level Layout Strategy

### Desktop Pattern (Split Panes)
The OpenCode desktop app utilizes a distinct split-pane layout:
*   **Left Sidebar:** Project list, active workspaces, and session history (`SidebarContent`, `LocalWorkspace`).
*   **Main Content Area:** The active session's conversation thread or the welcome screen (`Session` layout).
*   **Persistent Input:** Always visible prompt box anchored at the bottom of the main content area.

### Mobile Translation
On mobile, screen real estate is constrained. The split-pane paradigm translates to a **Stack/Tab Navigation** pattern:
*   **Main Tabs:** A bottom tab bar (`expo-router` Tabs) for top-level navigation (Home, Sessions, Settings).
*   **Drill-down Navigation:** The session list (Sidebar equivalent) becomes a full screen. Tapping a session pushes the active chat view onto the stack.
*   **Persistent Input:** Anchored `KeyboardAvoidingView` at the bottom of the active session screen.

## 2. Context Menus & Modals

### Desktop Pattern (Command Palette & Dialogs)
The desktop incorporates command palettes (e.g., `Ctrl+P`) and specific floating dialogs (e.g., `<DialogSelectProvider>`, `<DialogSettings>`). Actions like "Rename Session" or "Delete Session" are often triggered via keyboard shortcuts or contextual right-clicks.

### Mobile Translation
*   **Bottom Sheets:** Complex dialogs like Provider Selection or Model parameters should map to draggable Bottom Sheets (`@gorhom/bottom-sheet` or native modals) rather than centered alert dialogs.
*   **Long-Press Menus:** Right-click context menus map to touch-and-hold (Long Press) interactions on list items (e.g., holding a session card to reveal Rename/Delete actions).
*   **Swipe Actions:** Deleting a session should support a standard iOS-style left-swipe "Delete" gesture.

## 3. Session Thread Rendering

### Desktop Pattern
Messages inside a session are rendered sequentially and can contain various blocks (Text, Code, Tool Calls, Differences). A `Terminal` view is occasionally overlaid or embedded for execution outputs. It supports auto-scrolling on new content and complex syntax highlighting via ProseMirror/Markdown parsers.

### Mobile Translation
*   **FlatList / FlashList:** The chat history must be rendered using a highly optimized virtualized list (e.g., `@shopify/flash-list`) to maintain 60FPS while rendering long message chains.
*   **Markdown Rendering:** Use `react-native-markdown-display` or a custom parser to properly render markdown blocks. Code blocks should support horizontal scrolling.
*   **Tool States:** Agent tool calls (e.g., "Reading file `foo.ts`") should map to compact inline components with loading spinners. Detailed terminal output should be hidden behind an expanding "accordion" element to save vertical space.

## 4. Navigation & State Synchronization

### Desktop Pattern
The desktop connects to the OpenCode engine over SSE and HTTP (`GlobalSyncProvider`, `useGlobalSDK`) and uses reactive primitives (SolidJS `createEffect`, `createSignal`) to sync local storage and remote state.

### Mobile Translation
The mobile app should retain the direct fetch/SSE approach (avoiding the bloated JS SDK), relying instead on:
*   `react-native-sse` for streaming events.
*   `Zustand` for global state management and session caching.
*   `expo-secure-store` for retaining authentication settings (addressing MMKV incompatibilities).
