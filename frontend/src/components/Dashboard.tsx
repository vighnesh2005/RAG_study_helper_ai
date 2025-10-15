import { Plus, Calendar, FileText, LogOut, Settings, User } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Header } from "./Header";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "./ui/dialog";
import { useState, useEffect } from "react";
import axios from "axios";
interface Notebook {
  notebook_id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface DashboardProps {
  onNotebookClick: (notebookId: string) => void;
}

export function Dashboard({ onNotebookClick }: DashboardProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  // const notebooks: Notebook[] = [
  //   {
  //     id: "1",
  //     name: "Machine Learning Fundamentals",
  //     createdDate: "Oct 5, 2025",
  //     filesCount: 12,
  //   },
  //   {
  //     id: "2",
  //     name: "Biology 101 - Cell Structure",
  //     createdDate: "Oct 3, 2025",
  //     filesCount: 8,
  //   },
  //   {
  //     id: "3",
  //     name: "World History - Renaissance",
  //     createdDate: "Sep 28, 2025",
  //     filesCount: 15,
  //   },
  //   {
  //     id: "4",
  //     name: "Advanced Calculus Notes",
  //     createdDate: "Sep 25, 2025",
  //     filesCount: 20,
  //   },
  // ];

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const res = await axios.get("http://localhost:8000/user/notebooks",{
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        }
      });
      setNotebooks(res.data.notebooks);
      console.log(res.data.notebooks);
    } catch (err) {
      console.log("Status code:", err.response.status); // 404, 401, etc.
      console.log("Response data:", err.response.data);

      if (err.response.status === 401) {
        // Token expired or unauthorized
        console.log("Token expired. Logging out...");
        localStorage.removeItem("access_token");
        // redirect to login page or show message
      }
      else {
      // Network error or request never reached the server
      console.error("Request failed:", err.message);
      }
    }
  };

  const handleCreateNotebook = async () => {
    
    if (!newTitle.trim()) return;
    try {
      const formData = new FormData();
      formData.append("title", newTitle);
      const res = await axios.post("http://localhost:8000/user/create_note_book",
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        }
      });
      console.log(res.data);
      console.log(newTitle);
      setNewTitle("");
      setShowModal(false);
      fetchNotebooks(); // Refresh list
    } catch (err) {
      console.error("Error creating notebook:", err);
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      [data-state="open"][data-radix-portal] {
        z-index: 9999 !important;
      }
      .radix-overlay {
        z-index: 9998 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Header />

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 dark:text-white mb-1">Your Notebooks</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and chat with your study materials
            </p>
          </div>

          {/* User Actions */}
        </div>

        {/* Notebooks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notebooks.map((notebook) => (
            <button
              key={notebook.notebook_id.toString()}
              onClick={() => navigate(`/chat/${notebook.notebook_id}`)}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg dark:hover:shadow-blue-900/20 transition-all duration-200 text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <h3 className="text-gray-900 dark:text-white mb-3 line-clamp-2">
                {notebook.title}
              </h3>

              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-sm">{new Date(notebook.created_at).toLocaleDateString("en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        <Button
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
            size="icon"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Floating Add Button */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Create New Notebook</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enter a title for your new notebook. You can add and manage multiple notebooks here.
            </p>

            <div className="space-y-4">
              <Label htmlFor="title">Notebook Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter notebook title"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNotebook}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
