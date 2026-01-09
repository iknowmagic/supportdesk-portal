# App File Index

This starter keeps the tree intentionally small, so we do not maintain a line-by-line index here. Use the project explorer to navigate and update this file only if you add notable new areas.

Key entry points today:
- src/main.tsx — app bootstrap
- src/routes.tsx — route definitions for Dashboard and Components Showcase
- src/pages/ — demo pages
- src/components/ — shared UI (modals, auth, layout helpers)
- src/lib/ — Supabase client, query setup, and utilities
- src/store/ — Jotai atoms/hooks

### src/lib/recurrenceTransforms.ts
Handles transformations between UI recurrence state and database recurrence formats.

### src/lib/userPreferences.ts
Handles retrieval and persistence of user preferences including working hours, timezone, default task settings, etc.

### src/lib/colorUtils.ts
Contains functions for color manipulation and palette generation.

### src/lib/noctare.ts
Provides logging and analytics functionality under the Noctare brand.

### src/lib/devLogger.ts
Development logging utilities for debugging and tracking application behavior.

### src/lib/constants.ts
Contains application-wide constant values like default colors and duration values.

### src/lib/utils.ts
General utility functions including ID generation and class name merging.

### src/lib/clearSupabaseStorage.ts
Developer utility function to clear Supabase-related localStorage items, accessible from browser console.

### src/lib/schedulingLoop/
Implementation of the scheduling placement logic:

### src/lib/schedulingLoop/placement.ts
Implements the "Gap-First" placement algorithm that fills available calendar gaps with tasks based on priority order.

### src/lib/schedulingLoop/mapmaker.ts
Generates available scheduling gaps by calculating free time within user preferences, working hours, and existing commitments.

### src/lib/schedulingLoop/fitCheck.ts
Implements the logic to determine if a task can fit in a specific time gap, considering buffer requirements and splittable constraints.

### src/lib/schedulingLoop/timezones.ts
Handles timezone conversion logic for translating local time preferences to UTC for scheduling calculations.

### src/lib/schedulingLoop/anchors.ts
Manages immutable time anchors (non-auto-scheduled events) that cannot be modified by the scheduler.

### src/lib/schedulingLoop/constants.ts
Contains constants for the scheduling loop including time intervals and conversion factors.

### src/lib/schedulingLoop/gapGenerator.ts
Generates time gaps in which tasks can be scheduled based on user preferences and existing events.

### src/lib/schedulingLoop/types.ts
Type definitions for the scheduling loop including placement and gap types.

### src/lib/schedulingLoop/timezoneCache.ts
Caches timezone conversion results for performance optimization.

### src/components/
UI Components:

### src/components/RouterApp.tsx
Wrapper component that provides the router context with authentication information.

### src/components/Login.tsx
Authentication UI for email login with OTP/Magic link support.

### src/components/VerifyOtp.tsx
UI for verifying OTP codes sent to the user's email.

### src/components/TaskModal/
Task creation/editing modal components:

### src/components/TaskModal/TaskModal.tsx
Main task modal component that handles both basic and extended task creation/editing with auto/manual scheduling options.

### src/components/BuffersSection.tsx
Shared UI section for configuring task buffers (enable toggle + before/after selectors) used by TaskModal and Settings.

### src/components/CategoryColorPicker.tsx
Shared color palette UI for picking category colors (quick row + expanded grid).

### src/components/TaskModal/DeadlineSection.tsx
UI section for setting task deadlines and due dates.

### src/components/TaskModal/DependenciesSection.tsx
UI section for managing task dependencies and dependency stacks.

### src/components/SplittableSection.tsx
Shared UI section for configuring splittable task parameters (enable toggle + min/max selectors) used by TaskModal and Settings.

### src/components/TaskModal/PrecedenceSection.tsx
UI section for configuring task priority and precedence settings.

### src/components/TaskModal/RecurrenceSection.tsx
UI section for setting task recurrence patterns.

### src/components/TaskModal/ManualTimeSection.tsx
UI section for manual time scheduling when auto-scheduling is disabled.

### src/components/TaskModal/NotesSection.tsx
Markdown notes editor section for TaskModal.

### src/components/TaskModal/TaskDurationPicker.tsx
UI component for selecting task duration from preset options.

### src/components/TaskModal/TaskCategoryPicker.tsx
UI component for selecting task categories and colors.

### src/components/TaskModal/state.ts
Jotai atoms for managing task modal state including form values and UI state.

### src/components/TaskModal/taskModalState.ts
Jotai provider and hooks for task modal state management.

### src/components/TaskModal/taskModalUserChoices.ts
Functions for persisting and retrieving user preferences for task creation (last used category/duration).

