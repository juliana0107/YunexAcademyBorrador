import { Inbox } from 'lucide-react';

interface Props {
  message?: string;
}

export function NoDataState({ message = 'Sin datos disponibles' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
        <Inbox className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  );
}