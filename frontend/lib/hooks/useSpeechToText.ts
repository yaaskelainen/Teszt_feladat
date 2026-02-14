/**
 * useSpeechToText Hook
 * Uses the Web Speech API for browser-native speech recognition.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useSpeechToText() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Initialize SpeechRecognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('Speech recognition not supported in this browser.');
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
            if (event.error === 'not-allowed') {
                alert('Microphone access was denied.');
            }
        };

        recognitionRef.current.onend = () => {
            setIsRecording(false);
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startRecording = useCallback(() => {
        if (!recognitionRef.current) {
            alert('Speech recognition not supported in this browser.');
            return;
        }

        setTranscript('');
        setIsRecording(true);
        try {
            recognitionRef.current.start();
        } catch (err) {
            console.error('Failed to start recognition:', err);
            setIsRecording(false);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
    }, []);

    return {
        isRecording,
        transcript,
        startRecording,
        stopRecording,
    };
}