### src/components/TaskModal/utils.ts
Utility functions for task modal logic including duration parsing and formatting.

### src/components/TaskModal/types.ts
Type definitions for task modal data structures.

### src/components/TaskModal/constants.ts
Constants specific to task modal functionality.

### src/components/TaskModal/useCategories.ts
Hook to fetch and manage task categories from the API.

### src/components/TaskModal/useDurationPresets.ts
Hook to fetch and manage duration preset options.

### src/components/TaskModal/TaskAIPlanner.tsx
Component for AI-powered task planning functionality.

### src/components/TaskModal/TaskActionMenu.tsx
Dropdown menu for task actions (duplicate, delete) in the task modal.

### src/components/TaskModal/taskModalDurations.ts
Helper functions for handling task duration calculations and conversions.

### src/components/TaskModal/taskModalUserChoices.ts
Functions for persisting and retrieving user preferences for task creation (last used category/duration).

### src/components/TaskModal/useAutoAssignColors.ts
Hook for automatically assigning colors to categories.

### src/components/AppSidebar.tsx
Sidebar navigation component with collapsible/expanding behavior and navigation items.

### src/components/sidebarNavItems.ts
Defines the navigation items for the sidebar with icons and routes.

### src/components/LayoutHeader.tsx
Application header component that contains the logo and user menu.

### src/components/ThemeWatcher.tsx
Component that watches for system theme changes and syncs with the application theme.

### src/components/PageLoader.tsx
Loading indicator component shown during data fetching.

### src/components/PageTransition.tsx
Component that provides page transition animations between route changes.

### src/components/ConfirmDialog.tsx
Reusable confirmation dialog component for destructive actions.

### src/components/TaskColorPicker.tsx
Color picker component for selecting task colors.

### src/components/DateTimePicker/
Date and time selection components:

### src/components/DateTimePicker/DateTimePicker.tsx
Combined date and time picker component.

### src/components/DateTimePicker/TimePicker.tsx
Time picker component with hour/minute selection.

### src/components/DateTimePicker/utils.ts
Utility functions for date/time parsing and formatting.

### src/components/DateTimePicker/README.md
Documentation for the DateTimePicker component explaining usage, modes, and features.

### src/components/DateTimePicker/index.ts
Index file for DateTimePicker components.

### src/components/UserMenu.tsx
Dropdown menu component for user profile and logout functionality.

### src/components/dev/
Development tools and debugging utilities:

### src/components/dev/NoctareDevTools/index.tsx
Main entry point for the developer tools panel with tabs for different debug views.

### src/components/dev/NoctareDevTools/TasksPanel.tsx
Developer panel for managing and debugging tasks.

### src/components/dev/NoctareDevTools/panels/StoresPanel.tsx
Panel for inspecting Jotai store atoms and values.

### src/components/dev/NoctareDevTools/panels/DevMessagesPanel.tsx
Panel for viewing developer messages and logs.

### src/components/dev/NoctareDevTools/panels/NetworkCallsPanel.tsx
Panel for monitoring network requests and API calls.

### src/components/dev/StoresInspector.tsx
Component for inspecting Jotai stores.

### src/components/SectionCard.tsx
Renders a section with optional error message and styling.

### src/components/SettingsModal.tsx
Modal component for application settings.

### src/components/SidebarModeSelector.tsx
Component for controlling sidebar display mode (collapsed, expand on hover, expanded).

### src/components/Tabs.tsx
Reusable tab primitives styled to match the app UI.

### src/components/TimeInput.tsx
Input component for entering time durations with parsing and preset options.

### src/components/TimeSelector.tsx
Select component for choosing time durations from predefined options.

### src/components/ModalShell.tsx
Responsive modal component that uses either Dialog or Drawer based on screen size.

### src/components/Combobox.tsx
Combobox component for selecting from a list of options.

### src/components/warning-panel/
Components for the warning panel that displays scheduling issues:

### src/components/warning-panel/WarningPanel.tsx
Main warning panel component that displays scheduling issues and allows bulk actions.

### src/components/warning-panel/WarningTaskRow.tsx
Individual task row component for the warning panel.

### src/layouts/SidebarLayout.tsx
Main application layout with sidebar, header, and main content area.

### src/pages/Calendar/
Calendar page module and related UI:

### src/pages/Calendar/CalendarPage.tsx
Main calendar page implementing FullCalendar with event management and scheduling UI.

### src/pages/Calendar/CalendarHeader.tsx
Header component for the calendar view with navigation and action controls.

### src/pages/Calendar/CalendarEventMotion.tsx
Animation component for calendar events with visual effects.

### src/pages/Calendar/CalendarHeaderActions.tsx
Action buttons in the calendar header (today, new task, settings, etc.).

