import { StudentForm } from '@/components/add-student/student-form';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export default async function AddEquipment() {
  return (
    <div className="flex w-full items-center justify-center pt-12">
      <Card className="w-full space-y-4 p-4 md:w-[60%] lg:w-[30%]">
        <CardTitle>Add a Student</CardTitle>
        <CardContent>
          <StudentForm />
        </CardContent>
      </Card>
    </div>
  );
}
