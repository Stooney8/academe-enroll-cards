import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('privateNotes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('privateNotes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    setCurrentNote(null);
    setTitle('');
    setContent('');
    setIsEditing(true);
  };

  const saveNote = () => {
    if (!title.trim() && !content.trim()) return;

    const now = new Date();

    if (currentNote) {
      // Update existing note
      const updatedNotes = notes.map(note =>
        note.id === currentNote.id
          ? { ...note, title: title || 'Untitled', content, updatedAt: now }
          : note
      );
      setNotes(updatedNotes);
      setCurrentNote({ ...currentNote, title: title || 'Untitled', content, updatedAt: now });
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: title || 'Untitled',
        content,
        createdAt: now,
        updatedAt: now
      };
      setNotes([newNote, ...notes]);
      setCurrentNote(newNote);
    }

    setIsEditing(false);
  };

  const selectNote = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    if (currentNote?.id === noteId) {
      setCurrentNote(null);
      setTitle('');
      setContent('');
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    } else {
      setTitle('');
      setContent('');
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="bg-gray-800/50 border-gray-600 text-gray-100 hover:bg-gray-700/60"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-100">
            Private Notes
          </h1>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowNotes(!showNotes)}
              variant="outline"
              className="bg-gray-800/50 border-gray-600 text-gray-100 hover:bg-gray-700/60"
            >
              {showNotes ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showNotes ? 'Hide Notes' : 'Show Notes'}
            </Button>
            <Button
              onClick={createNewNote}
              className="bg-gradient-to-r from-gray-700 to-slate-700 hover:from-gray-600 hover:to-slate-600 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Notes List - Conditionally rendered */}
          {showNotes && (
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-gray-800/60 to-slate-800/60 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-gray-100">
                    Your Notes ({notes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {notes.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No notes yet. Create your first note!
                    </p>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                          currentNote?.id === note.id
                            ? 'bg-gray-700/60 border-gray-500'
                            : 'bg-gray-800/40 border-gray-700/30 hover:bg-gray-700/40'
                        }`}
                        onClick={() => selectNote(note)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-100 font-medium truncate">
                              {note.title}
                            </h3>
                            <p className="text-gray-400 text-sm truncate mt-1">
                              {note.content || 'No content'}
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                              {note.updatedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-400 hover:bg-red-600/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Note Editor - Adjust column span based on notes visibility */}
          <div className={showNotes ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card className="bg-gradient-to-br from-gray-800/60 to-slate-800/60 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-100">
                    {isEditing ? (currentNote ? 'Edit Note' : 'New Note') : 'View Note'}
                  </CardTitle>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={saveNote}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          variant="outline"
                          className="bg-gray-800/50 border-gray-600 text-gray-100 hover:bg-gray-700/60"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : currentNote ? (
                      <Button
                        onClick={startEditing}
                        className="bg-gradient-to-r from-gray-700 to-slate-700 hover:from-gray-600 hover:to-slate-600 text-white"
                      >
                        Edit
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing || currentNote ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-gray-100">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter note title..."
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-gray-100">
                        Content
                      </Label>
                      <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your private notes here..."
                        disabled={!isEditing}
                        rows={12}
                        className="w-full rounded-md border border-gray-600 bg-gray-800/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      No Note Selected
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {showNotes ? 'Select a note from the list or create a new one to get started.' : 'Show your notes list or create a new note to get started.'}
                    </p>
                    <Button
                      onClick={createNewNote}
                      className="bg-gradient-to-r from-gray-700 to-slate-700 hover:from-gray-600 hover:to-slate-600 text-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Create New Note
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
