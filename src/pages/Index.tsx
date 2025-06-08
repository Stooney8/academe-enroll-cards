import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit3, Plus, Users, GraduationCap, UserCheck, Search, Eye, EyeOff, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3">
            <GraduationCap className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Student Management System
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Manage your students efficiently with our comprehensive dashboard
          </p>
          
          {/* User Info */}
          {userProfile && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Badge variant="secondary" className="px-4 py-2">
                <UserCheck className="h-4 w-4 mr-2" />
                {userProfile.first_name} {userProfile.last_name}
              </Badge>
              <Badge 
                variant={isAdmin ? "default" : "outline"} 
                className="px-4 py-2"
              >
                {userProfile.role.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
          <Card className="card-gradient border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{students.length}</div>
            </CardContent>
          </Card>

          <Card className="card-gradient border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{filteredStudents.length}</div>
            </CardContent>
          </Card>

          <Card className="card-gradient border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Role</CardTitle>
              <UserCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isAdmin ? "Admin" : isTeacher ? "Teacher" : "User"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <Card className="card-gradient border-primary/20 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, ID, email, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background/50 border-primary/30"
                />
              </div>
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
                    <Button onClick={resetForm} className="whitespace-nowrap">
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
                          <Label htmlFor="id_number">ID Number</Label>
                          <Input
                            id="id_number"
                            value={formData.id_number}
                            onChange={(e) =>
                              setFormData({ ...formData, id_number: e.target.value })
                            }
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
                          <Label htmlFor="mobile">Mobile</Label>
                          <Input
                            id="mobile"
                            value={formData.mobile}
                            onChange={(e) =>
                              setFormData({ ...formData, mobile: e.target.value })
                            }
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
          </CardContent>
        </Card>

        {/* Students List */}
        <div className="space-y-4 animate-fade-in-up">
          {filteredStudents.length === 0 ? (
            <Card className="card-gradient border-primary/20">
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No students found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || courseFilter !== "all"
                    ? "Try adjusting your search filters"
                    : "Get started by adding your first student"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="card-gradient border-primary/20 hover:border-primary/50 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-primary">
                            {student.name}
                          </h3>
                          <Badge variant="outline" className="border-primary/30">
                            {student.course_name}
                          </Badge>
                          {student.accepted && (
                            <Badge variant="default" className="bg-green-600">
                              Accepted
                            </Badge>
                          )}
                          {student.notes && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleNotes(student.id)}
                              className="text-muted-foreground hover:text-primary"
                            >
                              {expandedNotes.has(student.id) ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><span className="font-medium">ID:</span> {student.id_number}</p>
                          <p><span className="font-medium">Email:</span> {student.email}</p>
                          <p><span className="font-medium">Mobile:</span> {student.mobile}</p>
                          <p><span className="font-medium">Age:</span> {student.age}</p>
                          <p><span className="font-medium">Course Date:</span> {new Date(student.course_date).toLocaleDateString()}</p>
                          <p><span className="font-medium">Added:</span> {new Date(student.created_at).toLocaleDateString()}</p>
                        </div>
                        
                        {/* Notes Section */}
                        {student.notes && expandedNotes.has(student.id) && (
                          <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-primary/20">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium text-primary">Notes</span>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {student.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(student)}
                            className="border-primary/30 hover:border-primary"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                            className="border-destructive/30 hover:border-destructive text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
