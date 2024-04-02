import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function Unauthorized({ message }: { message?: string }) {
  return (
    <Card className="shadow">
      <CardHeader className="py-8 text-center">
        <CardTitle>Unauthorized</CardTitle>
        <CardDescription className="text-lg text-destructive">
          {message || 'You do not have neccessary perissions to view this page.'}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
