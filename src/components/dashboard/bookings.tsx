'use client';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CommandList } from 'cmdk';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Maintainance } from './maintainance';

export interface IEquipment {
  id: string;
  name: string;
  description: string;
  make: string;
  model: string;
  location: string;
  facultyInCharge: string;
  emailId: string;
  status: 'active' | 'maintenance';
  phoneNo: string;
  slot: string;
  token: string;
  reason?: string;
}
interface Slot {
  startTime: Date | string;
  endTime: Date | string;
  booked: boolean;
  bookingId?: string; // Optional: Link to a separate booking object
}
export const equipmentData: IEquipment[] = [
  {
    id: '1',
    name: 'NMR Spectrometer',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Bruker High Performance Digital FT-NMR',
    model: 'AVANCE III HD, AscendTM WB, 500 MHz',
    location: 'Room No. 111, Chemistry Building',
    facultyInCharge: 'Dr. Samanwita Pal',
    emailId: 'samanwita@iitj.ac.in',
    status: 'active',
    phoneNo: '(91 291) 280 1305',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '2',
    name: 'UV-Vis Spectrophotometer',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Varian',
    model: 'Cary 4000',
    location: 'Room No. 111, Chemistry Building',
    facultyInCharge: 'Dr. Dibyendu Kumar Sasmal',
    emailId: 'sasmal@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 2801311',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '3',
    name: 'FT-IR Spectrometer',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Bruker',
    model: 'Vertex, 70V+PMA50',
    location: 'Room No. 111, Chemistry Building',
    facultyInCharge: 'Dr. Samanwita Pal',
    emailId: 'samanwita@iitj.ac.in',
    status: 'active',
    phoneNo: '(91 291) 280 1305',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '4',
    name: 'Fluorescence Spectrometer',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Perkin Elmer',
    model: 'LS 55',
    location: 'Room No. 111, Chemistry Building',
    facultyInCharge: 'Dr. Dibyendu Kumar Sasmal',
    emailId: 'sasmal@iitj.ac.in',
    status: 'maintenance',
    phoneNo: '0291 2801311',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '5',
    name: 'CD Spectrometer',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'ThermoFisher Scientific',
    model: '2821 PLC-230 LP',
    location: 'Room No. 112 Chemistry Building',
    facultyInCharge: 'Dr. Neha Jain',
    emailId: 'njain@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 280 1210',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '6',
    name: 'HPLC',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Waters',
    model: 'Model 2489',
    location: 'Room No. 111 Chemistry Building',
    facultyInCharge: 'Dr. Nirmal Rana',
    emailId: 'nirmalrana@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 280 1311',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '7',
    name: 'GC (Gas Chromatograph)',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Youlein',
    model: '6500GC System',
    location: 'Room No. 111 Chemistry Building',
    facultyInCharge: 'Dr. Subrato',
    emailId: 'subrata@iitj.ac.in',
    status: 'maintenance',
    phoneNo: '0291 280 1313',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '8',
    name: 'Acta Purifier UPC 10 (FPLC)',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'GE Healthcare',
    model: 'UPC 10',
    location: 'Room No.112 Chemistry Building',
    facultyInCharge: 'Dr. Sudipta Bhattacharya',
    emailId: 'sudipta@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 280-1213',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },

  {
    id: '9',
    name: 'Atomic Force Microscope (AFM)',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Park System',
    model: 'XE 70',
    location: 'Room No. 111 Chemistry Building',
    facultyInCharge: 'Dr. Durgamadhab Mishra',
    emailId: 'durgamadhab@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 2801610',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '10',
    name: 'Scanning Electron Microscope (SEM)',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'SEM-Carl Zeiss, EDS-Oxford instruments',
    model: 'SEM- EVO 18, EDS-51-ADDD-0048',
    location: 'Room No. 111 Chemistry Building',
    facultyInCharge: 'Dr. Ravi K. R.',
    emailId: 'ravikr@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 280 1556',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '11',
    name: 'Fluorescence Microscopy (Inverted)',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Olympus',
    model: 'IX83',
    location: 'Room No. 109 Chemistry Building',
    facultyInCharge: 'Dr. Dibyendu Kumar Sasmal',
    emailId: 'sasmal@iitj.ac.in',
    status: 'maintenance',
    phoneNo: '0291 2801314',
    slot: '2',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '12',
    name: 'Optical Microscopy',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Leica',
    model: 'DM6000B',
    location: 'Room No. 109 Chemistry Building',
    facultyInCharge: 'Dr. Dibyendu Kumar Sasmal',
    emailId: 'sasmal@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 2801314',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '13',
    name: 'Advance Powder X-Ray Diffractometer',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Bruker AXS',
    model: 'D8 Advance',
    location: 'Room No. 111 Chemistry Building',
    facultyInCharge: 'Dr. Rahul Chhibber',
    emailId: 'rahul_chhibber@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 2801506',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '14',
    name: 'Single Crystal X-Ray Diffractometer',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Bruker AXS',
    model: 'Apex II, Source (Mo Kα)',
    location: 'Room No. 111 Chemistry Building',
    facultyInCharge: 'Dr. Ramesh Metre',
    emailId: 'rkmetre@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 2801309',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '15',
    name: 'Differential Scanning Calorimetry (DSC)',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Perkin Elmer',
    model: 'DSC-4000',
    location: 'Room No. 111 Chemistry Building',
    facultyInCharge: 'Dr. Ravi K R',
    emailId: 'ravikr@iitj.ac.in',
    status: 'maintenance',
    phoneNo: '0291 280 1556',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '16',
    name: 'Isothermal Titration Calorimetry (ITC)',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Waters Ges.m.b.H, Austria',
    model: '601000.901/601116.901',
    location: 'Room No. 112 Chemistry Building',
    facultyInCharge: 'Dr. Sudipta Bhattacharya',
    emailId: 'sudipta@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 280-1213',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '17',
    name: 'Simultaneous Thermal Analyzer (STA)',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Perkin Elmer',
    model: 'STA6000',
    location: 'Room No. 111 Chemistry Building',
    facultyInCharge: 'Dr. Rahul Chhibber',
    emailId: 'rahul_chhibber@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 280 1506',
    slot: '2',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '18',
    name: 'BET Physisorption',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Quanta chrome instruments',
    model: 'Autosorb iQ3',
    location: 'Room No. 111 Chemistry Building',
    facultyInCharge: 'Dr. Ritu Gupta',
    emailId: 'ritu@iitj.ac.in',
    status: 'maintenance',
    phoneNo: '0291 2801308',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '19',
    name: 'Chemisorption',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Altamira Instruments',
    model: 'AMI 300',
    location: '111 Chemistry Building',
    facultyInCharge: 'Dr. Ritu Gupta',
    emailId: 'ritu@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 2801308',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '20',
    name: 'SQUID',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Quantum Design',
    model: 'MPMS 3',
    location: 'Room No. 112 Chemistry Building',
    facultyInCharge: 'Dr. Durgamadhab Mishra',
    emailId: 'durgamadhab@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 2801610',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '21',
    name: 'PPMS Dynacool',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Quantum Design',
    model: 'Model 6000',
    location: 'Room No. 112 Chemistry Building',
    facultyInCharge: 'Dr. Durgamadhab Mishra',
    emailId: 'durgamadhab@iitj.ac.in',
    status: 'active',
    phoneNo: '0291 2801610',
    slot: '2',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '22',
    name: 'Bench top flow cytometer',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'BD Bioscience',
    model: 'FACS Aria III',
    location: 'Room No. 112 Chemistry Building',
    facultyInCharge: 'Dr. Amit Mishra',
    emailId: 'amit@iitj.ac.in',
    status: 'active',
    phoneNo: '(91 291) 2801206',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '23',
    name: 'high-speed Centrifuge',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'Beckman Coulter',
    model: 'Avanti-J-30-I',
    location: 'Room No. 112 Chemistry Building',
    facultyInCharge: 'Dr. Amit Mishra',
    emailId: 'amit@iitj.ac.in',
    status: 'active',
    phoneNo: '(91 291) 2801206',
    slot: '3',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
  {
    id: '24',
    name: 'Freezer (-150 degree)',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Venenatis lectus magna fringilla urna.',
    make: 'ThermoFisher Scientific',
    model: '8121 PLC-230 LP',
    location: 'Room No. 112 Chemistry Building',
    facultyInCharge: 'Dr. Jayita sarkar',
    emailId: 'jsarkar@iitj.ac.in',
    phoneNo: '(91 291) 280 1343',
    status: 'maintenance',
    slot: '1',
    token: '500',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis. Risus at ultrices mi tempus imperdiet nulla.',
  },
];
export function BookingsPage() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<IEquipment>();

  return (
    <main className="space-y-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedEquipment ? selectedEquipment.name : 'Select Equipment...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[96vw] p-0 md:w-[72vw] lg:w-[67vw]">
          <Command>
            <CommandInput placeholder="Search Equipment..." />
            <CommandEmpty>No Equipment found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {equipmentData.map((eqipment) => (
                  <CommandItem
                    key={eqipment.id}
                    value={eqipment.name.toLowerCase()}
                    onSelect={(currentValue) => {
                      console.log({ currentValue });

                      setValue(currentValue === value ? '' : currentValue);
                      const item = equipmentData.find((eqipment) => eqipment.name.toLowerCase() === currentValue);
                      setSelectedEquipment(item);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === eqipment.name.toLowerCase() ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {eqipment.name}
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="w-full">
        {selectedEquipment ? (
          <EquipmentCard equipment={selectedEquipment} />
        ) : (
          <div className="flex  h-24 items-center justify-center border-2 border-dashed">
            <h5>No Equipment Selelcted</h5>
          </div>
        )}
      </div>
      <Maintainance />
    </main>
  );
}

function EquipmentCard({ equipment }: { equipment: IEquipment }) {
  const router = useRouter();

  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <Card className="animate-fade-down animate-infinite ">
      <CardHeader>
        <CardTitle className="text-primary">{equipment.name}</CardTitle>
        <CardDescription>{equipment.description}</CardDescription>
        <CardDescription>
          <strong>Location</strong>: {equipment.location}
        </CardDescription>
        {/* <CardDescription>
          <strong>Lab Hours</strong>: {equipment.slot} Hr
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <CardDescription className="flex items-center justify-start gap-4">
          Lab Hours
          <strong> 9:00 am</strong>
          <p>to</p>
          <strong>5:30 pm</strong>
        </CardDescription>
        {/* <div className="w-full space-y-2">
            {events
              .filter((event) => event.available && event.instrumentId === equipment.id)
              .map((event, index) => (
                <div
                  className="flex w-full items-center justify-between  rounded border border-double bg-gray-100 px-2 py-2 md:w-1/3 lg:w-1/4"
                  key={index}
                >
                  <p> {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p>{event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))}
          </div> */}
      </CardContent>
      <CardFooter>
        <Button onClick={() => router.push(`/dashboard/${equipment.id}`)}>Request</Button>
      </CardFooter>
    </Card>
  );
}