### src/pages/Calendar/CalendarHeaderCustomViewDialog.tsx
Dialog for customizing calendar view display options.

### src/pages/Calendar/CalendarHeaderResetDialog.tsx
Dialog to confirm resetting custom calendar settings.

### src/pages/Calendar/CalendarNavigation.tsx
Navigation controls for moving between calendar dates.

### src/pages/Calendar/CalendarViewControls.tsx
Controls for switching between different calendar views.

### src/pages/Calendar/CalendarViewControlsBase.tsx
Shared view selector + navigation controls used by CalendarNavigation and CalendarViewControls.

### src/pages/Calendar/TimerDisplay.tsx
Display component for task timer functionality.

### src/pages/Calendar/useTimerLogic.ts
Hook containing the logic for task timer functionality.

### src/pages/Calendar/buildRecurrenceInput.ts
Builds FullCalendar recurrence input from event recurrence metadata.

### src/pages/Calendar/index.ts
Barrel export for the Calendar page module.

### src/pages/Categories/
Category management page module:

### src/pages/Categories/CategoriesPage.tsx
Page for managing task categories.

### src/pages/Categories/CategoriesList.tsx
List component for displaying and managing categories.

### src/pages/Categories/AutoAssignColorsModal.tsx
Modal for automatically assigning colors to categories.

### src/pages/Categories/index.ts
Barrel export for the Categories page module.

### src/pages/Settings/
Settings page module:

### src/pages/Settings/SettingsPage.tsx
Main settings page component with sections for user preferences, work hours, and default task settings.

### src/pages/Settings/SettingsSkeleton.tsx
Loading skeleton for the settings page.

### src/pages/Settings/WorkHoursSection.tsx
Component for configuring user's work hours and timezone preferences.

### src/pages/Settings/constants.ts
Constants and options for the settings page.

### src/pages/Settings/index.ts
Barrel export for the Settings page module.

### src/hooks/
Custom React hooks:

### src/hooks/useEventsQuery.ts
Hook for fetching events with TanStack Query integration and caching.

### src/hooks/useBootstrapQuery.ts
Hook for fetching initial application data (events, categories, preferences) in a single call.

### src/hooks/useEventMutations.ts
Hook containing mutation functions for creating, updating, and deleting events.

### src/hooks/useSyncEventsToJotai.ts
Hook for synchronizing events between TanStack Query cache and Jotai atoms.

### src/hooks/useSupabaseLogout.ts
Hook for handling Supabase logout functionality.

### src/hooks/useMediaQuery.ts
Hook for responsive design using media queries.

### src/hooks/use-mobile.ts
Hook for detecting mobile device viewport.

### src/store/
Jotai state management:

### src/store/calendar/
Calendar-specific state:

### src/store/calendar/atoms.ts
Jotai atoms for calendar state (events, modal state, timer, view settings).

### src/store/calendar/hooks.ts
Hooks for accessing calendar atoms.

### src/store/calendar/types.ts
Type definitions for calendar state.

### src/store/userPreferences/
User preferences state:

### src/store/userPreferences/atoms.ts
Jotai atoms for user preferences.

### src/store/userPreferences/hooks.ts
Hooks for accessing user preference atoms.

### src/store/userPreferences/types.ts
Type definitions for user preferences state.

### src/store/devTools/
Development tools state:

### src/store/devTools/atoms.ts
Jotai atoms for dev tools state (messages, unread counts, etc.).

### src/store/devTools/hooks.ts
Hooks for accessing dev tools atoms.

### src/store/sidebar/
Sidebar UI state:

### src/store/sidebar/atoms.ts
Jotai atoms for sidebar state (expanded/collapsed).

### src/store/sidebar/hooks.ts
Hooks for accessing sidebar atoms.

### src/store/sidebar/types.ts
Type definitions for sidebar state.

### src/store/utils/
Utility functions for stores:

### src/store/utils/safeLocalStorage.ts
Safe wrapper for localStorage that handles server-side rendering.

### src/store/networkMonitor/
Network monitoring state:

### src/store/networkMonitor/atoms.ts
Jotai atoms for network monitoring state.

### src/store/networkMonitor/hooks.ts
Hooks for accessing network monitoring atoms.

### src/store/settingsModal/
Settings modal state:

### src/store/settingsModal/atoms.ts
Jotai atoms for settings modal state.

### src/store/settingsModal/hooks.ts
Hooks for accessing settings modal atoms.

### src/constants/
Application constants:

### src/constants/durationOptions.ts
Provides duration options for use in settings and task modals.

### src/types/
TypeScript type definitions:

### src/types/database.ts
Main database type definition generated from Supabase schema.

