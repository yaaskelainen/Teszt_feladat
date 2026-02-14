/**
 * EventForm Component (UT-COMP-006)
 * Handles creating and editing event data
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

// Local schema adjustment to handle string input from datetime-local
const eventFormSchema = z.object({
    title: z.string().min(1, 'Title is required').max(150),
    occurrence: z.string().min(1, 'Date and time are required').refine(
        (val) => new Date(val) > new Date(),
        'Event date must be in the future'
    ),
    description: z.string().max(5000).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
    onSubmit: (data: any) => Promise<void>;
    initialData?: Partial<EventFormValues>;
    isEditing?: boolean;
    isLoading?: boolean;
}

import { Mic, MicOff } from 'lucide-react';
import { useSpeechToText } from '@/lib/hooks/useSpeechToText';
import { cn } from '@/lib/utils/cn';

/**
 * EventForm Component
 * 
 * Implements REQ-EVENT-003: Event CRUD Interface
 * Handles creation and updates of events.
 * 
 * Features:
 * - Field Validation (REQ-SEC-001): Title, Date (future-only), Description.
 * - Local to ISO Date conversion (REQ-LOGIC-002)
 * - Loading state handling (REQ-UI-003)
 * - Speech-to-Text support for description (REQ-UI-007)
 * 
 * Tested by: `frontend/components/events/EventForm.test.tsx`
 */
export function EventForm({ onSubmit, initialData, isEditing = false, isLoading = false }: EventFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: initialData?.title || '',
            occurrence: initialData?.occurrence ? new Date(initialData.occurrence).toISOString().slice(0, 16) : '',
            description: initialData?.description || '',
        },
    });

    const { isRecording, transcript, startRecording, stopRecording } = useSpeechToText();
    const [lastDescription, setLastDescription] = React.useState(initialData?.description || '');
    const description = watch('description');

    // Update description when transcript changes during recording
    React.useEffect(() => {
        if (isRecording) {
            setValue('description', lastDescription + transcript);
        }
    }, [transcript, isRecording, lastDescription, setValue]);

    const handleToggleRecording = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isRecording) {
            stopRecording();
        } else {
            setLastDescription(description ? description + ' ' : '');
            startRecording();
        }
    };

    const handleFormSubmit = async (values: EventFormValues) => {
        if (isRecording) stopRecording();
        // Convert local time string to ISO
        const isoDate = new Date(values.occurrence).toISOString();
        await onSubmit({ ...values, occurrence: isoDate });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Event' : 'Create Event'}
            </h2>

            <Input
                id="title"
                label="Event Title"
                placeholder="e.g. Quarterly Review"
                error={errors.title?.message}
                {...register('title')}
            />

            <Input
                id="occurrence"
                label="Date and Time"
                type="datetime-local"
                error={errors.occurrence?.message}
                {...register('occurrence')}
            />

            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <button
                        type="button"
                        onClick={handleToggleRecording}
                        className={cn(
                            "flex h-7 px-2 items-center gap-1.5 rounded-md text-[10px] font-medium transition-all",
                            isRecording
                                ? "bg-red-100 text-red-600 animate-pulse"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                        )}
                        title={isRecording ? "Stop Recording" : "Use Voice Input"}
                    >
                        {isRecording ? <MicOff size={12} /> : <Mic size={12} />}
                        {isRecording ? "Recording..." : "Voice Input"}
                    </button>
                </div>
                <textarea
                    id="description"
                    className={`min-h-[100px] w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.description ? 'border-red-500' : ''
                        }`}
                    placeholder="Describe the event..."
                    {...register('description')}
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
                {isEditing ? 'Update Event' : 'Create Event'}
            </Button>
        </form>
    );
}
