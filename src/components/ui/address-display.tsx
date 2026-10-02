import React from 'react';
import { BusinessAddress } from '@/api/types';
import { formatAddress, formatAddressMultiline } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface AddressDisplayProps {
  address: BusinessAddress;
  variant?: 'inline' | 'multiline' | 'card';
  showIcon?: boolean;
  className?: string;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  variant = 'inline',
  showIcon = false,
  className = '',
}) => {
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <MapPin className="h-4 w-4 text-muted-foreground" />}
        <span className="text-sm text-muted-foreground">
          {formatAddress(address)}
        </span>
      </div>
    );
  }

  if (variant === 'multiline') {
    const lines = formatAddressMultiline(address);
    return (
      <div className={`space-y-1 ${className}`}>
        {showIcon && (
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Address</span>
          </div>
        )}
        {lines.map((line, index) => (
          <div key={index} className="text-sm text-muted-foreground">
            {line}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    const lines = formatAddressMultiline(address);
    return (
      <div className={`p-4 bg-muted/50 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Business Address</span>
        </div>
        <div className="space-y-1">
          {lines.map((line, index) => (
            <div key={index} className="text-sm text-muted-foreground">
              {line}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}; 