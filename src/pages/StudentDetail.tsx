
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Mail, Phone, Calendar, GraduationCap, FileText, IdCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

const StudentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Format date to show month as text
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fetch student details
  const fetchStudent = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching student:", error);
        toast({
          title: "Error",
          description: "Failed to fetch student details",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        toast({
          title: "Not Found",
          description: "Student not found",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setStudent(data);
    } catch (error) {
      console.error("Error in fetchStudent:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="card-gradient border-primary/20 max-w-md">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Student Not Found</h3>
            <p className="text-muted-foreground mb-4">The student you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-primary/30 hover:border-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
          <ThemeToggle />
        </div>

        {/* Student Profile Card */}
        <Card className="card-gradient border-primary/20 animate-fade-in-up">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-primary">{student.name}</CardTitle>
            <CardDescription className="text-base">
              <Badge 
                variant={student.accepted ? "default" : "secondary"}
                className={`text-sm px-4 py-2 ${
                  student.accepted 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {student.accepted ? "✓ Accepted" : "⏳ Pending"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Information */}
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Course Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Course Name</p>
                  <p className="font-medium">{student.course_name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Course Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(student.course_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">ID Number</p>
                  <p className="font-medium flex items-center gap-2">
                    <IdCard className="h-4 w-4" />
                    {student.id_number}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{student.age} years old</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a 
                      href={`mailto:${student.email}`} 
                      className="text-primary hover:underline"
                    >
                      {student.email}
                    </a>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a 
                      href={`tel:${student.mobile}`} 
                      className="text-primary hover:underline"
                    >
                      {student.mobile}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {student.notes && (
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </h3>
                <div className="p-4 bg-muted/20 rounded-lg border border-primary/10">
                  <p className="text-sm whitespace-pre-wrap">{student.notes}</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid gap-4 pt-4 border-t border-primary/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium">Created:</p>
                  <p>{formatDate(student.created_at)}</p>
                </div>
                <div>
                  <p className="font-medium">Last Updated:</p>
                  <p>{formatDate(student.updated_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDetail;
