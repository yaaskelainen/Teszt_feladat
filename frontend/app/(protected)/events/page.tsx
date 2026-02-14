'use client';

import React from 'react';
import { useEvents } from '@/lib/hooks/useEvents';
import { EventList } from '@/components/events/EventList';
import { EventForm } from '@/components/events/EventForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Event } from '@/types/api';

export default function EventsPage() {
    const { events, isLoading, error, createEvent, updateEvent, deleteEvent } = useEvents();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingEvent, setEditingEvent] = React.useState<Event | null>(null);

    const handleCreateClick = () => {
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (event: Event) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        try {
            if (editingEvent) {
                await updateEvent(editingEvent.id, { description: data.description });
            } else {
                await createEvent(data);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Operation failed', err);
        }
    };

    const handleDeleteClick = async (id: string) => {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                await deleteEvent(id);
            } catch (err) {
                console.error('Delete failed', err);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                    <p className="text-gray-500">Manage your upcoming events and schedules.</p>
                </div>
                <Button onClick={handleCreateClick} className="gap-2">
                    <span>➕</span> Create Event
                </Button>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <EventList
                events={events}
                isLoading={isLoading}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingEvent ? 'Edit Event Description' : 'Create New Event'}
            >
                <EventForm
                    onSubmit={handleFormSubmit}
                    initialData={editingEvent || undefined}
                    isEditing={!!editingEvent}
                    isLoading={isLoading}
                />

                {editingEvent && (
                    <p className="mt-4 text-[10px] text-gray-400 italic">
                        Note: Only description can be updated for existing events.
                    </p>
                )}
            </Modal>
        </div>
    );
}
