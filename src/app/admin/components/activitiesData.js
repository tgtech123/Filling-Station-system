import React from 'react';
import { 
  FileText, 
  FileEdit, 
  AlertTriangle, 
  CreditCard, 
  Clock, 
  XCircle, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';

// Icon mapping
export const activityIcons = {
  registration: <FileText className="w-4 h-4" />,
  update: <FileEdit className="w-4 h-4" />,
  alert: <AlertTriangle className="w-4 h-4" />,
  payment: <CreditCard className="w-4 h-4" />,
  expired: <Clock className="w-4 h-4" />,
  suspended: <XCircle className="w-4 h-4" />,
  failed: <AlertCircle className="w-4 h-4" />,
  reactivated: <CheckCircle className="w-4 h-4" />
};

// Recent activities data
export const activitiesData = [
  {
    id: 1,
    eventType: 'Station registration',
    icon: 'registration',
    description: 'Shell Downtown Hub registered in Austin, TX',
    stationUser: 'Shell Downtown Hub',
    status: 'Info',
    statusColor: 'blue',
    dateTime: '2025-06-19, 14:32'
  },
  {
    id: 2,
    eventType: 'Updated subscription',
    icon: 'update',
    description: 'Manual subscription plan adjustment',
    stationUser: 'General Admin',
    status: 'Info',
    statusColor: 'blue',
    dateTime: '2025-06-19, 14:32'
  },
  {
    id: 3,
    eventType: 'System alert',
    icon: 'alert',
    description: 'High volume of failed payment attempts det...',
    stationUser: 'System',
    status: 'Critical',
    statusColor: 'red',
    dateTime: '2025-06-19, 14:32'
  },
  {
    id: 4,
    eventType: 'Subscription payment',
    icon: 'payment',
    description: 'Monthly subscription payment processed',
    stationUser: 'BP Highway Express',
    status: 'Success',
    statusColor: 'green',
    dateTime: '2025-06-19, 14:32'
  },
  {
    id: 5,
    eventType: 'Subscription expired',
    icon: 'expired',
    description: 'Plus plan subscription expired - renewal requ...',
    stationUser: 'BP Highway Express',
    status: 'Warning',
    statusColor: 'orange',
    dateTime: '2025-06-19, 14:32'
  },
  {
    id: 6,
    eventType: 'Station suspended',
    icon: 'suspended',
    description: 'Station suspended due to non-payment',
    stationUser: 'BP Highway Express',
    status: 'Critical',
    statusColor: 'red',
    dateTime: '2025-06-19, 14:32'
  },
  {
    id: 7,
    eventType: 'Payment failed',
    icon: 'failed',
    description: 'Payment method declined',
    stationUser: 'BP Highway Express',
    status: 'Critical',
    statusColor: 'red',
    dateTime: '2025-06-19, 14:32'
  },
  {
    id: 8,
    eventType: 'Station reactivated',
    icon: 'reactivated',
    description: 'Station reactivated after payment verification',
    stationUser: 'BP Highway Express',
    status: 'Success',
    statusColor: 'green',
    dateTime: '2025-06-19, 14:32'
  }
];

