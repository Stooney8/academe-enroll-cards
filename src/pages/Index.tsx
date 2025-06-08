import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  User, 
  Users, 
  ArrowLeft, 
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  Palette,
  BookOpen,
  GraduationCap,
  Briefcase,
  Heart,
  Star,
  Zap,
  Trophy,
  Target,
  Rocket,
  Crown,
  Diamond,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  age: string;
  email: string;
  mobile: string;
  idNumber: string;
  courseName: string;
  courseDate: string;
  accepted: boolean;
  notes: string | null;
  iconType: string;
  icon: {
    name: string;
    component: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
    bgColor: string;
  };
}

const LUCIDE_ICONS = [
  { name: 'User', component: User, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  { name: 'BookOpen', component: BookOpen, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  { name: 'GraduationCap', component: GraduationCap, color: 'text-green-500', bgColor: 'bg-green-100' },
  { name: 'Briefcase', component: Briefcase, color: 'text-red-500', bgColor: 'bg-red-100' },
  { name: 'Heart', component: Heart, color: 'text-pink-500', bgColor: 'bg-pink-100' },
  { name: 'Star', component: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
  { name: 'Zap', component: Zap, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  { name: 'Trophy', component: Trophy, color: 'text-amber-500', bgColor: 'bg-amber-100' },
  { name: 'Target', component: Target, color: 'text-lime-500', bgColor: 'bg-lime-100' },
  { name: 'Rocket', component: Rocket, color: 'text-teal-500', bgColor: 'bg-teal-100' },
  { name: 'Crown', component: Crown, color: 'text-violet-500', bgColor: 'bg-violet-100' },
  { name: 'Diamond', component: Diamond, color: 'text-rose-500', bgColor: 'bg-rose-100' },
];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState<'home' | 'list' | 'detail'>('home');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDate, setCourseDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [iconType, setIconType] = useState(LUCIDE_ICONS[0].name);
  const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching students:", error);
        toast({
          title: "Error",
          description: "Failed to load students. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const studentsWithIcons = data.map(student => {
        const icon = LUCIDE_ICONS.find(icon => icon.name === student.icon_type) || LUCIDE_ICONS[0];
        return {
          id: student.id,
          createdAt: student.created_at,
          updatedAt: student.updated_at,
          name: student.name,
          age: student.age,
          email: student.email,
          mobile: student.mobile,
          idNumber: student.id_number,
          courseName: student.course_name,
          courseDate: student.course_date,
          accepted: student.accepted,
          notes: student.notes,
          iconType: student.icon_type,
          icon: {
            name: icon.name,
            component: icon.component,
            color: icon.color,
            bgColor: icon.bgColor,
          }
        };
      });
      setStudents(studentsWithIcons as Student[]);
    } catch (err) {
      console.error("Unexpected error fetching students:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading students.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !age || !email || !mobile || !idNumber || !courseName || !courseDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const selectedIcon = LUCIDE_ICONS.find(icon => icon.name === iconType) || LUCIDE_ICONS[0];

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            name,
            age,
            email,
            mobile,
            id_number: idNumber,
            course_name: courseName,
            course_date: format(courseDate, 'yyyy-MM-dd'),
            notes,
            icon_type: selectedIcon.name,
          },
        ])
        .select()

      if (error) {
        console.error("Error inserting data:", error);
        toast({
          title: "Error",
          description: "Failed to add student. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Student added successfully!",
      });

      setName('');
      setAge('');
      setEmail('');
      setMobile('');
      setIdNumber('');
      setCourseName('');
      setCourseDate(undefined);
      setNotes('');
      setIconType(LUCIDE_ICONS[0].name);

      loadStudents();
      setCurrentPage('list');
    } catch (err) {
      console.error("Unexpected error inserting data:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the student.",
        variant: "destructive",
      });
    }
  };

  const toggleAcceptance = async (studentId: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) {
        toast({
          title: "Error",
          description: "Student not found.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('students')
        .update({ accepted: !student.accepted })
        .eq('id', studentId);

      if (error) {
        console.error("Error updating acceptance:", error);
        toast({
          title: "Error",
          description: "Failed to update acceptance status. Please try again.",
          variant: "destructive",
        });
        return;
      }

      loadStudents();
      toast({
        title: "Success",
        description: `Student ${student.accepted ? 'rejected' : 'accepted'} successfully!`,
      });
    } catch (err) {
      console.error("Unexpected error updating acceptance:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating acceptance status.",
        variant: "destructive",
      });
    }
  };

  const toggleNotesExpansion = (studentId: string) => {
    const newExpandedNotes = new Set(expandedNotes);
    if (expandedNotes.has(studentId)) {
      newExpandedNotes.delete(studentId);
    } else {
      newExpandedNotes.add(studentId);
    }
    setExpandedNotes(newExpandedNotes);
  };

  const renderStudentList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Students ({students.length})</h1>
        </div>
        <Button onClick={() => setCurrentPage('home')} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {students.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No students registered yet</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first student to the system.</p>
          <Button onClick={() => setCurrentPage('home')}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Student
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => {
            const IconComponent = student.icon.component;
            const isNotesExpanded = expandedNotes.has(student.id);
            
            return (
              <Card key={student.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${student.icon.bgColor}`}>
                        <IconComponent className={`w-5 h-5 ${student.icon.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">ID: {student.idNumber}</p>
                      </div>
                    </div>
                    <Badge variant={student.accepted ? "default" : "secondary"}>
                      {student.accepted ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {student.accepted ? 'Accepted' : 'Pending'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Course:</span>
                      <p className="text-muted-foreground">{student.courseName}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>
                      <p className="text-muted-foreground">{student.courseDate}</p>
                    </div>
                    <div>
                      <span className="font-medium">Age:</span>
                      <p className="text-muted-foreground">{student.age}</p>
                    </div>
                    <div>
                      <span className="font-medium">Mobile:</span>
                      <p className="text-muted-foreground">{student.mobile}</p>
                    </div>
                  </div>
                  
                  {student.notes && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Notes:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleNotesExpansion(student.id)}
                          className="h-6 w-6 p-0"
                        >
                          {isNotesExpanded ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      {isNotesExpanded && (
                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                          {student.notes}
                        </p>
                      )}
                      {!isNotesExpanded && (
                        <p className="text-xs text-muted-foreground italic">
                          Click to view notes
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(student);
                        setCurrentPage('detail');
                      }}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      variant={student.accepted ? "secondary" : "default"}
                      size="sm"
                      onClick={() => toggleAcceptance(student.id)}
                      className="flex-1"
                    >
                      {student.accepted ? 'Reject' : 'Accept'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStudentDetail = () => {
    if (!selectedStudent) {
      return <div>No student selected.</div>;
    }

    const IconComponent = selectedStudent.icon.component;

    return (
      <div className="space-y-6">
        <Button onClick={() => setCurrentPage('list')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedStudent.icon.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${selectedStudent.icon.color}`} />
                </div>
                <div>
                  <CardTitle className="text-2xl">{selectedStudent.name}</CardTitle>
                  <p className="text-muted-foreground">ID: {selectedStudent.idNumber}</p>
                </div>
              </div>
              <Badge variant={selectedStudent.accepted ? "default" : "secondary"}>
                {selectedStudent.accepted ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {selectedStudent.accepted ? 'Accepted' : 'Pending'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Age:</span>
                <p className="text-muted-foreground">{selectedStudent.age}</p>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <p className="text-muted-foreground">{selectedStudent.email}</p>
              </div>
              <div>
                <span className="font-medium">Mobile:</span>
                <p className="text-muted-foreground">{selectedStudent.mobile}</p>
              </div>
              <div>
                <span className="font-medium">Course:</span>
                <p className="text-muted-foreground">{selectedStudent.courseName}</p>
              </div>
              <div>
                <span className="font-medium">Date:</span>
                <p className="text-muted-foreground">{selectedStudent.courseDate}</p>
              </div>
            </div>
            <div>
              <span className="font-medium">Notes:</span>
              <p className="text-muted-foreground">{selectedStudent.notes || 'No notes available.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderThemeSelector = () => (
    <Popover open={themeSelectorOpen} onOpenChange={setThemeSelectorOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="switch" aria-checked={themeSelectorOpen}>
          <Palette className="mr-2 h-4 w-4" />
          Theme
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 space-y-2">
        {LUCIDE_ICONS.map((icon) => (
          <div key={icon.name} className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="justify-start w-full"
              onClick={() => {
                setIconType(icon.name);
                setThemeSelectorOpen(false);
              }}
            >
              <icon.component className="mr-2 h-4 w-4" />
              {icon.name}
            </Button>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="container mx-auto py-10">
      {currentPage === 'home' && (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Add Student</h1>
            </div>
            <Button onClick={() => navigate('/notes')} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Private Notes
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input type="tel" id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input type="text" id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input type="text" id="courseName" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="courseDate">Course Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !courseDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {courseDate ? format(courseDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={courseDate}
                        onSelect={setCourseDate}
                        disabled={(date) =>
                          date > new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." />
                </div>
                <div className="flex items-center justify-between">
                  {renderThemeSelector()}
                  <Button type="submit">Add Student</Button>
                </div>
                <Button onClick={() => setCurrentPage('list')} variant="secondary">
                  View Students List
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {currentPage === 'list' && renderStudentList()}
      {currentPage === 'detail' && renderStudentDetail()}
    </div>
  );
};

export default Index;
