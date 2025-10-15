import { Search, Moon, Sun, BookOpen } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Calendar, FileText, LogOut, Settings, User } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 dark:bg-blue-600 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900 dark:text-white">Studify</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search notebooks..."
              className="pl-10 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl h-10"
            />
          </div>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800"
          onClick = {() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("token_type");
            navigate("/login");
          }}
        >
          <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </Button>
      </div>
    </header>
  );
}
