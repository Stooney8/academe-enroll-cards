import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit3, Plus, Users, GraduationCap, UserCheck, Search, Eye, EyeOff, FileText, Info, Phone, Mail, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Student {
  id: string;
  name: string;
  id_number: string;
  email: string;
  mobile: string;
  age: string;
  course_name: string;
  course_date: string;
  accepted: boolean;
  notes: string | null;
  icon_type: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    id_number: "",
    email: "",
    mobile: "",
    age: "",
    course_name: "",
    course_date: "",
    notes: "",
  });

  const { toast } = useToast();
  const { user, userProfile, isAdmin, isTeacher } = useAuth();

  console.log("Current auth state:", { user, userProfile, isAdmin, isTeacher });

  // Format date to show month as text
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Toggle notes visibility for a specific student
  const toggleNotes = (studentId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  // Handle acceptance toggle
  const handleAcceptanceToggle = async (studentId: string, currentStatus: boolean) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can change acceptance status",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("students")
        .update({ accepted: !currentStatus })
        .eq("id", studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Student ${!currentStatus ? "accepted" : "marked as not accepted"}`,
      });

      fetchStudents();
    } catch (error: any) {
      console.error("Error updating acceptance status:", error);
      toast({
        title: "Error",
        description: "Failed to update acceptance status",
        variant: "destructive",
      });
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching students:", error);
        toast({
          title: "Error",
          description: "Failed to fetch students",
          variant: "destructive",
        });
        return;
      }

      setStudents(data || []);
    } catch (error) {
      console.error("Error in fetchStudents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobile.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = courseFilter === "all" || student.course_name === courseFilter;

    return matchesSearch && matchesCourse;
  });

  // Get unique course names for filter
  const uniqueCourses = [...new Set(students.map(student => student.course_name))];

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      id_number: "",
      email: "",
      mobile: "",
      age: "",
      course_name: "",
      course_date: "",
      notes: "",
    });
    setEditingStudent(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can modify student records",
        variant: "destructive",
      });
      return;
    }

    // Validate ID number and mobile number length
    if (formData.id_number.length !== 10) {
      toast({
        title: "Validation Error",
        description: "ID number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    if (formData.mobile.length !== 10) {
      toast({
        title: "Validation Error",
        description: "Mobile number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingStudent) {
        // Update existing student
        const { error } = await supabase
          .from("students")
          .update(formData)
          .eq("id", editingStudent.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        // Create new student
        const { error } = await supabase
          .from("students")
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Student added successfully",
        });
      }

      fetchStudents();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save student",
        variant: "destructive",
      });
    }
  };

  // Handle edit
  const handleEdit = (student: Student) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can edit student records",
        variant: "destructive",
      });
      return;
    }

    setEditingStudent(student);
    setFormData({
      name: student.name,
      id_number: student.id_number,
      email: student.email,
      mobile: student.mobile,
      age: student.age,
      course_name: student.course_name,
      course_date: student.course_date,
      notes: student.notes || "",
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (studentId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete student records",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student deleted successfully",
      });

      fetchStudents();
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <GraduationCap className="h-6 w-6 sm:h-12 sm:w-12 text-primary" />
            <h1 className="text-xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Student Management System
            </h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-lg max-w-2xl mx-auto px-4">
            Manage your students efficiently with our comprehensive dashboard
          </p>
          
          {/* User Info and Theme Toggle */}
          {userProfile && (
            <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 flex-wrap">
              <Badge variant="secondary" className="px-2 py-1 sm:px-4 sm:py-2 text-xs">
                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {userProfile.first_name} {userProfile.last_name}
              </Badge>
              <Badge 
                variant={isAdmin ? "default" : "outline"} 
                className="px-2 py-1 sm:px-4 sm:py-2 text-xs"
              >
                {userProfile.role.toUpperCase()}
              </Badge>
              <ThemeToggle />
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 animate-fade-in-up">
          <Card className="card-gradient border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold text-primary">{students.length}</div>
            </CardContent>
          </Card>

          <Card className="card-gradient border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
              <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold text-primary">{filteredStudents.length}</div>
            </CardContent>
          </Card>

          <Card className="card-gradient border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Role</CardTitle>
              <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-sm sm:text-2xl font-bold text-primary">
                {isAdmin ? "Admin" : isTeacher ? "Teacher" : "User"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <Card className="card-gradient border-primary/20 animate-fade-in-up">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, ID, email, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background/50 border-primary/30 text-sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-background/50 border-primary/30">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {uniqueCourses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isAdmin && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm} className="w-full sm:w-auto text-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="card-gradient border-primary/30 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingStudent ? "Edit Student" : "Add New Student"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingStudent
                            ? "Update the student information below."
                            : "Fill in the student details below to add them to the system."}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              required
                              className="bg-background/50 border-primary/30"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="id_number">ID Number (10 digits)</Label>
                            <Input
                              id="id_number"
                              value={formData.id_number}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setFormData({ ...formData, id_number: value });
                              }}
                              maxLength={10}
                              pattern="[0-9]{10}"
                              placeholder="Enter 10 digits"
                              required
                              className="bg-background/50 border-primary/30"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                              required
                              className="bg-background/50 border-primary/30"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile (10 digits)</Label>
                            <Input
                              id="mobile"
                              value={formData.mobile}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setFormData({ ...formData, mobile: value });
                              }}
                              maxLength={10}
                              pattern="[0-9]{10}"
                              placeholder="Enter 10 digits"
                              required
                              className="bg-background/50 border-primary/30"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input
                              id="age"
                              value={formData.age}
                              onChange={(e) =>
                                setFormData({ ...formData, age: e.target.value })
                              }
                              required
                              className="bg-background/50 border-primary/30"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="course_name">Course Name</Label>
                            <Input
                              id="course_name"
                              value={formData.course_name}
                              onChange={(e) =>
                                setFormData({ ...formData, course_name: e.target.value })
                              }
                              required
                              className="bg-background/50 border-primary/30"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="course_date">Course Date</Label>
                          <Input
                            id="course_date"
                            type="date"
                            value={formData.course_date}
                            onChange={(e) =>
                              setFormData({ ...formData, course_date: e.target.value })
                            }
                            required
                            className="bg-background/50 border-primary/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes (Optional)</Label>
                          <Input
                            id="notes"
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData({ ...formData, notes: e.target.value })
                            }
                            className="bg-background/50 border-primary/30"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingStudent ? "Update" : "Add"} Student
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List - Redesigned Cards */}
        <div className="space-y-3 sm:space-y-4 animate-fade-in-up">
          {filteredStudents.length === 0 ? (
            <Card className="card-gradient border-primary/20">
              <CardContent className="text-center py-8 sm:py-12">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No students found</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm || courseFilter !== "all"
                    ? "Try adjusting your search filters"
                    : "Get started by adding your first student"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="card-gradient border-primary/20 hover:border-primary/50 transition-all duration-200">
                  <CardContent className="p-3 sm:p-6">
                    {/* Mobile-First Design */}
                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 
                            className="text-base sm:text-lg font-semibold text-primary leading-tight cursor-pointer hover:underline"
                            onClick={() => navigate(`/student/${student.id}`)}
                          >
                            {student.name}
                          </h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Badge 
                              variant={student.accepted ? "default" : "secondary"}
                              className={`text-xs px-2 py-1 ${
                                student.accepted 
                                  ? "bg-green-600 hover:bg-green-700" 
                                  : "bg-orange-500 hover:bg-orange-600"
                              }`}
                            >
                              {student.accepted ? "✓" : "⏳"}
                            </Badge>
                            {student.notes && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleNotes(student.id)}
                                className="text-muted-foreground hover:text-primary p-1 h-6 w-6"
                              >
                                {expandedNotes.has(student.id) ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Course Badge */}
                        <Badge variant="outline" className="border-primary/30 text-xs w-fit">
                          {student.course_name}
                        </Badge>
                      </div>

                      {/* Contact Info - Compact Grid */}
                      <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-medium min-w-12">ID:</span>
                          <span className="text-foreground">{student.id_number}</span>
                          <span className="font-medium ml-4 min-w-8">Age:</span>
                          <span className="text-foreground">{student.age}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="text-foreground truncate">{student.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="text-foreground">{student.mobile}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="text-foreground">{formatDate(student.course_date)}</span>
                        </div>
                      </div>
                      
                      {/* Notes Section */}
                      {student.notes && expandedNotes.has(student.id) && (
                        <div className="mt-3 p-3 bg-muted/20 rounded-lg border border-primary/10">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-3 w-3 text-primary" />
                            <span className="font-medium text-primary text-xs">Notes</span>
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                            {student.notes}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {isAdmin && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-primary/10">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={student.accepted}
                              onCheckedChange={() => handleAcceptanceToggle(student.id, student.accepted)}
                              className="scale-75"
                            />
                            <span className="text-xs text-muted-foreground">
                              {student.accepted ? "Accepted" : "Accept Student"}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(student)}
                              className="border-primary/30 hover:border-primary flex-1 text-xs py-1 h-8"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(student.id)}
                              className="border-destructive/30 hover:border-destructive text-destructive flex-1 text-xs py-1 h-8"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