### src/types/database/
Database-specific types based on Supabase schema:

### src/types/database/eventsTypes.ts
Type definitions for event-related database tables.

### src/types/database/userPreferencesTypes.ts
Type definitions for user preferences database tables.

### src/types/database/categoriesTypes.ts
Type definitions for categories database tables.

### src/types/database/schedulingWindowsTypes.ts
Type definitions for scheduling windows database tables.

### src/types/database/taskDependenciesTypes.ts
Type definitions for task dependency database tables.

### src/types/database/defaultValuesTypes.ts
Type definitions for default values database tables.

### src/types/database/userDurationPresetsTypes.ts
Type definitions for user duration presets database tables.

### src/types/json.ts
JSON type definitions for compatibility with Supabase JSON columns.

### src/types/fullcalendar-rrule-cjs.d.ts
Type declaration for the CommonJS entrypoint of the FullCalendar rrule plugin used in calendar views and tests.

### src/tests/setup.ts
Test setup file for the application.

### src/index.css
Main CSS file for the application styling.

### src/reportWebVitals.ts
Utility for reporting web vitals for performance monitoring.

### src/integrations/tanstack-query/
Integration with TanStack Query:

### src/integrations/tanstack-query/root-provider.tsx
Root provider component for TanStack Query with error handling and caching.

### src/integrations/tanstack-query/devtools.tsx
Development tools for TanStack Query.

### supabase/functions/
Edge Functions for backend operations:

### supabase/functions/auto-scheduler/index.ts
Main entry point for the auto-scheduler Edge Function.

### supabase/functions/auto-scheduler/requestHandler.ts
Request handler for the auto-scheduler, processes scheduling requests.

### supabase/functions/auto-scheduler/schedulingCore.ts
Core scheduling logic for the backend auto-scheduler.

### supabase/functions/auto-scheduler/dbOperations.ts
Database operations for the auto-scheduler Edge Function.

### supabase/functions/auto-scheduler/dispatchQueue.ts
Dispatch queue implementation for the auto-scheduler Edge Function.

### supabase/functions/auto-scheduler/occupiedBlocks.ts
Builds occupied time blocks (including recurrence expansion and buffers) from event rows for the auto-scheduler.

### supabase/functions/auto-scheduler/types.ts
Type definitions for the auto-scheduler Edge Function.

### supabase/functions/auto-scheduler/utils.ts
Utility functions for the auto-scheduler Edge Function.

### supabase/functions/auto-scheduler/bufferMath.ts
Buffer calculation logic for the auto-scheduler Edge Function.

### supabase/functions/auto-scheduler/bufferRules.ts
Buffer rule definitions for the auto-scheduler Edge Function.

### supabase/functions/auto-scheduler/extendedUtils.ts
Extended utility functions for the auto-scheduler Edge Function.

### supabase/functions/auto-scheduler/occupiedState.ts
Occupied state management for the auto-scheduler Edge Function.

### supabase/functions/auto-scheduler/schedulingLogic.ts
Scheduling logic implementation for the auto-scheduler Edge Function.

### supabase/functions/auto-scheduler/splittable.ts
Splittable task logic for the auto-scheduler Edge Function.

### supabase/functions/auto-scheduler/startConstraint.ts
Start constraint logic for the auto-scheduler Edge Function.

### supabase/functions/bootstrap/index.ts
Edge Function that returns initial application data bundle (tasks, categories, preferences).

### supabase/functions/categories/index.ts
Edge Function for managing categories.

### supabase/functions/category/index.ts
Edge Function for managing a single category.

### supabase/functions/duration-preset/index.ts
Edge Function for managing a single duration preset.

### supabase/functions/duration-presets/index.ts
Edge Function for managing duration presets.

### supabase/functions/task/index.ts
Edge Function for creating, updating, and deleting individual tasks with server-side scheduling.

### supabase/functions/tasks/index.ts
Edge Function for fetching user tasks with optional scheduling refresh.

### supabase/functions/user-preferences/index.ts
Edge Function for managing user preferences.

### supabase/functions/dependency/index.ts
Edge Function for managing task dependencies and dependency stacks.

### supabase/functions/dependency-stack/index.ts
Edge Function for managing dependency stacks.

### supabase/functions/dependency-stack-reorder/index.ts
Edge Function for reordering dependency stacks.

### supabase/functions/create-task/index.ts
Edge Function for creating new tasks.

### supabase/functions/_shared/
Shared utilities for Edge Functions:

### supabase/functions/_shared/tasks.ts
Shared task utilities for Edge Functions.

### supabase/functions/_shared/timeUtils.ts
Shared time utilities for Edge Functions.
