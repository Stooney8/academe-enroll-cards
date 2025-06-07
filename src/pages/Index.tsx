import React, { useState } from 'react';
import { Calendar, CalendarIcon, ArrowRight, ArrowLeft, User, Users, UserPlus, UserRound, Mail, Phone, BookOpen, IdCard, Palette } from 'lucide-react';
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

type Theme = 'warm' | 'ocean' | 'forest' | 'sunset' | 'dark';

const LUCIDE_ICONS = [User, UserRound, UserPlus, BookOpen, Mail, Phone, IdCard];

const themes = {
  warm: {
    name: 'Warm',
    gradient: 'from-amber-900 via-orange-900 to-red-900',
    cardBg: 'from-amber-800/40 to-orange-800/40',
    cardBorder: 'border-amber-600/30',
    text: 'text-amber-100',
    textSecondary: 'text-amber-200/80',
    textMuted: 'text-amber-300/50',
    button: 'bg-amber-800/20 border-amber-600 text-amber-100 hover:bg-amber-700/30',
    buttonPrimary: 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
    input: 'bg-amber-900/30 border-amber-600/50 text-amber-100 placeholder-amber-300/50 focus:border-amber-400',
    accent: 'text-amber-300'
  },
  ocean: {
    name: 'Ocean',
    gradient: 'from-blue-900 via-cyan-900 to-teal-900',
    cardBg: 'from-blue-800/40 to-cyan-800/40',
    cardBorder: 'border-blue-600/30',
    text: 'text-blue-100',
    textSecondary: 'text-blue-200/80',
    textMuted: 'text-blue-300/50',
    button: 'bg-blue-800/20 border-blue-600 text-blue-100 hover:bg-blue-700/30',
    buttonPrimary: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
    input: 'bg-blue-900/30 border-blue-600/50 text-blue-100 placeholder-blue-300/50 focus:border-blue-400',
    accent: 'text-blue-300'
  },
  forest: {
    name: 'Forest',
    gradient: 'from-green-900 via-emerald-900 to-teal-900',
    cardBg: 'from-green-800/40 to-emerald-800/40',
    cardBorder: 'border-green-600/30',
    text: 'text-green-100',
    textSecondary: 'text-green-200/80',
    textMuted: 'text-green-300/50',
    button: 'bg-green-800/20 border-green-600 text-green-100 hover:bg-green-700/30',
    buttonPrimary: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
    input: 'bg-green-900/30 border-green-600/50 text-green-100 placeholder-green-300/50 focus:border-green-400',
    accent: 'text-green-300'
  },
  sunset: {
    name: 'Sunset',
    gradient: 'from-purple-900 via-pink-900 to-rose-900',
    cardBg: 'from-purple-800/40 to-pink-800/40',
    cardBorder: 'border-purple-600/30',
    text: 'text-purple-100',
    textSecondary: 'text-purple-200/80',
    textMuted: 'text-purple-300/50',
    button: 'bg-purple-800/20 border-purple-600 text-purple-100 hover:bg-purple-700/30',
    buttonPrimary: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    input: 'bg-purple-900/30 border-purple-600/50 text-purple-100 placeholder-purple-300/50 focus:border-purple-400',
    accent: 'text-purple-300'
  },
  dark: {
    name: 'Dark',
    gradient: 'from-gray-900 via-slate-900 to-zinc-900',
    cardBg: 'from-gray-800/40 to-slate-800/40',
    cardBorder: 'border-gray-600/30',
    text: 'text-gray-100',
    textSecondary: 'text-gray-200/80',
    textMuted: 'text-gray-300/50',
    button: 'bg-gray-800/20 border-gray-600 text-gray-100 hover:bg-gray-700/30',
    buttonPrimary: 'from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700',
    input: 'bg-gray-900/30 border-gray-600/50 text-gray-100 placeholder-gray-300/50 focus:border-gray-400',
    accent: 'text-gray-300'
  }
};

