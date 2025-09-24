# Components Organization

This directory contains all React components organized by functionality:

## 📁 Folder Structure

### `ui/` - User Interface Components
Core UI components that handle the main application interface:
- `Sidebar.tsx` - Navigation sidebar with category selection
- `Header.tsx` - Application header with search and controls
- `MainContent.tsx` - Main content area (list/graph views)
- `Modal.tsx` - Reusable modal component
- `ModalsContainer.tsx` - Container for all modal dialogs
- `FloatingButtons.tsx` - Floating action buttons
- `TermCard.tsx` - Individual term display card
- `AddTermForm.tsx` - Form for adding/editing terms
- `DependencyGraph.tsx` - Interactive dependency graph visualization
- `LinkifiedText.tsx` - Text component with automatic term linking
- `icons.tsx` - Icon components library

### `quiz/` - Quiz Components
All components related to the quiz functionality:
- `QuizFlow.tsx` - Main quiz orchestrator
- `QuizSetup.tsx` - Quiz configuration/setup screen
- `QuizActive.tsx` - Active quiz session interface
- `QuizResults.tsx` - Quiz results display
- `QuizQuestion.tsx` - Individual question component
- `QuizTimer.tsx` - Quiz timer component
- `QuizProgress.tsx` - Quiz progress indicator
- `QuizNavigation.tsx` - Quiz navigation controls
- `ScoreRing.tsx` - Circular score visualization

### `data/` - Data Management Components
Components for managing glossary data:
- `DataManagement.tsx` - Main data management interface
- `CategoriesTab.tsx` - Category management tab
- `TermsTab.tsx` - Terms management tab
- `ImportExportTab.tsx` - Data import/export functionality

## 🔧 Usage

Import components using the index files:

```typescript
// Import UI components
import { Sidebar, Header, TermCard } from './components/ui';

// Import quiz components
import { QuizFlow, QuizSetup } from './components/quiz';

// Import data components
import { DataManagement } from './components/data';
```

## 📋 Benefits

- **Better Organization**: Components grouped by functionality
- **Easier Maintenance**: Related components are co-located
- **Cleaner Imports**: Index files provide clean import paths
- **Scalability**: Easy to add new components to appropriate folders