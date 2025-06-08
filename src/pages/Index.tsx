import React, { useState, useEffect } from 'react';
import { Calendar, CalendarIcon, ArrowRight, ArrowLeft, User, Users, UserPlus, UserRound, Mail, Phone, BookOpen, IdCard, Palette, Check, X, FileText, Eye, EyeOff, Edit, Trash2, LogOut, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  idNumber: string;
  mobile: string;
  email: string;
  courseName: string;
  courseDate: Date;
  age: string;
  accepted: boolean;
  notes: string;
  iconType: string;
}

const StudentManagementSystem = () => {
  const { user, userProfile, signOut, isAdmin, isTeacher } = useAuth();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    mobile: '',
    email: '',
    courseName: '',
    courseDate: null as Date | null,
    age: '',
    accepted: false,
    notes: '',
    iconType: 'User',
  });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    idNumber: '',
    mobile: '',
    email: '',
    courseName: '',
    courseDate: null as Date | null,
    age: '',
    accepted: false,
    notes: '',
    iconType: 'User',
  });

  const formatDateForSupabase = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateFromSupabase = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    if (!user) return;
    
    const loadStudents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          toast({
            title: "Error loading students",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        const studentsData: Student[] = data?.map((student: any) => ({
          id: student.id,
          name: student.name,
          idNumber: student.id_number,
          mobile: student.mobile,
          email: student.email,
          courseName: student.course_name,
          courseDate: parseDateFromSupabase(student.course_date),
          age: student.age,
          accepted: student.accepted,
          notes: student.notes || '',
          iconType: student.icon_type || 'User',
        })) || [];

        setStudents(studentsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load students",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacher) {
      toast({
        title: "Access Denied",
        description: "Only teachers and admins can add students",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.idNumber || !formData.mobile || !formData.email || !formData.courseName || !formData.courseDate || !formData.age) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            name: formData.name,
            id_number: formData.idNumber,
            mobile: formData.mobile,
            email: formData.email,
            course_name: formData.courseName,
            course_date: formatDateForSupabase(formData.courseDate!),
            age: formData.age,
            accepted: formData.accepted,
            notes: formData.notes,
            icon_type: formData.iconType,
            user_id: user?.id,
          }
        ])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error adding student",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const newStudent: Student = {
        id: data.id,
        name: data.name,
        idNumber: data.id_number,
        mobile: data.mobile,
        email: data.email,
        courseName: data.course_name,
        courseDate: parseDateFromSupabase(data.course_date),
        age: data.age,
        accepted: data.accepted,
        notes: data.notes || '',
        iconType: data.icon_type || 'User',
      };

      setStudents(prev => [newStudent, ...prev]);
      setFormData({
        name: '',
        idNumber: '',
        mobile: '',
        email: '',
        courseName: '',
        courseDate: null,
        age: '',
        accepted: false,
        notes: '',
        iconType: 'User',
      });

      toast({
        title: "Student added successfully",
        description: `${newStudent.name} has been added to the system`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacher) {
      toast({
        title: "Access Denied",
        description: "Only teachers and admins can edit students",
        variant: "destructive",
      });
      return;
    }

    if (!editingStudent || !editFormData.name || !editFormData.idNumber || !editFormData.mobile || !editFormData.email || !editFormData.courseName || !editFormData.courseDate || !editFormData.age) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          name: editFormData.name,
          id_number: editFormData.idNumber,
          mobile: editFormData.mobile,
          email: editFormData.email,
          course_name: editFormData.courseName,
          course_date: formatDateForSupabase(editFormData.courseDate!),
          age: editFormData.age,
          accepted: editFormData.accepted,
          notes: editFormData.notes,
          icon_type: editFormData.iconType,
        })
        .eq('id', editingStudent.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error updating student",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const updatedStudent: Student = {
        id: data.id,
        name: data.name,
        idNumber: data.id_number,
        mobile: data.mobile,
        email: data.email,
        courseName: data.course_name,
        courseDate: parseDateFromSupabase(data.course_date),
        age: data.age,
        accepted: data.accepted,
        notes: data.notes || '',
        iconType: data.icon_type || 'User',
      };

      setStudents(prev => prev.map(student => 
        student.id === editingStudent.id ? updatedStudent : student
      ));

      setEditingStudent(null);
      setEditFormData({
        name: '',
        idNumber: '',
        mobile: '',
        email: '',
        courseName: '',
        courseDate: null,
        age: '',
        accepted: false,
        notes: '',
        iconType: 'User',
      });

      toast({
        title: "Student updated successfully",
        description: `${updatedStudent.name}'s information has been updated`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete students",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) {
        toast({
          title: "Error deleting student",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setStudents(prev => prev.filter(student => student.id !== studentId));
      toast({
        title: "Student deleted successfully",
        description: "The student has been removed from the system",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Student Management System</h1>
        <Button onClick={signOut} variant="outline" className="mt-4">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
        {/* Add Student Form */}
        {isTeacher && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Add Student</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>ID Number</Label>
                    <Input value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Mobile</Label>
                    <Input value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Course Name</Label>
                    <Input value={formData.courseName} onChange={(e) => setFormData({ ...formData, courseName: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Course Date</Label>
                    <Input type="date" value={formData.courseDate ? formData.courseDate.toISOString().split('T')[0] : ''} onChange={(e) => setFormData({ ...formData, courseDate: new Date(e.target.value) })} required />
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" className="mt-4">Add Student</Button>
              </form>
            </CardContent>
          </Card>
        )}
        {/* Students List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ul>
                {students.map(student => (
                  <li key={student.id} className="flex justify-between items-center">
                    <span>{student.name}</span>
                    <div>
                      {isTeacher && (
                        <Button onClick={() => {
                          setEditingStudent(student);
                          setEditFormData({
                            name: student.name,
                            idNumber: student.idNumber,
                            mobile: student.mobile,
                            email: student.email,
                            courseName: student.courseName,
                            courseDate: student.courseDate,
                            age: student.age,
                            accepted: student.accepted,
                            notes: student.notes,
                            iconType: student.iconType,
                          });
                        }}>Edit</Button>
                      )}
                      {isAdmin && (
                        <Button onClick={() => handleDelete(student.id)}>Delete</Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentManagementSystem;
