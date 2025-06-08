
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
  const { user, userProfile, signOut, isAdmin, isTeacher, loading: authLoading } = useAuth();
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

  // Debug logging to check user role
  useEffect(() => {
    console.log('Auth state:', { user: user?.email, userProfile, isAdmin, isTeacher, authLoading });
  }, [user, userProfile, isAdmin, isTeacher, authLoading]);

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
    if (!user || authLoading) return;
    
    const loadStudents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading students:', error);
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
        console.error('Error in loadStudents:', error);
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
  }, [user, authLoading, toast]);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
        console.error('Error adding student:', error);
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
      console.error('Error in handleSubmit:', error);
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
        console.error('Error updating student:', error);
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
      console.error('Error in handleEdit:', error);
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
        console.error('Error deleting student:', error);
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
      console.error('Error in handleDelete:', error);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Management System</h1>
            <p className="text-gray-600 mt-1">
              Welcome, {userProfile?.first_name || user?.email} 
              {userProfile?.role && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {isAdmin && <Shield className="w-3 h-3 mr-1" />}
                  {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                </span>
              )}
            </p>
          </div>
          <Button onClick={signOut} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" /> 
            Sign Out
          </Button>
        </div>

        {/* Add Student Form - Only show to teachers and admins */}
        {isTeacher && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Student
              </CardTitle>
              <CardDescription>
                Fill in the student information to add them to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input 
                      id="name"
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                      required 
                      placeholder="Enter student name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="idNumber">ID Number *</Label>
                    <Input 
                      id="idNumber"
                      value={formData.idNumber} 
                      onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} 
                      required 
                      placeholder="Enter ID number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile *</Label>
                    <Input 
                      id="mobile"
                      value={formData.mobile} 
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} 
                      required 
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                      required 
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseName">Course Name *</Label>
                    <Input 
                      id="courseName"
                      value={formData.courseName} 
                      onChange={(e) => setFormData({ ...formData, courseName: e.target.value })} 
                      required 
                      placeholder="Enter course name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseDate">Course Date *</Label>
                    <Input 
                      id="courseDate"
                      type="date" 
                      value={formData.courseDate ? formData.courseDate.toISOString().split('T')[0] : ''} 
                      onChange={(e) => setFormData({ ...formData, courseDate: new Date(e.target.value) })} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input 
                      id="age"
                      value={formData.age} 
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })} 
                      required 
                      placeholder="Enter age"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                      id="notes"
                      value={formData.notes} 
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                      placeholder="Additional notes about the student"
                      rows={3}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading ? 'Adding...' : 'Add Student'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students ({students.length})
            </CardTitle>
            <CardDescription>
              Manage and view all registered students
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading students...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students found. {isTeacher ? 'Add your first student above.' : 'Contact an admin to add students.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map(student => (
                  <div key={student.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <IdCard className="h-4 w-4" />
                            <span>ID: {student.idNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{student.mobile}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{student.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{student.courseName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{student.courseDate.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Age: {student.age}</span>
                          </div>
                        </div>
                        {student.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Notes:</strong> {student.notes}
                          </div>
                        )}
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.accepted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.accepted ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Accepted
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 mr-1" />
                                Pending
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {isTeacher && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
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
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Student Dialog */}
        <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update the student information below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input 
                    id="edit-name"
                    value={editFormData.name} 
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-idNumber">ID Number *</Label>
                  <Input 
                    id="edit-idNumber"
                    value={editFormData.idNumber} 
                    onChange={(e) => setEditFormData({ ...editFormData, idNumber: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-mobile">Mobile *</Label>
                  <Input 
                    id="edit-mobile"
                    value={editFormData.mobile} 
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input 
                    id="edit-email"
                    type="email"
                    value={editFormData.email} 
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-courseName">Course Name *</Label>
                  <Input 
                    id="edit-courseName"
                    value={editFormData.courseName} 
                    onChange={(e) => setEditFormData({ ...editFormData, courseName: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-courseDate">Course Date *</Label>
                  <Input 
                    id="edit-courseDate"
                    type="date" 
                    value={editFormData.courseDate ? editFormData.courseDate.toISOString().split('T')[0] : ''} 
                    onChange={(e) => setEditFormData({ ...editFormData, courseDate: new Date(e.target.value) })} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-age">Age *</Label>
                  <Input 
                    id="edit-age"
                    value={editFormData.age} 
                    onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })} 
                    required 
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-accepted"
                    checked={editFormData.accepted}
                    onChange={(e) => setEditFormData({ ...editFormData, accepted: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="edit-accepted">Accepted</Label>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea 
                    id="edit-notes"
                    value={editFormData.notes} 
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })} 
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Student'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StudentManagementSystem;
