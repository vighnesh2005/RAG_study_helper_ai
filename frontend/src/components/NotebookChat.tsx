import { 
  ArrowLeft, 
  Upload, 
  Send, 
  FileText, 
  CheckSquare, 
  Square,
  MessageSquare2,
  MessageSquare,
  Trash2,
  MessageSquarePlus,
  Info
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Header } from "./Header";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import axios from "axios";
import { Label } from "./ui/label";
import { useState, useEffect, useRef } from "react";
import parse from "html-react-parser";

interface FileItem {
  file_id: number;
  notebook_id: number;
  included: boolean;
  file_name: string;
}

interface Chat {
  chat_id: number;
  notebook_id: number;
  chat_name: string;
  created_at: string;
}

interface Notebook {
  notebook_id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  message_id: number;
  chat_id: number;
  user_id: number;
  notebook_id: number;
  message: string;
  is_user: boolean;
  timestamp: string;
}

interface NotebookChatProps {
  notebookId: string;
  onBack: () => void;
}

export function NotebookChat({ notebookId, onBack }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatHistory, setHistory] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const currentChat = chats.find(chat => chat.chat_id === currentChatId);

  useEffect(() => {
    fetchFiles();
    fetchChats();
  }, [notebookId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    if (currentChatId) {
      setIsChatLoading(true);
      fetchHistory();
    }
    console.log(currentChatId);
  }, [currentChatId]);

  useEffect(() => {
    fetchNotebooks();
  }, [notebookId]);

  const fetchFiles = async () => {
    try {
      const id = Number(notebookId);
      const formData = new FormData();
      formData.append("notebook_id", id);
      const resp = await axios.post("http://localhost:8000/user/get_all_files", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        }
      });
      const filesData: FileItem[] = resp.data.files.map((file: any) => ({
        file_id: file.file_id,
        notebook_id: Number(notebookId),
        included: false,
        file_name: file.file_name,
      }));
      setFiles(filesData);
      console.log(filesData);
    } catch (err: any) {
      if (err.response) {
        console.log("Status code:", err.response.status);
        console.log("Response data:", err.response.data);
        if (err.response.status === 401) {
          console.log("Token expired. Logging out...");
          localStorage.removeItem("access_token");
        }
      } else {
        console.error("Request failed:", err.message);
      }
    }
  }

  const fetchChats = async () => {
    try {
      const id = Number(notebookId);
      const resp = await axios.get(`http://localhost:8000/user/chats/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        }
      });
      const chats = resp.data.chats.map((chat: any) => ({
        chat_id: chat.chat_id,
        notebook_id: notebookId,
        chat_name: chat.chat_name,
        created_at: chat.created_at,
      }));
      setChats(chats);
      console.log(chats);
    } catch (err: any) {
      if (err.response) {
        console.log("Status code:", err.response.status);
        console.log("Response data:", err.response.data);
        if (err.response.status === 401) {
          console.log("Token expired. Logging out...");
          localStorage.removeItem("access_token");
        }
      } else {
        console.error("Request failed:", err.message);
      }
    }
  }

  const fetchNotebooks = async () => {
    try {
      const id = Number(notebookId);
      const res = await axios.get(`http://localhost:8000/user/notebook/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        }
      });
      setNotebook(res.data.notebook);
      console.log(res.data.notebook);
    } catch (err: any) {
      if (err.response) {
        console.log("Status code:", err.response.status);
        console.log("Response data:", err.response.data);
        if (err.response.status === 401) {
          console.log("Token expired. Logging out...");
          localStorage.removeItem("access_token");
        }
      } else {
        console.error("Request failed:", err.message);
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const resp = await axios.get(`http://localhost:8000/user/chat_history/${currentChatId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        }
      });
      setHistory(resp.data.messages);
      console.log(resp.data.messages);
      setIsChatLoading(false);
    } catch (err: any) {
      if (err.response) {
        console.log("Status code:", err.response.status);
        console.log("Response data:", err.response.data);
        if (err.response.status === 401) {
          console.log("Token expired. Logging out...");
          localStorage.removeItem("access_token");
        }
      } else {
        console.error("Request failed:", err.message);
      }
      setIsChatLoading(false);
    }
  }

  const toggleFileInclusion = (fileId) => {
    setFiles(files.map(file =>
      file.file_id === fileId ? { ...file, included: !file.included } : file
    ));
  };

  const createNewChat = async () => {
    if (!newTitle.trim()) return;
    try {
      const formData = new FormData();
      formData.append("notebook_id", notebookId);
      formData.append("chat_name", newTitle);
      const resp = await axios.post("http://localhost:8000/user/create_chat", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        }
      });
      setNewTitle("");
      setShowModal(false);
      fetchChats();
    } catch (err: any) {
      if (err.response) {
        console.log("Status code:", err.response.status);
        console.log("Response data:", err.response.data);
        if (err.response.status === 401) {
          console.log("Token expired. Logging out...");
          localStorage.removeItem("access_token");
        }
      } else {
        console.error("Request failed:", err.message);
      }
    }
  };

  const handleUploadFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    try {
      const id = Number(notebookId);
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("notebook_id", id);

      const resp = await axios.post("http://localhost:8000/user/upload_files", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Files uploaded:", resp.data);
      fetchFiles();
    } catch (err: any) {
      if (err.response) {
        console.log("Status code:", err.response.status);
        console.log("Response data:", err.response.data);
        if (err.response.status === 401) {
          console.log("Token expired. Logging out...");
          localStorage.removeItem("access_token");
        }
      } else {
        console.error("Request failed:", err.message);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;
    try {
      const id = Number(notebookId);
      const includedFileIds = files
        .filter(file => file.included)
        .map(file => Number(file.file_id));

      const formData = new FormData();
      formData.append("notebook_id", id);
      formData.append("chat_id", Number(currentChatId));
      formData.append("message", inputMessage);
      includedFileIds.forEach(id => formData.append("files", id));

      setIsSending(true);
      const resp = await axios.post("http://localhost:8000/api/query", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        }
      });
      fetchHistory();
      setInputMessage("");
      setIsSending(false);
    } catch (err: any) {
      if (err.response) {
        console.log("Status code:", err.response.status);
        console.log("Response data:", err.response.data);
        if (err.response.status === 401) {
          console.log("Token expired. Logging out...");
          localStorage.removeItem("access_token");
        }
      } else {
        console.error("Request failed:", err.message);
      }
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <style>{`
        .loader { width: 15px; aspect-ratio: 1; border-radius: 50%; animation: l5 1s infinite linear alternate; }
        @keyframes l5 { 
          0%  { box-shadow: 20px 0 #000, -20px 0 #0002; background: #000 }
          33% { box-shadow: 20px 0 #000, -20px 0 #0002; background: #0002 }
          66% { box-shadow: 20px 0 #0002, -20px 0 #000; background: #0002 }
          100%{ box-shadow: 20px 0 #0002, -20px 0 #000; background: #000 }
        }
        .dark .loader { 
          /* improve contrast in dark mode */
          animation: l5-dark 1s infinite linear alternate; 
        }
        @keyframes l5-dark {
          0%  { box-shadow: 20px 0 #fff, -20px 0 #ffffff22; background: #fff }
          33% { box-shadow: 20px 0 #fff, -20px 0 #ffffff22; background: #ffffff22 }
          66% { box-shadow: 20px 0 #ffffff22, -20px 0 #fff; background: #ffffff22 }
          100%{ box-shadow: 20px 0 #ffffff22, -20px 0 #fff; background: #fff }
        }
      `}</style>
      <Header />

      <div className="h-[calc(100vh-4rem)] flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col min-h-0 overflow-y-auto">
          {/* Notebook Header */}
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-4 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h2 className="text-gray-900 dark:text-white mb-1">
              {notebook?.title || "Notebook"}
            </h2>
          </div>

          {/* Chats Section */}
          <div className="border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
            <div className="p-6 pb-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900 dark:text-white">Chats</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(true)}
                  className="h-8 gap-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  New
                </Button>
              </div>
            </div>

            <ScrollArea className="max-h-64 px-6 pb-4">
              <div className="space-y-1">
                {chats.map((chat) => (
                  <div
                    key={chat.chat_id}
                    onClick={() => setCurrentChatId(chat.chat_id)}
                    className={`group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                      currentChatId === chat.chat_id
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        : "hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <MessageSquare
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        currentChatId === chat.chat_id
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${
                          currentChatId === chat.chat_id
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {chat.chat_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {chat.created_at}
                      </p>
                    </div>
                    {chats.length > 1 && (
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Files Section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-6 pb-4 flex-shrink-0">
              <h3 className="text-gray-900 dark:text-white">Uploaded Files</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select files to include in all chats
              </p>
            </div>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-2 pb-4">
                {files.map((file) => (
                  <button
                    key={file.file_id}
                    onClick={() => toggleFileInclusion(file.file_id)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200 text-left group"
                  >
                    <div className="mt-0.5">
                      {file.included ? (
                        <CheckSquare className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span
                          className={`text-sm truncate ${
                            file.included
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {file.file_name}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* Upload Button */}
            <div className="p-6 pt-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
              <Button
                variant="outline"
                className="w-full rounded-xl border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800"
                onClick={() => document.getElementById("fileUpload")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload new file
              </Button>
              <input
                type="file"
                id="fileUpload"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files) {
                    const filesArray = Array.from(e.target.files);
                    setSelectedFiles(filesArray);
                    handleUploadFiles(filesArray);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Chat Panel (Independent scroll) */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Header */}
          <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 flex-shrink-0">
            <h2 className="text-gray-900 dark:text-white">{currentChat?.chat_name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {files.filter(f => f.included).length} files included
            </p>
          </div>

          {/* Chat Messages (scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-950">
            <div className="max-w-3xl mx-auto space-y-6">
              {isChatLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'}`}>
                      <div className="w-2/3 h-16 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              )}
              {chatHistory.map((message) => (
                <div
                  key={message.message_id}
                  className={`flex ${message.is_user ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 overflow-hidden ${
                      message.is_user
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700"
                    }`}
                  >
                    {message.is_user ? (
                      <p className="text-white">{message.message}</p>
                    ) : (
                      <div className="text-gray-900 dark:text-white">{parse(message.message)}</div>
                    )}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="loader" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Assistant is typing</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>
          </div>

          {/* Input Area (fixed bottom) */}
          <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3">
                <Input
                  placeholder="Ask a question about your study materials..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isSending}
                  className="flex-1 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl h-12"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="h-12 w-12 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl"
                  size="icon"
                >
                  {isSending ? (
                    <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Create New Chat</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Enter a title for your new chat</p>

            <div className="space-y-4">
              <Label htmlFor="new-chat-title">Chat Title</Label>
              <Input
                id="new-chat-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter chat title"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={createNewChat} disabled={!newTitle.trim()}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
