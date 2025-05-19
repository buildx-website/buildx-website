import { chatBodyTypes } from "@/types/types";

const baseReactPrompt = `Here is the code for the Kanban board:
<boltArtifact id="kanban-board" title="Beautiful Kanban Board">
<bolt_file_modifications>
<diff path="src/App.tsx">
--- src/App.tsx
+++ src/App.tsx
@@ -1,11 +1,7 @@
-import { BrowserRouter, Routes, Route } from "react-router-dom";
-import Home from "./pages/Home";
+import KanbanBoard from "./components/kanban/KanbanBoard";
 
 export default function App() {
-return (
-<>
-<BrowserRouter>
-<Routes>
-<Route path="/" element={< Home />} />
-</Routes>
-</BrowserRouter>
-</>
-);
-}
+  // We ignore React Router DOM and render the main component directly on the root path
+  return <KanbanBoard />;
+}
</diff>
</bolt_file_modifications>
<boltAction type="file" filePath="src/components/kanban/KanbanCard.tsx">
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { User } from 'lucide-react'; // Assuming User icon is sufficient for assigned user

interface KanbanCardProps {
  id: string;
  title: string;
  description?: string;
  assignedUser?: string;
  columnId: string;
  onDragStart: (event: React.DragEvent, cardId: string, columnId: string) => void;
}

export default function KanbanCard({
  id,
  title,
  description,
  assignedUser,
  columnId,
  onDragStart,
}: KanbanCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={(e) => onDragStart(e, id, columnId)}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card
        className={cn(
          'mb-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow',
          'border-l-4',
          columnId === 'todo' && 'border-blue-500',
          columnId === 'inprogress' && 'border-yellow-500',
          columnId === 'done' && 'border-green-500'
        )}
      >
        <CardContent className="p-4">
          <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h4>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
          {assignedUser && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
              <User className="w-3 h-3 mr-1" />
              <span>{assignedUser}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
</boltAction>
<boltAction type="file" filePath="src/components/kanban/KanbanColumn.tsx">
import { useState } from 'react';
import KanbanCard from './KanbanCard';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface CardData {
  id: string;
  title: string;
  description?: string;
  assignedUser?: string;
  columnId: string; // Redundant but helpful for state management context
}

interface KanbanColumnProps {
  title: string;
  id: string;
  cards: CardData[];
  onDrop: (event: React.DragEvent, columnId: string) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragStart: (event: React.DragEvent, cardId: string, columnId: string) => void;
  onAddCard: (columnId: string, card: Omit<CardData, 'id' | 'columnId'>) => void;
}

export default function KanbanColumn({
  title,
  id,
  cards,
  onDrop,
  onDragOver,
  onDragStart,
  onAddCard,
}: KanbanColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [newCardAssignedUser, setNewCardAssignedUser] = useState('');

  const handleAddCardClick = () => {
    setIsAddingCard(true);
  };

  const handleSaveNewCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(id, {
        title: newCardTitle,
        description: newCardDescription || undefined,
        assignedUser: newCardAssignedUser || undefined,
      });
      setNewCardTitle('');
      setNewCardDescription('');
      setNewCardAssignedUser('');
      setIsAddingCard(false);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col flex-shrink-0 w-72 rounded-lg p-4 overflow-y-auto',
        'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800',
        'shadow-inner'
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, id)}
    >
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{title} ({cards.length})</h3>
      <div className="flex-grow">
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            {...card}
            onDragStart={onDragStart}
          />
        ))}
      </div>
      <Button
        variant="ghost"
        className="w-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 mt-4"
        onClick={handleAddCardClick}
      >
        <PlusCircle className="w-4 h-4 mr-2" /> Add Card
      </Button>

      <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>Add New Card to "{title}"</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newCardDescription}
                onChange={(e) => setNewCardDescription(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignedUser" className="text-right">
                Assigned To
              </Label>
              <Input
                id="assignedUser"
                value={newCardAssignedUser}
                onChange={(e) => setNewCardAssignedUser(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSaveNewCard}>Save Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
</boltAction>
<boltAction type="file" filePath="src/components/kanban/KanbanBoard.tsx">
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KanbanColumn from './KanbanColumn';
import { GitPullRequest } from 'lucide-react'; // Using GitPullRequest as a placeholder logo icon

interface CardData {
  id: string;
  title: string;
  description?: string;
  assignedUser?: string;
  columnId: string;
}

interface ColumnData {
  id: string;
  title: string;
  cards: CardData[];
}

// Simulate authentication state
function useAuthSimulation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Simulate checking auth status
    const loggedIn = localStorage.getItem('kanban_auth') === 'true';
    setIsAuthenticated(loggedIn);
  }, []);

  const login = () => {
    localStorage.setItem('kanban_auth', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('kanban_auth');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}


export default function KanbanBoard() {
  const { isAuthenticated, login, logout } = useAuthSimulation();

  // Initial state for columns and cards
  const [columns, setColumns] = useState<ColumnData[]>([
    {
      id: 'todo',
      title: 'To Do',
      cards: [
        { id: 'card-1', title: 'Setup Project', description: 'Initialize the repository and basic structure.', assignedUser: 'Alice', columnId: 'todo' },
        { id: 'card-2', title: 'Design Database Schema', description: 'Plan the tables and relationships.', assignedUser: 'Bob', columnId: 'todo' },
      ],
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      cards: [
        { id: 'card-3', title: 'Implement User Auth', description: 'Develop login and registration flows.', assignedUser: 'Alice', columnId: 'inprogress' },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      cards: [
        { id: 'card-4', title: 'Plan Features', description: 'Define core functionality.', assignedUser: 'Charlie', columnId: 'done' },
      ],
    },
  ]);

  // State to track the card being dragged
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; columnId: string } | null>(null);

  const handleDragStart = (event: React.DragEvent, cardId: string, columnId: string) => {
    setDraggedCard({ cardId, columnId });
    // Set data for the drag operation (optional, but good practice)
    event.dataTransfer.setData('text/plain', JSON.stringify({ cardId, columnId }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault(); // Necessary to allow dropping
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: React.DragEvent, targetColumnId: string) => {
    event.preventDefault();

    if (!draggedCard) return;

    const { cardId, columnId: sourceColumnId } = draggedCard;

    if (sourceColumnId === targetColumnId) {
      // Card dropped in the same column (reordering not fully supported with this D&D method)
      setDraggedCard(null);
      return;
    }

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map(column => ({ ...column, cards: [...column.cards] })); // Deep clone cards

      const sourceColumn = newColumns.find(col => col.id === sourceColumnId);
      const targetColumn = newColumns.find(col => col.id === targetColumnId);

      if (!sourceColumn || !targetColumn) {
        console.error("Source or target column not found");
        return prevColumns; // Return original state if columns not found
      }

      // Find the card in the source column
      const cardIndex = sourceColumn.cards.findIndex(card => card.id === cardId);
      if (cardIndex === -1) {
         console.error("Dragged card not found in source column");
         return prevColumns; // Return original state if card not found
      }

      // Remove the card from the source column
      const [cardToMove] = sourceColumn.cards.splice(cardIndex, 1);

      // Update the columnId of the card
      cardToMove.columnId = targetColumnId;

      // Add the card to the target column (at the end for simplicity without complex reordering logic)
      targetColumn.cards.push(cardToMove);

      return newColumns;
    });

    setDraggedCard(null); // Reset dragged card state
  };

  const handleAddCard = (columnId: string, card: Omit<CardData, 'id' | 'columnId'>) => {
    setColumns(prevColumns => {
      const newColumns = prevColumns.map(column => ({ ...column, cards: [...column.cards] }));
      const targetColumn = newColumns.find(col => col.id === columnId);

      if (targetColumn) {
        const newCard: CardData = {
          id: "card-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9), // Simple unique ID
          ...card,
          columnId: columnId,
        };
        targetColumn.cards.push(newCard);
      }
      return newColumns;
    });
  };

  // --- Authentication Simulation UI ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-sm w-full"
        >
          <GitPullRequest className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Welcome to Kanban</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This is a simulated authentication page. Click the button to access the board.
          </p>
          <button
            onClick={login}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            Enter Board (Simulated Login)
          </button>
        </motion.div>
      </div>
    );
  }
  // --- End Authentication Simulation UI ---

  // --- Main Kanban Board UI ---
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm">
        <div className="flex items-center">
           <GitPullRequest className="w-8 h-8 mr-2 text-blue-600 dark:text-blue-400" />
           <h1 className="text-xl font-bold">My Kanban Board</h1>
        </div>
        <button
          onClick={logout}
          className="px-4 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
        >
          Logout (Simulated)
        </button>
      </header>

      {/* Board Area */}
      <main className="flex-grow flex overflow-x-auto p-6 space-x-6">
        <AnimatePresence mode="wait">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              cards={column.cards}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onAddCard={handleAddCard}
            />
          ))}
        </AnimatePresence>
        {/* Add Column button/feature could go here if needed */}
      </main>
    </div>
  );
  // --- End Main Kanban Board UI ---
}
</boltAction>
</boltArtifact>

This setup replaces the minimal homepage with the Kanban board directly on the root path. It includes:

`;

  function getToken(input: string) {
    let index = 0;

    return function () {
        if (index >= input.length) return null;

        const chunkSize = Math.floor(Math.random() * 5) + 1;
        const token = input.slice(index, index + chunkSize);
        index += chunkSize;

        return token;
    };
}

export async function POST(req: Request) {
    const body = await req.json();
    console.log("body", body);

    try {
        const parsedData = chatBodyTypes.safeParse(body);
        if (!parsedData.success) {
            return new Response(JSON.stringify({ zodErr: parsedData.error }), { status: 400 });
        }

        const stream = new ReadableStream({
            async start(controller) {
                const nextToken = getToken(baseReactPrompt);

                let token;
                while ((token = nextToken()) !== null) {
                    controller.enqueue(new TextEncoder().encode(token));
                    await new Promise((res) => setTimeout(res, 10));
                }

                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });

    } catch (error) {
        console.error("Error parsing data", error);
        return new Response("Error parsing data", { status: 500 });
    }
}
