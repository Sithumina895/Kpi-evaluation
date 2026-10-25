import React from 'react';
import {
  Stethoscope,
  HeartPulse,
  Syringe,
  Activity,
  Pill,
  Microscope,
  Scan,
  Utensils,
  ShieldCheck,
  DollarSign,
  Server,
  Users,
  Cpu,
  Building2,
  Sparkles,
  Megaphone,
  Award,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

interface DepartmentIconProps extends LucideProps {
  name: string;
}

export const DepartmentIcon: React.FC<DepartmentIconProps> = ({ name, ...props }) => {
  const iconMap: Record<string, React.ElementType> = {
    Stethoscope,
    HeartPulse,
    Syringe,
    Activity,
    Pill,
    Microscope,
    Scan,
    Utensils,
    ShieldCheck,
    DollarSign,
    Server,
    Users,
    Cpu,
    Building2,
    Sparkles,
    Megaphone,
    Award,
  };

  const Component = iconMap[name] || HelpCircle;
  return <Component {...props} />;
};
