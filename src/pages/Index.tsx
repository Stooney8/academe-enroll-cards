
import React, { useState } from 'react';
import { Calendar, CalendarIcon, ArrowRight, ArrowLeft, User, Users, UserPlus, UserRound, Mail, Phone, BookOpen, IdCard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  idNumber: string;
  mobile: string;
  email: string;
  courseName: string;
  courseDate: Date;
  age: string;
  icon: any;
}

const LUCIDE_ICONS = [User, UserRound, UserPlus, BookOpen, Mail, Phone, IdCard];

const Index = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'list' | 'detail'>('home');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    mobile: '',
    email: '',
    courseName: '',
    courseDate: null as Date | null,
    age: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const translations = {
    ar: {
      title: 'منصة التسجيل الأكاديمي',
      subtitle: 'نظام إدارة الطلاب والدورات التدريبية',
      registerStudent: 'تسجيل طالب جديد',
      viewStudents: 'عرض الطلاب',
      name: 'الاسم',
      idNumber: 'رقم الهوية',
      mobile: 'الجوال',
      email: 'البريد الإلكتروني',
      courseName: 'اسم البرنامج',
      courseDate: 'تاريخ البرنامج',
      age: 'العمر',
      submit: 'تسجيل',
      back: 'رجوع',
      studentList: 'قائمة الطلاب',
      studentDetails: 'تفاصيل الطالب',
      selectDate: 'اختر التاريخ',
      registeredStudents: 'الطلاب المسجلين',
      noStudents: 'لا يوجد طلاب مسجلين بعد',
      startRegistering: 'ابدأ بتسجيل الطلاب الآن',
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'البريد الإلكتروني غير صحيح',
      invalidId: 'رقم الهوية يجب أن يكون 10 أرقام',
      invalidMobile: 'رقم الجوال يجب أن يكون 10 أرقام',
      registrationSuccess: 'تم التسجيل بنجاح!',
      language: 'اللغة'
    },
    en: {
      title: 'Academic Registration Platform',
      subtitle: 'Student and Course Management System',
      registerStudent: 'Register New Student',
      viewStudents: 'View Students',
      name: 'Name',
      idNumber: 'ID Number',
      mobile: 'Mobile',
      email: 'Email',
      courseName: 'Course Name',
      courseDate: 'Course Date',
      age: 'Age',
      submit: 'Register',
      back: 'Back',
      studentList: 'Student List',
      studentDetails: 'Student Details',
      selectDate: 'Select Date',
      registeredStudents: 'Registered Students',
      noStudents: 'No students registered yet',
      startRegistering: 'Start registering students now',
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      invalidId: 'ID number must be 10 digits',
      invalidMobile: 'Mobile number must be 10 digits',
      registrationSuccess: 'Registration successful!',
      language: 'Language'
    }
  };

  const t = translations[language];
  const isRTL = language === 'ar';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = t.required;
    if (!formData.idNumber.trim()) newErrors.idNumber = t.required;
    else if (formData.idNumber.length !== 10 || !/^\d+$/.test(formData.idNumber)) {
      newErrors.idNumber = t.invalidId;
    }
    if (!formData.mobile.trim()) newErrors.mobile = t.required;
    else if (formData.mobile.length !== 10 || !/^\d+$/.test(formData.mobile)) {
      newErrors.mobile = t.invalidMobile;
    }
    if (!formData.email.trim()) newErrors.email = t.required;
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }
    if (!formData.courseName.trim()) newErrors.courseName = t.required;
    if (!formData.courseDate) newErrors.courseDate = t.required;
    if (!formData.age.trim()) newErrors.age = t.required;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const randomIcon = LUCIDE_ICONS[Math.floor(Math.random() * LUCIDE_ICONS.length)];
      const newStudent: Student = {
        id: Date.now().toString(),
        ...formData,
        courseDate: formData.courseDate!,
        icon: randomIcon
      };
      
      setStudents([...students, newStudent]);
      setFormData({
        name: '',
        idNumber: '',
        mobile: '',
        email: '',
        courseName: '',
        courseDate: null,
        age: ''
      });
      setErrors({});
      
      // Show success and navigate to list
      setTimeout(() => {
        setCurrentPage('list');
      }, 1000);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if ((field === 'idNumber' || field === 'mobile') && value.length > 10) {
      return; // Don't allow more than 10 digits
    }
    if ((field === 'idNumber' || field === 'mobile') && !/^\d*$/.test(value)) {
      return; // Only allow digits
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderHomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Language Toggle */}
        <div className="flex justify-end mb-6">
          <Button
            variant="outline"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="bg-amber-800/20 border-amber-600 text-amber-100 hover:bg-amber-700/30"
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-amber-800/30 backdrop-blur-sm rounded-2xl p-8 mb-6">
            <h1 className={`text-4xl md:text-5xl font-bold text-amber-100 mb-4 ${isRTL ? 'font-arabic' : ''}`}>
              {t.title}
            </h1>
            <p className={`text-xl text-amber-200/80 ${isRTL ? 'font-arabic' : ''}`}>
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-amber-800/40 to-orange-800/40 border-amber-600/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <UserPlus className="w-12 h-12 text-amber-100 mx-auto mb-4" />
              <h3 className={`text-xl font-semibold text-amber-100 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                {t.registerStudent}
              </h3>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-gradient-to-br from-orange-800/40 to-red-800/40 border-orange-600/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => setCurrentPage('list')}
          >
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-amber-100 mx-auto mb-4" />
              <h3 className={`text-xl font-semibold text-amber-100 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                {t.viewStudents}
              </h3>
              <p className="text-amber-200/70 text-sm">
                {students.length} {language === 'ar' ? 'طالب' : 'students'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <Card className="bg-amber-800/20 border-amber-600/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className={`text-2xl text-amber-100 text-center ${isRTL ? 'font-arabic' : ''}`}>
              {t.registerStudent}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className={`text-amber-100 text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {t.name}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-amber-900/30 border-amber-600/50 text-amber-100 placeholder-amber-300/50 focus:border-amber-400"
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                {/* ID Number */}
                <div className="space-y-2">
                  <Label htmlFor="idNumber" className={`text-amber-100 text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {t.idNumber}
                  </Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    maxLength={10}
                    className="bg-amber-900/30 border-amber-600/50 text-amber-100 placeholder-amber-300/50 focus:border-amber-400"
                  />
                  {errors.idNumber && <p className="text-red-400 text-sm">{errors.idNumber}</p>}
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <Label htmlFor="mobile" className={`text-amber-100 text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {t.mobile}
                  </Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    maxLength={10}
                    className="bg-amber-900/30 border-amber-600/50 text-amber-100 placeholder-amber-300/50 focus:border-amber-400"
                  />
                  {errors.mobile && <p className="text-red-400 text-sm">{errors.mobile}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className={`text-amber-100 text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {t.email}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-amber-900/30 border-amber-600/50 text-amber-100 placeholder-amber-300/50 focus:border-amber-400"
                  />
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>

                {/* Course Name */}
                <div className="space-y-2">
                  <Label htmlFor="courseName" className={`text-amber-100 text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {t.courseName}
                  </Label>
                  <Input
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) => handleInputChange('courseName', e.target.value)}
                    className="bg-amber-900/30 border-amber-600/50 text-amber-100 placeholder-amber-300/50 focus:border-amber-400"
                  />
                  {errors.courseName && <p className="text-red-400 text-sm">{errors.courseName}</p>}
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age" className={`text-amber-100 text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {t.age}
                  </Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="bg-amber-900/30 border-amber-600/50 text-amber-100 placeholder-amber-300/50 focus:border-amber-400"
                  />
                  {errors.age && <p className="text-red-400 text-sm">{errors.age}</p>}
                </div>
              </div>

              {/* Course Date */}
              <div className="space-y-2">
                <Label className={`text-amber-100 text-base ${isRTL ? 'font-arabic' : ''}`}>
                  {t.courseDate}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-amber-900/30 border-amber-600/50 text-amber-100 hover:bg-amber-800/40",
                        !formData.courseDate && "text-amber-300/50"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.courseDate ? format(formData.courseDate, "PPP") : t.selectDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.courseDate || undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, courseDate: date || null }))}
                      initialFocus
                      className="p-3 pointer-events-auto bg-amber-900 border-amber-600"
                    />
                  </PopoverContent>
                </Popover>
                {errors.courseDate && <p className="text-red-400 text-sm">{errors.courseDate}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 text-lg"
              >
                {t.submit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStudentList = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => setCurrentPage('home')}
            variant="outline"
            className="bg-amber-800/20 border-amber-600 text-amber-100 hover:bg-amber-700/30"
          >
            {isRTL ? <ArrowRight className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
            {t.back}
          </Button>
          
          <h1 className={`text-3xl font-bold text-amber-100 ${isRTL ? 'font-arabic' : ''}`}>
            {t.studentList}
          </h1>
          
          <Button
            variant="outline"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="bg-amber-800/20 border-amber-600 text-amber-100 hover:bg-amber-700/30"
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </Button>
        </div>

        {students.length === 0 ? (
          <Card className="bg-amber-800/20 border-amber-600/30 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-amber-300/50 mx-auto mb-4" />
              <h3 className={`text-2xl font-semibold text-amber-100 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                {t.noStudents}
              </h3>
              <p className={`text-amber-200/70 mb-6 ${isRTL ? 'font-arabic' : ''}`}>
                {t.startRegistering}
              </p>
              <Button
                onClick={() => setCurrentPage('home')}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                {t.registerStudent}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => {
              const IconComponent = student.icon;
              return (
                <Card
                  key={student.id}
                  className="bg-gradient-to-br from-amber-800/40 to-orange-800/40 border-amber-600/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedStudent(student);
                    setCurrentPage('detail');
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-amber-600/30 p-3 rounded-full mr-4">
                        <IconComponent className="w-8 h-8 text-amber-100" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-semibold text-amber-100 ${isRTL ? 'font-arabic' : ''}`}>
                          {student.name}
                        </h3>
                        <p className="text-amber-200/70 text-sm">
                          {student.courseName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p className="text-amber-200/80">
                        <span className="text-amber-300">{t.mobile}:</span> {student.mobile}
                      </p>
                      <p className="text-amber-200/80">
                        <span className="text-amber-300">{t.age}:</span> {student.age}
                      </p>
                      <p className="text-amber-200/80">
                        <span className="text-amber-300">{t.courseDate}:</span> {format(student.courseDate, "PPP")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderStudentDetail = () => {
    if (!selectedStudent) return null;
    
    const IconComponent = selectedStudent.icon;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => setCurrentPage('list')}
              variant="outline"
              className="bg-amber-800/20 border-amber-600 text-amber-100 hover:bg-amber-700/30"
            >
              {isRTL ? <ArrowRight className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
              {t.back}
            </Button>
            
            <h1 className={`text-3xl font-bold text-amber-100 ${isRTL ? 'font-arabic' : ''}`}>
              {t.studentDetails}
            </h1>
            
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="bg-amber-800/20 border-amber-600 text-amber-100 hover:bg-amber-700/30"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>
          </div>

          {/* Student Detail Card */}
          <Card className="bg-gradient-to-br from-amber-800/30 to-orange-800/30 border-amber-600/30 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Header with Icon and Name */}
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-br from-amber-600/40 to-orange-600/40 p-6 rounded-2xl mr-6">
                  <IconComponent className="w-16 h-16 text-amber-100" />
                </div>
                <div>
                  <h2 className={`text-4xl font-bold text-amber-100 mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                    {selectedStudent.name}
                  </h2>
                  <p className={`text-xl text-amber-200/80 ${isRTL ? 'font-arabic' : ''}`}>
                    {selectedStudent.courseName}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-amber-900/30 p-4 rounded-xl">
                    <p className={`text-amber-300 text-sm font-medium mb-1 ${isRTL ? 'font-arabic' : ''}`}>
                      {t.idNumber}
                    </p>
                    <p className="text-amber-100 text-lg font-semibold">
                      {selectedStudent.idNumber}
                    </p>
                  </div>
                  
                  <div className="bg-amber-900/30 p-4 rounded-xl">
                    <p className={`text-amber-300 text-sm font-medium mb-1 ${isRTL ? 'font-arabic' : ''}`}>
                      {t.mobile}
                    </p>
                    <p className="text-amber-100 text-lg font-semibold">
                      {selectedStudent.mobile}
                    </p>
                  </div>
                  
                  <div className="bg-amber-900/30 p-4 rounded-xl">
                    <p className={`text-amber-300 text-sm font-medium mb-1 ${isRTL ? 'font-arabic' : ''}`}>
                      {t.age}
                    </p>
                    <p className="text-amber-100 text-lg font-semibold">
                      {selectedStudent.age}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-amber-900/30 p-4 rounded-xl">
                    <p className={`text-amber-300 text-sm font-medium mb-1 ${isRTL ? 'font-arabic' : ''}`}>
                      {t.email}
                    </p>
                    <p className="text-amber-100 text-lg font-semibold break-all">
                      {selectedStudent.email}
                    </p>
                  </div>
                  
                  <div className="bg-amber-900/30 p-4 rounded-xl">
                    <p className={`text-amber-300 text-sm font-medium mb-1 ${isRTL ? 'font-arabic' : ''}`}>
                      {t.courseDate}
                    </p>
                    <p className="text-amber-100 text-lg font-semibold">
                      {format(selectedStudent.courseDate, "PPPP")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Render current page
  switch (currentPage) {
    case 'list':
      return renderStudentList();
    case 'detail':
      return renderStudentDetail();
    default:
      return renderHomePage();
  }
};

export default Index;
