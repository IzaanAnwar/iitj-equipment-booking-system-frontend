import { equipmentData } from './bookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

export function Maintainance() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Equipment in maintenance</CardTitle>
          <CardContent className="space-y-6 py-4">
            {equipmentData
              .filter((item) => item.status === 'maintenance')
              .map((item) => {
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-start gap-4">
                      <CardTitle className="text-xl">{item.name}</CardTitle>{' '}
                      <Badge variant="warning">{item.status}</Badge>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                    <CardTitle className="text-md">Opens on 6th April 2024</CardTitle>
                  </div>
                );
              })}
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