const Index = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'list' | 'detail'>('home');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [currentTheme, setCurrentTheme] = useState<Theme>('warm');
  
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
      language: 'اللغة',
      theme: 'المظهر'
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
      language: 'Language',
      theme: 'Theme'
    }
  };

  const t = translations[language];
  const isRTL = language === 'ar';
  const theme = themes[currentTheme];

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
      
      setTimeout(() => {
        setCurrentPage('list');
      }, 1000);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if ((field === 'idNumber' || field === 'mobile') && value.length > 10) {
      return;
    }
    if ((field === 'idNumber' || field === 'mobile') && !/^\d*$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const ThemeSelector = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`${theme.button} gap-2`}
        >
          <Palette className="w-4 h-4" />
          {theme.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="space-y-2">
          {Object.entries(themes).map(([key, themeOption]) => (
            <Button
              key={key}
              variant={currentTheme === key ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentTheme(key as Theme)}
            >
              <div className={`w-4 h-4 rounded-full mr-2 bg-gradient-to-r ${themeOption.gradient.split(' ').slice(0, 2).join(' ')}`} />
              {themeOption.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  const renderHomePage = () => (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} p-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-6">
          <ThemeSelector />
          <Button
            variant="outline"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className={theme.button}
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`bg-gradient-to-br ${theme.cardBg} backdrop-blur-sm rounded-2xl p-8 mb-6 ${theme.cardBorder} border`}>
            <h1 className={`text-4xl md:text-5xl font-bold ${theme.text} mb-4 ${isRTL ? 'font-arabic' : ''}`}>
              {t.title}
            </h1>
            <p className={`text-xl ${theme.textSecondary} ${isRTL ? 'font-arabic' : ''}`}>
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className={`bg-gradient-to-br ${theme.cardBg} ${theme.cardBorder} backdrop-blur-sm hover:scale-105 transition-transform duration-300 cursor-pointer`}>
            <CardContent className="p-6 text-center">
              <UserPlus className={`w-12 h-12 ${theme.text} mx-auto mb-4`} />
              <h3 className={`text-xl font-semibold ${theme.text} mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                {t.registerStudent}
              </h3>
            </CardContent>
          </Card>
          
          <Card 
            className={`bg-gradient-to-br ${theme.cardBg} ${theme.cardBorder} backdrop-blur-sm hover:scale-105 transition-transform duration-300 cursor-pointer`}
            onClick={() => setCurrentPage('list')}
          >
            <CardContent className="p-6 text-center">
              <Users className={`w-12 h-12 ${theme.text} mx-auto mb-4`} />
              <h3 className={`text-xl font-semibold ${theme.text} mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                {t.viewStudents}
              </h3>
              <p className={`${theme.textSecondary} text-sm`}>
                {students.length} {language === 'ar' ? 'طالب' : 'students'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <Card className={`bg-gradient-to-br ${theme.cardBg} ${theme.cardBorder} backdrop-blur-sm border`}>
          <CardHeader>
            <CardTitle className={`text-2xl ${theme.text} text-center ${isRTL ? 'font-arabic' : ''}`}>
              {t.registerStudent}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className={`${theme.text} text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {t.name}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={theme.input}
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                {/* ID Number */}
                <div className="space-y-2">
                  <Label htmlFor="idNumber" className={`${theme.text} text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {t.idNumber}
                  </Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    maxLength={10}
                    className={theme.input}
                  />
                  {errors.idNumber && <p className="text-red-400 text-sm">{errors.idNumber}</p>}
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <Label htmlFor="mobile" className={`${theme.text} text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {t.mobile}
                  </Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    maxLength={10}
                    className={theme.input}
                  />
                  {errors.mobile && <p className="text-red-400 text-sm">{errors.mobile}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className={`${theme.text} text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {t.email}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={theme.input}
                  />
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>

                {/* Course Name */}
                <div className="space-y-2">
                  <Label htmlFor="courseName" className={`${theme.text} text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {t.courseName}
                  </Label>
                  <Input
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) => handleInputChange('courseName', e.target.value)}
                    className={theme.input}
                  />
                  {errors.courseName && <p className="text-red-400 text-sm">{errors.courseName}</p>}
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age" className={`${theme.text} text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {t.age}
                  </Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className={theme.input}
                  />
                  {errors.age && <p className="text-red-400 text-sm">{errors.age}</p>}
                </div>
              </div>

              {/* Course Date */}
              <div className="space-y-2">
                <Label className={`${theme.text} text-base ${isRTL ? 'font-arabic' : ''}`}>
                  {t.courseDate}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        `w-full justify-start text-left font-normal ${theme.input}`,
                        !formData.courseDate && theme.textMuted
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
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.courseDate && <p className="text-red-400 text-sm">{errors.courseDate}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full bg-gradient-to-r ${theme.buttonPrimary} text-white font-semibold py-3 text-lg`}
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
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} p-4`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => setCurrentPage('home')}
            variant="outline"
            className={theme.button}
          >
            {isRTL ? <ArrowRight className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
            {t.back}
          </Button>
          
          <h1 className={`text-3xl font-bold ${theme.text} ${isRTL ? 'font-arabic' : ''}`}>
            {t.studentList}
          </h1>
          
          <div className="flex gap-2">
            <ThemeSelector />
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className={theme.button}
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>
          </div>
        </div>

        {students.length === 0 ? (
          <Card className={`bg-gradient-to-br ${theme.cardBg} ${theme.cardBorder} backdrop-blur-sm border`}>
            <CardContent className="p-12 text-center">
              <Users className={`w-16 h-16 ${theme.textMuted} mx-auto mb-4`} />
              <h3 className={`text-2xl font-semibold ${theme.text} mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                {t.noStudents}
              </h3>
              <p className={`${theme.textSecondary} mb-6 ${isRTL ? 'font-arabic' : ''}`}>
                {t.startRegistering}
              </p>
              <Button
                onClick={() => setCurrentPage('home')}
                className={`bg-gradient-to-r ${theme.buttonPrimary} text-white`}
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
                  className={`bg-gradient-to-br ${theme.cardBg} ${theme.cardBorder} backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-xl border`}
                  onClick={() => {
                    setSelectedStudent(student);
                    setCurrentPage('detail');
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`bg-gradient-to-br ${theme.cardBg} p-3 rounded-full mr-4 shadow-lg`}>
                        <IconComponent className={`w-8 h-8 ${theme.text}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-semibold ${theme.text} ${isRTL ? 'font-arabic' : ''} mb-1`}>
                          {student.name}
                        </h3>
                        <p className={`${theme.textSecondary} text-sm font-medium`}>
                          {student.courseName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className={`bg-gradient-to-r ${theme.cardBg} p-3 rounded-lg`}>
                        <p className={theme.textSecondary}>
                          <span className={`${theme.accent} font-medium`}>{t.mobile}:</span>
                          <span className={`${theme.text} ml-2`}>{student.mobile}</span>
                        </p>
                      </div>
                      <div className={`bg-gradient-to-r ${theme.cardBg} p-3 rounded-lg`}>
                        <p className={theme.textSecondary}>
                          <span className={`${theme.accent} font-medium`}>{t.age}:</span>
                          <span className={`${theme.text} ml-2`}>{student.age}</span>
                        </p>
                      </div>
                      <div className={`bg-gradient-to-r ${theme.cardBg} p-3 rounded-lg`}>
                        <p className={theme.textSecondary}>
                          <span className={`${theme.accent} font-medium`}>{t.courseDate}:</span>
                          <span className={`${theme.text} ml-2`}>{format(student.courseDate, "PPP")}</span>
                        </p>
                      </div>
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
      <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} p-4`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => setCurrentPage('list')}
              variant="outline"
              className={theme.button}
            >
              {isRTL ? <ArrowRight className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
              {t.back}
            </Button>
            
            <h1 className={`text-3xl font-bold ${theme.text} ${isRTL ? 'font-arabic' : ''}`}>
              {t.studentDetails}
            </h1>
            
            <div className="flex gap-2">
              <ThemeSelector />
              <Button
                variant="outline"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className={theme.button}
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </Button>
            </div>
          </div>

          {/* Student Detail Card */}
          <Card className={`bg-gradient-to-br ${theme.cardBg} ${theme.cardBorder} backdrop-blur-sm border shadow-2xl`}>
            <CardContent className="p-8">
              {/* Header with Icon and Name */}
              <div className="flex items-center mb-8">
                <div className={`bg-gradient-to-br ${theme.cardBg} p-6 rounded-2xl mr-6 shadow-xl`}>
                  <IconComponent className={`w-16 h-16 ${theme.text}`} />
                </div>
                <div>
                  <h2 className={`text-4xl font-bold ${theme.text} mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                    {selectedStudent.name}
                  </h2>
                  <p className={`text-xl ${theme.textSecondary} font-medium ${isRTL ? 'font-arabic' : ''}`}>
                    {selectedStudent.courseName}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className={`bg-gradient-to-r ${theme.cardBg} p-6 rounded-xl shadow-lg`}>
                    <p className={`${theme.accent} text-sm font-medium mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                      {t.idNumber}
                    </p>
                    <p className={`${theme.text} text-lg font-semibold`}>
                      {selectedStudent.idNumber}
                    </p>
                  </div>
                  
                  <div className={`bg-gradient-to-r ${theme.cardBg} p-6 rounded-xl shadow-lg`}>
                    <p className={`${theme.accent} text-sm font-medium mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                      {t.mobile}
                    </p>
                    <p className={`${theme.text} text-lg font-semibold`}>
                      {selectedStudent.mobile}
                    </p>
                  </div>
                  
                  <div className={`bg-gradient-to-r ${theme.cardBg} p-6 rounded-xl shadow-lg`}>
                    <p className={`${theme.accent} text-sm font-medium mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                      {t.age}
                    </p>
                    <p className={`${theme.text} text-lg font-semibold`}>
                      {selectedStudent.age}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className={`bg-gradient-to-r ${theme.cardBg} p-6 rounded-xl shadow-lg`}>
                    <p className={`${theme.accent} text-sm font-medium mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                      {t.email}
                    </p>
                    <p className={`${theme.text} text-lg font-semibold break-all`}>
                      {selectedStudent.email}
                    </p>
                  </div>
                  
                  <div className={`bg-gradient-to-r ${theme.cardBg} p-6 rounded-xl shadow-lg`}>
                    <p className={`${theme.accent} text-sm font-medium mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                      {t.courseDate}
                    </p>
                    <p className={`${theme.text} text-lg font-semibold`}>
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
